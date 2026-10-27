package no.nav.sosialhjelp.fagsystem.auth

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import no.nav.sosialhjelp.fagsystem.TexasConfig

/**
 * Klient mot Texas (Nais token-sidecar). Texas cacher tokens selv,
 * så vi kan kalle den for hver forespørsel. Tokens logges aldri.
 */
class TexasClient(
    private val config: TexasConfig,
    private val httpClient: HttpClient,
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class TokenResponse(val access_token: String)

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class IntrospectionResponse(
        val active: Boolean,
        val azp: String? = null,
        val aud: Any? = null,
    )

    suspend fun maskinportenToken(scope: String): String {
        val response =
            httpClient.post(config.tokenEndpoint) {
                contentType(ContentType.Application.Json)
                setBody(mapOf("identity_provider" to "maskinporten", "target" to scope))
            }
        check(response.status.isSuccess()) { "Henting av Maskinporten-token feilet: ${response.status}" }
        return response.body<TokenResponse>().access_token
    }

    suspend fun introspectAzure(token: String): IntrospectionResponse =
        httpClient
            .post(config.introspectionEndpoint) {
                contentType(ContentType.Application.Json)
                setBody(mapOf("identity_provider" to "azuread", "token" to token))
            }.body()
}
