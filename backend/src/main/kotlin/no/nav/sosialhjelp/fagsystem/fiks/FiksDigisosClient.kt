package no.nav.sosialhjelp.fagsystem.fiks

import io.ktor.client.HttpClient
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.header
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking
import no.ks.fiks.digisos.klient.DigisosApiImpl
import no.ks.fiks.digisos.klient.DigisosKlient
import no.ks.fiks.digisos.klient.model.FilMetadata
import no.ks.fiks.digisos.klient.model.FilOpplasting
import no.ks.fiks.streaming.klient.StreamingKlient
import no.ks.fiks.streaming.klient.authentication.AuthenticationStrategy
import no.ks.kryptering.CMSKrypteringImpl
import no.nav.sosialhjelp.fagsystem.FiksConfig
import no.nav.sosialhjelp.fagsystem.auth.TexasClient
import java.io.ByteArrayInputStream
import java.util.UUID

class FiksException(message: String, val status: Int) : RuntimeException(message)

/**
 * Autentisering: Maskinporten-token (via Texas) + IntegrasjonId/IntegrasjonPassord.
 * Filer krypteres med Fiks Dokumentlager sin offentlige nøkkel før opplasting
 * (håndteres av digisos-klient).
 */
class FiksDigisosClient(
    private val config: FiksConfig,
    private val texas: TexasClient,
    private val httpClient: HttpClient,
) : AutoCloseable {
    private val baseUrl = config.baseUrl.trimEnd('/')

    private val authStrategy =
        AuthenticationStrategy { request ->
            val token = runBlocking { texas.maskinportenToken(config.maskinportenScope) }
            request.headers {
                it.put("Authorization", "Bearer $token")
                it.put("IntegrasjonId", config.integrasjonId.toString())
                it.put("IntegrasjonPassord", config.integrasjonPassord)
            }
        }

    private val lazyKlient: Lazy<DigisosKlient> = lazy {
        DigisosKlient.builder()
            .digisosApi(DigisosApiImpl(StreamingKlient(authStrategy), baseUrl))
            .kryptering(CMSKrypteringImpl())
            .build()
    }

    private suspend fun HttpRequestBuilder.fiksAuth() {
        header("Authorization", "Bearer ${texas.maskinportenToken(config.maskinportenScope)}")
        header("IntegrasjonId", config.integrasjonId.toString())
        header("IntegrasjonPassord", config.integrasjonPassord)
    }

    /** Oppretter ny sak hos Fiks og returnerer digisosId. */
    suspend fun opprettNySak(sokerFnr: String): UUID {
        require(sokerFnr.matches(Regex("^[0-9]{11}$"))) { "Ugyldig fnr" }
        val response =
            httpClient.post("$baseUrl/digisos/api/v1/${config.fiksOrgId}/ny") {
                fiksAuth()
                parameter("sokerFnr", sokerFnr)
            }
        if (!response.status.isSuccess()) throw FiksException("opprettNySak feilet", response.status.value)
        return UUID.fromString(response.bodyAsText().trim().trim('"'))
    }

    /**
     * Sender komplett digisos-soker til Fiks. Body er DigisosSakApiModel:
     * {"type": "no.nav.digisos.digisos.soker.v1", "sak": {"soker": {...}}}
     */
    suspend fun oppdaterSak(digisosId: UUID, digisosSakApiModelJson: String) {
        val response =
            httpClient.post("$baseUrl/digisos/api/v1/${config.fiksOrgId}/$digisosId") {
                fiksAuth()
                contentType(ContentType.Application.Json)
                setBody(digisosSakApiModelJson)
            }
        if (!response.status.isSuccess()) throw FiksException("oppdaterSak feilet", response.status.value)
    }

    /** Krypterer og laster opp én fil. Returnerer dokumentlagerDokumentId. */
    fun lastOppFil(digisosId: UUID, filnavn: String, mimetype: String, data: ByteArray): UUID {
        val response =
            lazyKlient.value.krypterOgLastOppFiler(
                listOf(FilOpplasting(FilMetadata(filnavn, mimetype, data.size.toLong()), ByteArrayInputStream(data))),
                config.fiksOrgId,
                digisosId,
            )
        if (response.httpStatus() !in 200..299) throw FiksException("Filopplasting feilet", response.httpStatus())
        return response.result().single().dokumentlagerDokumentId()
    }

    override fun close() {
        if (lazyKlient.isInitialized()) lazyKlient.value.close()
    }
}
