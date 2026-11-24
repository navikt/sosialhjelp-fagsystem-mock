package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.shouldBe
import java.io.ByteArrayOutputStream
import java.util.UUID
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import kotlin.test.Test
import no.nav.sosialhjelp.fagsystem.fiks.lesFiksIoInnhold

class FiksIoInnholdTest {
    @Test
    fun `leser relevante felter fra soknad og ignorerer pdf`() {
        val digisosId = UUID.randomUUID()
        val zip = zipBytes(
            "metadata.json" to """{"digisosId":"$digisosId","eksternRef":"ref"}""",
            "soknad.json" to """{"data":{"personalia":{"personIdentifikator":{"verdi":"12345678910"}}}}""",
            "soknad.pdf" to "pdf-innhold",
        )

        val melding = lesFiksIoInnhold(ZipInputStream(zip.inputStream()), objectMapper)

        melding.digisosId shouldBe digisosId
        melding.eksternRef shouldBe "ref"
        melding.sokerFnr shouldBe "12345678910"
        melding.vedlegg shouldBe null
    }

    @Test
    fun `leser vedlegg fra ettersendelse uten sokerfnr`() {
        val digisosId = UUID.randomUUID()
        val zip = zipBytes(
            "melding.json" to """{"digisosId":"$digisosId","eksternRef":"ref"}""",
            "vedlegg.json" to """{"vedlegg":[{"type":"T","status":"LastetOpp","hendelseType":"dokumentasjonkrav","hendelseReferanse":"krav-1","filer":[{}]}]}""",
            "a.pdf" to "pdf-innhold",
        )

        val melding = lesFiksIoInnhold(ZipInputStream(zip.inputStream()), objectMapper)

        melding.vedlegg?.size shouldBe 1
        melding.vedlegg?.first()?.hendelseReferanse shouldBe "krav-1"
        melding.sokerFnr shouldBe null
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
