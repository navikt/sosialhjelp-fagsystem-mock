package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import no.nav.sosialhjelp.fagsystem.db.Database
import no.nav.sosialhjelp.fagsystem.db.EttersendelseRepository
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import no.nav.sosialhjelp.fagsystem.fiks.EttersendtVedlegg
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.BeforeAll
import org.testcontainers.DockerClientFactory
import org.testcontainers.postgresql.PostgreSQLContainer
import java.util.UUID
import kotlin.test.Test

class EttersendelseRepositoryTest {
    companion object {
        private var postgres: PostgreSQLContainer? = null
        private lateinit var sakRepository: SakRepository
        private lateinit var repository: EttersendelseRepository

        @JvmStatic
        @BeforeAll
        fun setup() {
            assumeTrue(runCatching { DockerClientFactory.instance().isDockerAvailable }.getOrDefault(false), "Docker mangler")
            postgres = PostgreSQLContainer("postgres:17-alpine").also { it.start() }
            val ds = Database.dataSource(DatabaseConfig(postgres!!.jdbcUrl, postgres!!.username, postgres!!.password))
            Database.migrate(ds)
            sakRepository = SakRepository(ds)
            repository = EttersendelseRepository(ds)
        }

        @JvmStatic
        @AfterAll
        fun teardown() {
            postgres?.stop()
        }
    }

    @Test
    fun `lagrer vedlegg for ettersendelse idempotent`() {
        val digisosId = UUID.randomUUID()
        val meldingId = UUID.randomUUID()
        sakRepository.lagreOpprettet(digisosId, UUID.randomUUID())
        val vedlegg = listOf(
            EttersendtVedlegg("søknad", "dokument", "mottatt", null, null, 1),
            EttersendtVedlegg("kvittering", null, "mottatt", "ETTERSENDT", "ref-1", 2),
        )

        repository.lagre(digisosId, meldingId, "ekstern-ref", vedlegg)
        repository.hentForSak(digisosId) shouldBe vedlegg
        repository.meldingFinnes(meldingId) shouldBe true

        repository.lagre(digisosId, meldingId, "ekstern-ref", vedlegg)
        repository.hentForSak(digisosId) shouldHaveSize 2
    }
}
