package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.HttpRequestData
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf
import io.ktor.serialization.jackson.JacksonConverter
import kotlinx.coroutines.test.runTest
import no.nav.sosialhjelp.fagsystem.auth.TexasClient
import no.nav.sosialhjelp.fagsystem.fiks.FiksDigisosClient
import no.nav.sosialhjelp.fagsystem.fiks.FiksException
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertFailsWith

class FiksDigisosClientTest {
    private val orgId = UUID.fromString("22222222-2222-2222-2222-222222222222")
    private val nyId = UUID.fromString("33333333-3333-3333-3333-333333333333")
    private val fiksConfig =
        FiksConfig(
            baseUrl = "https://fiks.test",
            fiksOrgId = orgId,
            integrasjonId = UUID.fromString("11111111-1111-1111-1111-111111111111"),
            integrasjonPassord = "passord",
            maskinportenScope = "ks:fiks",
        )
    private val requests = mutableListOf<HttpRequestData>()

    private fun client(fiksStatus: HttpStatusCode = HttpStatusCode.OK): FiksDigisosClient {
        val json = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString())
        val engine =
            MockEngine { request ->
                requests += request
                when (request.url.host) {
                    "texas" -> respond("""{"access_token":"mp-token"}""", HttpStatusCode.OK, json)
                    else ->
                        if (request.url.encodedPath.endsWith("/ny")) {
                            respond("\"$nyId\"", fiksStatus, json)
                        } else {
                            respond("", if (fiksStatus == HttpStatusCode.OK) HttpStatusCode.Accepted else fiksStatus)
                        }
                }
            }
        val http =
            HttpClient(engine) {
                install(ContentNegotiation) { register(ContentType.Application.Json, JacksonConverter(objectMapper)) }
            }
        val texas = TexasClient(TexasConfig("http://texas/token", "http://texas/introspect"), http)
        return FiksDigisosClient(fiksConfig, texas, http)
    }

    @Test
    fun `opprettNySak sender fnr og Fiks-headere`() =
        runTest {
            client().opprettNySak("12345678910") shouldBe nyId

            val fiksKall = requests.single { it.url.host == "fiks.test" }
            fiksKall.url.encodedPath shouldBe "/digisos/api/v1/$orgId/ny"
            fiksKall.url.parameters["sokerFnr"] shouldBe "12345678910"
            fiksKall.headers["Authorization"] shouldBe "Bearer mp-token"
            fiksKall.headers["IntegrasjonId"] shouldBe fiksConfig.integrasjonId.toString()
            fiksKall.headers["IntegrasjonPassord"] shouldBe "passord"
        }

    @Test
    fun `oppdaterSak poster body uendret`() =
        runTest {
            val body = """{"type":"$DIGISOS_SOKER_TYPE","sak":{"soker":{"hendelser":[]}}}"""
            client().oppdaterSak(nyId, body)

            val fiksKall = requests.single { it.url.host == "fiks.test" }
            fiksKall.url.encodedPath shouldBe "/digisos/api/v1/$orgId/$nyId"
            (fiksKall.body as TextContent).text shouldBe body
        }

    @Test
    fun `feil fra Fiks gir FiksException`() =
        runTest {
            val e = assertFailsWith<FiksException> { client(HttpStatusCode.Forbidden).oppdaterSak(nyId, "{}") }
            e.status shouldBe 403
        }

    @Test
    fun `ugyldig fnr avvises før kall`() =
        runTest {
            assertFailsWith<IllegalArgumentException> { client().opprettNySak("123") }
            requests.size shouldBe 0
        }
}
