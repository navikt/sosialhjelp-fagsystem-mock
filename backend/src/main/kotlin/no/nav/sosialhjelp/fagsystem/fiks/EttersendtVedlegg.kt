package no.nav.sosialhjelp.fagsystem.fiks

import com.fasterxml.jackson.databind.JsonNode

data class EttersendtVedlegg(
    val type: String?,
    val tilleggsinfo: String?,
    val status: String?,
    val hendelseType: String?,
    val hendelseReferanse: String?,
    val antallFiler: Int,
) {
    companion object {
        fun fraVedleggJson(node: JsonNode): List<EttersendtVedlegg> =
            node.path("vedlegg")
                .takeIf(JsonNode::isArray)
                ?.map { vedlegg ->
                    EttersendtVedlegg(
                        type = vedlegg.path("type").asText(null),
                        tilleggsinfo = vedlegg.path("tilleggsinfo").asText(null)?.take(500),
                        status = vedlegg.path("status").asText(null),
                        hendelseType = vedlegg.path("hendelseType").asText(null),
                        hendelseReferanse = vedlegg.path("hendelseReferanse").asText(null),
                        antallFiler = vedlegg.path("filer").size(),
                    )
                }
                ?: emptyList()
    }
}
