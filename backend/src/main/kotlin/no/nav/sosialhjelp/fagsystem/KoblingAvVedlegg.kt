package no.nav.sosialhjelp.fagsystem

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.databind.node.ObjectNode
import no.nav.sosialhjelp.fagsystem.fiks.EttersendtVedlegg
import java.util.Locale

object KoblingAvVedlegg {
    fun nyeHendelser(soker: JsonNode, vedlegg: List<EttersendtVedlegg>, tidspunkt: String): List<JsonNode> {
        val opplastet = vedlegg.filter { it.status.normalisert() == "lastetopp" }
        val hendelser = soker.path("hendelser").toList()
        return oppfylteKrav(hendelser, opplastet, tidspunkt) + listOfNotNull(oppdatertEtterspurt(hendelser, opplastet, tidspunkt))
    }

    /** Krav som har fått vedlegg settes til OPPFYLT. Bruker siste hendelse per krav. */
    private fun oppfylteKrav(hendelser: List<JsonNode>, vedlegg: List<EttersendtVedlegg>, tidspunkt: String): List<JsonNode> {
        val kravVedlegg = vedlegg.filter { it.hendelseType.normalisert() == "dokumentasjonkrav" }
        return hendelser
            .filter { it.tekst("type") == "dokumentasjonkrav" }
            .associateBy { it.tekst("dokumentasjonkravreferanse") } // siste hendelse per krav vinner
            .values
            .filter { it.tekst("status") != "OPPFYLT" && it.tekst("status") != "ANNULLERT" }
            .filter { krav -> kravVedlegg.any { it.gjelderKrav(krav) } }
            .map { krav -> (krav.deepCopy<JsonNode>() as ObjectNode).put("status", "OPPFYLT").put("hendelsestidspunkt", tidspunkt) }
    }

    /** Ny dokumentasjonEtterspurt uten dokumentene som er levert, og uten forvaltningsbrev. Null hvis ingenting er levert. */
    private fun oppdatertEtterspurt(hendelser: List<JsonNode>, vedlegg: List<EttersendtVedlegg>, tidspunkt: String): JsonNode? {
        val siste = hendelser.lastOrNull { it.tekst("type") == "dokumentasjonEtterspurt" } ?: return null
        val etterspurtVedlegg = vedlegg.filter { it.hendelseType.normalisert() == "dokumentasjonetterspurt" }
        val dokumenter = siste.path("dokumenter").toList()
        val gjenstaende = dokumenter.filterNot { dokument -> etterspurtVedlegg.any { it.gjelderDokument(dokument) } }
        if (gjenstaende.size == dokumenter.size) return null
        return JsonNodeFactory.instance.objectNode().apply {
            put("type", "dokumentasjonEtterspurt")
            put("hendelsestidspunkt", tidspunkt)
            putArray("dokumenter").addAll(gjenstaende)
            putArray("vedlegg")
        }
    }

    // Med referanse: match på referansen. Uten: match på type og tilleggsinfo, slik innsyn gjør.
    private fun EttersendtVedlegg.gjelderKrav(krav: JsonNode) =
        if (!hendelseReferanse.isNullOrEmpty()) hendelseReferanse == krav.tekst("dokumentasjonkravreferanse")
        else type == krav.tekst("tittel") && tilleggsinfo == krav.tekst("beskrivelse")

    private fun EttersendtVedlegg.gjelderDokument(dokument: JsonNode) =
        if (!hendelseReferanse.isNullOrEmpty()) hendelseReferanse == dokument.tekst("dokumentreferanse")
        else type == dokument.tekst("dokumenttype") && tilleggsinfo == dokument.tekst("tilleggsinformasjon")

    private fun JsonNode.tekst(felt: String): String? = path(felt).asText(null)
    private fun String?.normalisert() = this?.lowercase(Locale.ROOT)?.replace("_", "")
}
