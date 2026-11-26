package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.shouldBe
import kotlin.test.Test
import no.nav.sosialhjelp.fagsystem.fiks.EttersendtVedlegg

class KoblingAvVedleggTest {
    @Test
    fun `kobler krav og etterspurt dokument`() {
        val soker = objectMapper.readTree(
            """
            {
              "hendelser": [
                {
                  "type": "dokumentasjonkrav",
                  "hendelsestidspunkt": "2026-01-01T10:00:00Z",
                  "dokumentasjonkravreferanse": "krav-1",
                  "tittel": "Lønnsslipp",
                  "beskrivelse": "Siste lønnsslipp",
                  "status": "RELEVANT",
                  "frist": "2026-02-01",
                  "saksreferanse": "sak-1"
                },
                {
                  "type": "dokumentasjonEtterspurt",
                  "hendelsestidspunkt": "2026-01-02T10:00:00Z",
                  "dokumenter": [
                    {"dokumenttype": "Kontoutskrift", "tilleggsinformasjon": null, "dokumentreferanse": "dok-A"},
                    {"dokumenttype": "Leiekontrakt", "tilleggsinformasjon": "Oppdatert", "dokumentreferanse": "dok-B"}
                  ],
                  "vedlegg": [],
                  "forvaltningsbrev": {"referanse": {"type": "dokumentlager", "id": "brev-1"}}
                }
              ]
            }
            """.trimIndent(),
        )
        val vedlegg = listOf(
            EttersendtVedlegg("Lønnsslipp", "Siste lønnsslipp", "LastetOpp", "dokumentasjonkrav", "krav-1", 1),
            EttersendtVedlegg("Kontoutskrift", null, "LastetOpp", "dokumentasjonEtterspurt", "dok-A", 1),
        )

        val hendelser = KoblingAvVedlegg.hendelserForEttersendelse(soker, vedlegg, "2026-01-03T10:00:00Z")

        hendelser.size shouldBe 2
        hendelser[0].path("dokumentasjonkravreferanse").asText() shouldBe "krav-1"
        hendelser[0].path("status").asText() shouldBe "OPPFYLT"
        hendelser[0].path("hendelsestidspunkt").asText() shouldBe "2026-01-03T10:00:00Z"
        hendelser[0].path("tittel").asText() shouldBe "Lønnsslipp"
        hendelser[1].path("type").asText() shouldBe "dokumentasjonEtterspurt"
        hendelser[1].path("dokumenter").size() shouldBe 1
        hendelser[1].path("dokumenter").path(0).path("dokumentreferanse").asText() shouldBe "dok-B"
        hendelser[1].has("forvaltningsbrev") shouldBe false
    }
}
