package no.nav.sosialhjelp.fagsystem

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.JacksonConverter
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.path
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.micrometer.prometheusmetrics.PrometheusConfig
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import no.nav.sosialhjelp.fagsystem.api.digisosRoutes
import no.nav.sosialhjelp.fagsystem.auth.AzureAuth
import no.nav.sosialhjelp.fagsystem.auth.TexasClient
import no.nav.sosialhjelp.fagsystem.auth.azureAuthPlugin
import no.nav.sosialhjelp.fagsystem.db.Database
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import no.nav.sosialhjelp.fagsystem.fiks.FiksDigisosClient
import no.nav.sosialhjelp.fagsystem.fiks.FiksException
import no.nav.sosialhjelp.fagsystem.fiks.FiksIoMottak
import org.slf4j.LoggerFactory
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation as ClientContentNegotiation
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation as ServerContentNegotiation

private val log = LoggerFactory.getLogger("no.nav.sosialhjelp.fagsystem.Application")

val objectMapper: ObjectMapper =
    jacksonObjectMapper()
        .registerModule(JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

fun main() {
    embeddedServer(Netty, port = 8080) { module(AppConfig.fromEnv()) }.start(wait = true)
}

fun Application.module(config: AppConfig) {
    val runningInNais = System.getenv("NAIS_CLUSTER_NAME") != null
    check(!runningInNais || (config.azure != null && config.texas != null)) {
        "Azure og Texas må være konfigurert i Nais"
    }
    log.info("Starter med fiks=${config.fiks}, fiksIo=${config.fiksIo}")

    val dataSource = Database.dataSource(config.database)
    Database.migrate(dataSource)
    val repository = SakRepository(dataSource)

    val httpClient =
        HttpClient(CIO) {
            install(ClientContentNegotiation) { register(io.ktor.http.ContentType.Application.Json, JacksonConverter(objectMapper)) }
            expectSuccess = false
        }

    val texas = config.texas?.let { TexasClient(it, httpClient) }
    val fiksClient =
        if (config.fiks != null && texas != null) FiksDigisosClient(config.fiks, texas, httpClient) else null
    if (fiksClient == null) log.warn("Fiks er ikke konfigurert, kall mot Fiks vil feile med 503")

    val fiksIoMottak =
        if (config.fiksIo != null && config.fiks != null && texas != null) {
            FiksIoMottak(config.fiksIo, config.fiks, texas, repository, objectMapper).also {
                runCatching { it.start() }.onFailure { e ->
                    log.error("Kunne ikke starte Fiks IO-mottak: ${e.javaClass.simpleName}: ${e.message}")
                }
            }
        } else {
            log.warn("Fiks IO er ikke konfigurert (placeholder), mottak er ikke startet")
            null
        }

    val service = FagsystemService(repository, fiksClient, config.fiks?.fiksOrgId, objectMapper)
    val azureAuth = if (config.azure != null && texas != null) AzureAuth(texas, config.azure) else null
    val prometheus = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)

    install(MicrometerMetrics) { registry = prometheus }
    install(CallLogging) { filter { !it.request.path().startsWith("/internal") } }
    install(ServerContentNegotiation) {
        register(io.ktor.http.ContentType.Application.Json, JacksonConverter(objectMapper))
    }
    install(StatusPages) {
        exception<IllegalArgumentException> { call, e ->
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Ugyldig forespørsel")))
        }
        exception<IllegalStateException> { call, e ->
            log.warn("Tjenesten er ikke klar: ${e.message}")
            call.respond(HttpStatusCode.ServiceUnavailable, mapOf("error" to (e.message ?: "Ikke tilgjengelig")))
        }
        exception<FiksException> { call, e ->
            log.warn("Kall mot Fiks feilet: ${e.message} (status ${e.status})")
            call.respond(HttpStatusCode.BadGateway, mapOf("error" to "Fiks svarte ${e.status}"))
        }
        exception<Throwable> { call, e ->
            log.error("Uventet feil: ${e.javaClass.simpleName}", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Intern feil"))
        }
    }

    routing {
        get("/internal/isAlive") { call.respondText("ALIVE") }
        get("/internal/isReady") { call.respondText("READY") }
        get("/internal/prometheus") { call.respondText(prometheus.scrape()) }

        route("") {
            install(azureAuthPlugin(azureAuth))
            digisosRoutes(service)
        }
    }

    monitor.subscribe(ApplicationStopped) {
        fiksIoMottak?.close()
        fiksClient?.close()
        httpClient.close()
        dataSource.close()
    }
}
