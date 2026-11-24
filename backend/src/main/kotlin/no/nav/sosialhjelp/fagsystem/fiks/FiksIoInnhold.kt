package no.nav.sosialhjelp.fagsystem.fiks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.OutputStream
import java.util.UUID
import java.util.zip.ZipInputStream

/** Utdrag fra en Digisos-melding over Fiks IO. Inneholder søkers fnr ved søknad. Vedleggsfiler (PDF) leses aldri. */
internal data class FiksIoInnhold(
    val digisosId: UUID?,
    val eksternRef: String?,
    val sokerFnr: String?, // bare søknad (soknad.json)
    val vedlegg: List<EttersendtVedlegg>?, // bare ettersendelse (vedlegg.json)
)

internal const val MAKS_JSON_BYTES = 1_048_576

/**
 * Henter feltene over fra JSON-filene i meldingen: metadatafilen gir digisosId og eksternRef,
 * soknad.json gir fnr og vedlegg.json gir vedleggene.
 */
internal fun lesFiksIoInnhold(zip: ZipInputStream, objectMapper: ObjectMapper): FiksIoInnhold {
    val jsonFiler = lesJsonFiler(zip, objectMapper)
    val metadata = jsonFiler.firstOrNull { it.hasNonNull("digisosId") }
    return FiksIoInnhold(
        digisosId = metadata?.let { UUID.fromString(it.path("digisosId").asText()) },
        eksternRef = metadata?.path("eksternRef")?.asText(null),
        sokerFnr = jsonFiler.firstNotNullOfOrNull(::lesSokerFnr),
        vedlegg = jsonFiler.firstOrNull { it.path("vedlegg").isArray }?.let(EttersendtVedlegg::fraVedleggJson),
    )
}

/**
 * Leser JSON-filene i meldingen (maks MAKS_JSON_BYTES hver). Andre filer leses ut uten å se på innholdet.
 * Strømmen må leses helt ut, ellers feiler skrivetråden i fiks-io-klienten med "Pipe closed".
 */
private fun lesJsonFiler(zip: ZipInputStream, objectMapper: ObjectMapper): List<JsonNode> {
    val jsonFiler = mutableListOf<JsonNode>()
    zip.use {
        while (true) {
            val entry = zip.nextEntry ?: break
            val bytes = if (entry.name.endsWith(".json")) zip.readNBytes(MAKS_JSON_BYTES + 1) else null
            zip.transferTo(OutputStream.nullOutputStream())
            if (bytes == null || bytes.size > MAKS_JSON_BYTES) continue
            runCatching { objectMapper.readTree(bytes) }.getOrNull()?.let(jsonFiler::add)
        }
    }
    return jsonFiler
}

internal fun lesSokerFnr(node: JsonNode): String? =
    node.path("data")
        .path("personalia")
        .path("personIdentifikator")
        .path("verdi")
        .asText(null)
        ?.takeIf { it.matches(Regex("^[0-9]{11}$")) }
