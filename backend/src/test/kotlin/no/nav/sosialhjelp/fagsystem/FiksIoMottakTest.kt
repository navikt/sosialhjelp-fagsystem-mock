package no.nav.sosialhjelp.fagsystem

import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import no.ks.fiks.io.client.SvarSender
import no.ks.fiks.io.client.model.MeldingId
import no.ks.fiks.io.client.model.MottattMelding
import no.nav.sosialhjelp.fagsystem.auth.TexasClient
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import no.nav.sosialhjelp.fagsystem.fiks.FiksIoMottak
import no.nav.sosialhjelp.fagsystem.fiks.MELDINGSTYPE_ETTERSENDELSE
import no.nav.sosialhjelp.fagsystem.fiks.MELDINGSTYPE_ETTERSENDELSE_MOTTATT
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.UUID
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import kotlin.test.Test

class FiksIoMottakTest {
    @Test
    fun `behandler ettersendelse og bekrefter mottak`() {
        val digisosId = UUID.randomUUID()
        val service = mockk<FagsystemService>(relaxed = true)
        val mottak = nyttMottak(service)
        val melding = melding(digisosId)
        val svar = mockk<SvarSender>(relaxed = true)

        mottak.handle(melding, svar)

        coVerify {
            service.registrerEttersendelse(
                digisosId,
                any(),
                "ref",
                match { it.size == 1 && it[0].hendelseReferanse == "krav-1" },
            )
        }
        verify {
            svar.svar(MELDINGSTYPE_ETTERSENDELSE_MOTTATT)
            svar.ack()
        }
        verify(exactly = 0) { svar.nackWithRequeue() }
    }

    @Test
    fun `bekrefter ettersendelse selv om registrering feiler`() {
        val digisosId = UUID.randomUUID()
        val service = mockk<FagsystemService>(relaxed = true)
        coEvery { service.registrerEttersendelse(any(), any(), any(), any()) } throws RuntimeException("x")
        val mottak = nyttMottak(service)
        val melding = melding(digisosId)
        val svar = mockk<SvarSender>(relaxed = true)

        mottak.handle(melding, svar)

        coVerify(exactly = 1) { service.registrerEttersendelse(any(), any(), any(), any()) }
        verify {
            svar.svar(MELDINGSTYPE_ETTERSENDELSE_MOTTATT)
            svar.ack()
        }
        verify(exactly = 0) { svar.nackWithRequeue() }
    }

    private fun nyttMottak(service: FagsystemService) =
        FiksIoMottak(
            ioConfig = mockk<FiksIoConfig>(relaxed = true),
            fiksConfig = mockk<FiksConfig>(relaxed = true),
            texas = mockk<TexasClient>(relaxed = true),
            repository = mockk<SakRepository>(relaxed = true),
            objectMapper = objectMapper,
            service = service,
        )

    private fun melding(digisosId: UUID): MottattMelding {
        val melding = mockk<MottattMelding>()
        every { melding.meldingType } returns MELDINGSTYPE_ETTERSENDELSE
        every { melding.meldingId } returns MeldingId(UUID.randomUUID())
        every { melding.dekryptertZipStream } returns ZipInputStream(ByteArrayInputStream(zipBytes(digisosId)))
        return melding
    }

    private fun zipBytes(digisosId: UUID): ByteArray {
        val buffer = ByteArrayOutputStream()
        ZipOutputStream(buffer).use { zip ->
            zip.putNextEntry(ZipEntry("melding.json"))
            zip.write("""{"digisosId":"$digisosId","eksternRef":"ref"}""".toByteArray())
            zip.closeEntry()
            zip.putNextEntry(ZipEntry("vedlegg.json"))
            zip.write(
                """{"vedlegg":[{"type":"T","status":"LastetOpp","hendelseType":"dokumentasjonkrav","hendelseReferanse":"krav-1","filer":[{"filnavn":"a.pdf"}]}]}""".toByteArray(),
            )
            zip.closeEntry()
            zip.putNextEntry(ZipEntry("a.pdf"))
            zip.write(byteArrayOf(1, 2, 3))
            zip.closeEntry()
        }
        return buffer.toByteArray()
    }
}
