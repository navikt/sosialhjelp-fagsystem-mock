package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import no.nav.sosialhjelp.fagsystem.db.Database
import no.nav.sosialhjelp.fagsystem.db.Kilde
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.BeforeAll
import org.testcontainers.DockerClientFactory
import org.testcontainers.postgresql.PostgreSQLContainer
import java.util.UUID
import kotlin.test.Test

class SakRepositoryTest {
    companion object {
        private var postgres: PostgreSQLContainer? = null
        private lateinit var repository: SakRepository

        @JvmStatic
        @BeforeAll
        fun setup() {
            assumeTrue(runCatching { DockerClientFactory.instance().isDockerAvailable }.getOrDefault(false), "Docker mangler")
            postgres = PostgreSQLContainer("postgres:17-alpine").also { it.start() }
            val ds = Database.dataSource(DatabaseConfig(postgres!!.jdbcUrl, postgres!!.username, postgres!!.password))
            Database.migrate(ds)
            repository = SakRepository(ds)
        }

        @JvmStatic
        @AfterAll
        fun teardown() {
            postgres?.stop()
        }
    }

    private val orgId = UUID.randomUUID()

    @Test
    fun `lagrer mottatt sak og digisos-soker`() {
        val id = UUID.randomUUID()
        repository.lagreMottatt(id, orgId, "ref-1", UUID.randomUUID())
        repository.lagreMottatt(id, orgId, "ref-1", UUID.randomUUID()) // idempotent

        repository.hent(id)!!.kilde shouldBe Kilde.FIKS_IO
        repository.hentDigisosSoker(id).shouldBeNull()

        repository.oppdaterDigisosSoker(id, """{"sak":{"soker":{"hendelser":[]}}}""") shouldBe true
        repository.hentDigisosSoker(id)!!.contains("hendelser") shouldBe true
        repository.hentAlle().filter { it.digisosId == id } shouldHaveSize 1
    }
}
