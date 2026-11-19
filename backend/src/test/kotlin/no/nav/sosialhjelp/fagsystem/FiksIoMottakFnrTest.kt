package no.nav.sosialhjelp.fagsystem

import com.fasterxml.jackson.databind.ObjectMapper
import kotlin.test.Test
import kotlin.test.assertEquals
import no.nav.sosialhjelp.fagsystem.fiks.lesSokerFnr

class FiksIoMottakFnrTest {
    private val objectMapper = ObjectMapper()

    @Test
    fun `leser gyldig soker fnr fra soknadsfil`() {
        val node = objectMapper.readTree(
            """{"version":"1","data":{"personalia":{"personIdentifikator":{"kilde":"system","verdi":"12345678910"}}}}""",
        )

        assertEquals("12345678910", lesSokerFnr(node))
    }

    @Test
    fun `returnerer null nar fnr-stien mangler`() {
        val node = objectMapper.readTree("""{"version":"1","data":{}}""")

        assertEquals(null, lesSokerFnr(node))
    }

    @Test
    fun `returnerer null nar fnr ikke er elleve siffer`() {
        val node = objectMapper.readTree(
            """{"data":{"personalia":{"personIdentifikator":{"verdi":"magna exercitation"}}}}""",
        )

        assertEquals(null, lesSokerFnr(node))
    }
}
