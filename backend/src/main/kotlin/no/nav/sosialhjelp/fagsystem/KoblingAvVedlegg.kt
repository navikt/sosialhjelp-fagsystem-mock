package no.nav.sosialhjelp.fagsystem

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.databind.node.ObjectNode
import no.nav.sosialhjelp.fagsystem.fiks.EttersendtVedlegg
import java.util.Locale

/**
 * Kobler ettersendte vedlegg til dokumentasjonskrav og etterspurt dokumentasjon i innsynsfilen,
 * og lager hendelsene som skal legges til.
 */
object KoblingAvVedlegg {
    fun hendelserForEttersendelse(soker: JsonNode, vedlegg: List<EttersendtVedlegg>, tidspunkt: String): List<JsonNode> {
        val opplastet = vedlegg.filter { it.status.normalisert() == "lastetopp" }
        val hendelser = soker.path("hendelser").toList()
        return settKravOppfylt(hendelser, opplastet, tidspunkt) + listOfNotNull(oppdaterEtterspurt(hendelser, opplastet, tidspunkt))
    }

    /** Én dokumentasjonkrav-hendelse med status OPPFYLT for hvert krav som har fått vedlegg. */
    private fun settKravOppfylt(hendelser: List<JsonNode>, vedlegg: List<EttersendtVedlegg>, tidspunkt: String): List<JsonNode> {
        val kravVedlegg = vedlegg.filter { it.hendelseType.normalisert() == "dokumentasjonkrav" }
        return hendelser
            .filter { it.tekst("type") == "dokumentasjonkrav" }
            .associateBy { it.tekst("dokumentasjonkravreferanse") } // siste hendelse per krav er gjeldende
            .values
            .filter { it.tekst("status") != "OPPFYLT" && it.tekst("status") != "ANNULLERT" }
            .filter { krav -> kravVedlegg.any { !it.hendelseReferanse.isNullOrEmpty() && it.hendelseReferanse == krav.tekst("dokumentasjonkravreferanse") } }
            .map { krav -> (krav.deepCopy<JsonNode>() as ObjectNode).put("status", "OPPFYLT").put("hendelsestidspunkt", tidspunkt) }
    }

    /**
     * Ny dokumentasjonEtterspurt med dokumentene som ikke er sendt inn ennå. Tom liste hvis alt er sendt inn.
     * Null hvis ingen av de etterspurte dokumentene er sendt inn.
     */
    private fun oppdaterEtterspurt(hendelser: List<JsonNode>, vedlegg: List<EttersendtVedlegg>, tidspunkt: String): JsonNode? {
        val sisteEtterspurt = hendelser.lastOrNull { it.tekst("type") == "dokumentasjonEtterspurt" } ?: return null
        val etterspurtVedlegg = vedlegg.filter { it.hendelseType.normalisert() == "dokumentasjonetterspurt" }
        val etterspurteDokumenter = sisteEtterspurt.path("dokumenter").toList()
        val ikkeLevert = etterspurteDokumenter.filterNot { dokument -> etterspurtVedlegg.any {
            !it.hendelseReferanse.isNullOrEmpty() && it.hendelseReferanse == dokument.tekst("dokumentreferanse") }
        }
        if (ikkeLevert.size == etterspurteDokumenter.size) return null
        return JsonNodeFactory.instance.objectNode().apply {
            put("type", "dokumentasjonEtterspurt")
            put("hendelsestidspunkt", tidspunkt)
            putArray("dokumenter").addAll(ikkeLevert)
            putArray("vedlegg")
        }
    }

    private fun JsonNode.tekst(felt: String): String? = path(felt).asText(null)
    private fun String?.normalisert() = this?.lowercase(Locale.ROOT)?.replace("_", "")
}
