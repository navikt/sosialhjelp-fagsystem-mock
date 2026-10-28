package no.nav.sosialhjelp.fagsystem.api

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.server.application.install
import io.ktor.server.request.receiveMultipart
import io.ktor.server.request.receiveText
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.utils.io.jvm.javaio.toInputStream
import no.nav.sosialhjelp.fagsystem.FagsystemService
import no.nav.sosialhjelp.fagsystem.auth.AzureAuth
import no.nav.sosialhjelp.fagsystem.auth.azureAuthPlugin

private const val MAKS_FILSTORRELSE = 10L * 1024 * 1024

fun Route.digisosRoutes(
    service: FagsystemService,
    azureAuth: AzureAuth?,
) {
    route("/api/v1") {
        install(azureAuthPlugin(azureAuth))
        post("/digisosapi/oppdaterDigisosSak") {
            val fiksDigisosId = call.request.queryParameters["fiksDigisosId"]
            val fnr = call.request.queryParameters["fnr"]
            val digisosId = service.oppdaterDigisosSak(fiksDigisosId, fnr, call.receiveText())
            call.respond(mapOf("fiksDigisosId" to digisosId.toString()))
        }

        get("/digisosapi/{fiksDigisosId}/innsynsfil") {
            val soker = service.hentInnsynsfil(call.parameters["fiksDigisosId"]!!)
            if (soker == null) call.respond(HttpStatusCode.NotFound) else call.respond(soker)
        }

        post("/digisosapi/{fiksDigisosId}/filOpplasting") {
            val fiksDigisosId = call.parameters["fiksDigisosId"]!!
            var fil: Triple<String, String, ByteArray>? = null
            call.receiveMultipart(formFieldLimit = MAKS_FILSTORRELSE).forEachPart { part ->
                if (part is PartData.FileItem && part.name == "file" && fil == null) {
                    val bytes = part.provider().toInputStream().readNBytes((MAKS_FILSTORRELSE + 1).toInt())
                    require(bytes.size <= MAKS_FILSTORRELSE) { "Filen er for stor" }
                    fil = Triple(
                        part.originalFileName ?: "fil.pdf",
                        part.contentType?.toString() ?: "application/pdf",
                        bytes,
                    )
                }
                part.dispose()
            }
            val (filnavn, mimetype, data) = requireNotNull(fil) { "Mangler fil i feltet 'file'" }
            val id = service.lastOppFil(fiksDigisosId, filnavn, mimetype, data)
            call.respondText(id.toString(), ContentType.Text.Plain)
        }

        get("/saker") {
            call.respond(
                service.hentSaker().map {
                    mapOf(
                        "fiksDigisosId" to it.digisosId.toString(),
                        "kilde" to it.kilde.name,
                        "opprettet" to it.opprettet.toInstant().toString(),
                        "oppdatert" to it.oppdatert.toInstant().toString(),
                    )
                },
            )
        }
    }
}
