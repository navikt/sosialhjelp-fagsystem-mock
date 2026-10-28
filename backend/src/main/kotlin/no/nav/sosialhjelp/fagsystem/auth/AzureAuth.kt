package no.nav.sosialhjelp.fagsystem.auth

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.createRouteScopedPlugin
import io.ktor.server.request.header
import io.ktor.server.response.respond
import no.nav.sosialhjelp.fagsystem.AzureConfig
import org.slf4j.LoggerFactory

/**
 * Validerer Azure AD-token via Texas og sjekker at kallende app (azp) er
 * forhåndsautorisert i AZURE_APP_PRE_AUTHORIZED_APPS. Kun fagsystem-mock-fiks
 * skal stå der (styres av accessPolicy.inbound i nais).
 */
class AzureAuth(
    private val texas: TexasClient,
    azure: AzureConfig,
) {
    private val log = LoggerFactory.getLogger(AzureAuth::class.java)

    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class PreAuthorizedApp(val name: String, val clientId: String)

    private val tillatteClientIds: Set<String> =
        jacksonObjectMapper().readValue<List<PreAuthorizedApp>>(azure.preAuthorizedApps).map { it.clientId }.toSet()

    suspend fun erAutorisert(call: ApplicationCall): Boolean {
        val token =
            call.request.header("Authorization")
                ?.takeIf { it.startsWith("Bearer ") }
                ?.removePrefix("Bearer ")
                ?.trim()
                ?: return false
        val result = runCatching { texas.introspectAzure(token) }.getOrElse {
            log.warn("Token-introspeksjon feilet: ${it.javaClass.simpleName}")
            return false
        }
        if (!result.active) return false
        val azp = result.azp ?: return false
        if (azp !in tillatteClientIds) {
            log.warn("Avviste kall fra ikke-autorisert app (azp)")
            return false
        }
        return true
    }
}

fun azureAuthPlugin(auth: AzureAuth?) =
    createRouteScopedPlugin("AzureAuth") {
        onCall { call ->
            if (auth == null) return@onCall // Lokal utvikling uten Azure
            if (!auth.erAutorisert(call)) {
                call.respond(HttpStatusCode.Unauthorized)
            }
        }
    }
