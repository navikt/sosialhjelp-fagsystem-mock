package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.shouldBe
import no.nav.sosialhjelp.fagsystem.fiks.lesFiksIoInnhold
import no.nav.sosialhjelp.fagsystem.fiks.lesSokerFnr
import java.io.ByteArrayOutputStream
import java.util.*
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import kotlin.test.Test

class FiksIoInnholdTest {
    @Test
    fun `leser relevante felter fra soknad`() {
        val digisosId = UUID.randomUUID()
        val zip = zipBytes(
            "metadata.json" to """{"digisosId":"$digisosId","eksternRef":"ref"}""",
            "soknad.json" to """{"data":{"personalia":{"personIdentifikator":{"verdi":"12345678910"}}}}"""
        )

        val melding = lesFiksIoInnhold(ZipInputStream(zip.inputStream()), objectMapper)

        melding.digisosId shouldBe digisosId
        melding.eksternRef shouldBe "ref"
        melding.sokerFnr shouldBe "12345678910"
        melding.vedlegg shouldBe null
    }

    @Test
    fun `leser vedlegg fra ettersendelse`() {
        val digisosId = UUID.randomUUID()
        val zip = zipBytes(
            "melding.json" to """{"digisosId":"$digisosId","eksternRef":"ref"}""",
            "vedlegg.json" to """{"vedlegg":[{"type":"T","status":"LastetOpp","hendelseType":"dokumentasjonkrav","hendelseReferanse":"krav-1","filer":[{}]}]}""",
            "a.pdf" to "pdf-innhold",
        )

        val melding = lesFiksIoInnhold(ZipInputStream(zip.inputStream()), objectMapper)

        melding.vedlegg?.size shouldBe 1
        melding.vedlegg?.first()?.hendelseReferanse shouldBe "krav-1"
    }

    @Test
    fun `leser gyldig soker fnr fra soknadsfil`() {
        val node = objectMapper.readTree(
            """{"version":"1","data":{"personalia":{"personIdentifikator":{"kilde":"system","verdi":"12345678910"}}}}""",
        )

        lesSokerFnr(node) shouldBe "12345678910"
    }

    @Test
    fun `returnerer null nar fnr-stien mangler`() {
        val node = objectMapper.readTree("""{"version":"1","data":{}}""")

        lesSokerFnr(node) shouldBe null
    }

    @Test
    fun `returnerer null nar fnr ikke er elleve siffer`() {
        val node = objectMapper.readTree(
            """{"data":{"personalia":{"personIdentifikator":{"verdi":"magna exercitation"}}}}""",
        )
        lesSokerFnr(node) shouldBe null
    }

    private fun zipBytes(vararg entries: Pair<String, String>): ByteArray {
        val buffer = ByteArrayOutputStream()
        ZipOutputStream(buffer).use { zip ->
            entries.forEach { (name, content) ->
                zip.putNextEntry(ZipEntry(name))
                zip.write(content.toByteArray())
                zip.closeEntry()
            }
        }
        return buffer.toByteArray()
    }
}
