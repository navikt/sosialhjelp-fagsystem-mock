package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.coVerifyOrder
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import kotlinx.coroutines.test.runTest
import no.nav.sosialhjelp.fagsystem.db.Kilde
import no.nav.sosialhjelp.fagsystem.db.Sak
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import no.nav.sosialhjelp.fagsystem.fiks.FiksDigisosClient
import java.time.OffsetDateTime
import java.util.UUID
import kotlin.test.Test

class FagsystemServiceTest {
    private val orgId = UUID.randomUUID()
    private val id = UUID.randomUUID()
    private val repository = mockk<SakRepository>(relaxed = true)
    private val fiks = mockk<FiksDigisosClient>(relaxed = true)
    private val service = FagsystemService(repository, fiks, orgId, objectMapper)

    private val sak =
        Sak(id, orgId, Kilde.FIKS_IO, "ref", OffsetDateTime.now(), OffsetDateTime.now())

    @Test
    fun `oppretter initiell innsynsfil hos Fiks og lagrer den`() =
        runTest {
            every { repository.hent(id) } returns sak
            every { repository.hentDigisosSoker(id) } returns null
            val json = slot<String>()
            coEvery { fiks.oppdaterSak(id, capture(json)) } returns Unit

            service.opprettInitiellInnsynsfil(id)

            val soker = objectMapper.readTree(json.captured)
            soker.path("type").asText() shouldBe DIGISOS_SOKER_TYPE
            soker.path("sak").path("soker").path("hendelser").path(0).path("status").asText() shouldBe "MOTTATT"
            soker.path("sak").path("soker").path("avsender").path("systemnavn").asText() shouldBe "sosialhjelp-fagsystem-mock"
            coVerifyOrder {
                fiks.oppdaterSak(id, json.captured)
                repository.oppdaterDigisosSoker(id, json.captured)
            }
        }

    @Test
    fun `eksisterende innsynsfil gjør ingenting`() =
        runTest {
            every { repository.hent(id) } returns sak
            every { repository.hentDigisosSoker(id) } returns """{"type":"behold"}"""

            service.opprettInitiellInnsynsfil(id)

            coVerify(exactly = 0) { fiks.oppdaterSak(any(), any()) }
            verify(exactly = 0) { repository.oppdaterDigisosSoker(any(), any()) }
        }

    @Test
    fun `ukjent sak gjør ingenting`() =
        runTest {
            every { repository.hent(id) } returns null

            service.opprettInitiellInnsynsfil(id)

            coVerify(exactly = 0) { fiks.oppdaterSak(any(), any()) }
            verify(exactly = 0) { repository.oppdaterDigisosSoker(any(), any()) }
        }
}
