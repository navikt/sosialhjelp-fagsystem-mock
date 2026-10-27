package no.nav.sosialhjelp.fagsystem.db

import kotliquery.Row
import kotliquery.queryOf
import kotliquery.sessionOf
import java.time.OffsetDateTime
import java.util.UUID
import javax.sql.DataSource

enum class Kilde { FIKS_IO, OPPRETTET }

data class Sak(
    val digisosId: UUID,
    val fiksOrgId: UUID,
    val kilde: Kilde,
    val eksternRef: String?,
    val opprettet: OffsetDateTime,
    val oppdatert: OffsetDateTime,
)

class SakRepository(private val dataSource: DataSource) {
    fun lagreMottatt(digisosId: UUID, fiksOrgId: UUID, eksternRef: String?, meldingId: UUID) =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf(
                    """
                    INSERT INTO sak (digisos_id, fiks_org_id, kilde, ekstern_ref, fiks_io_melding)
                    VALUES (:digisosId, :fiksOrgId, 'FIKS_IO', :eksternRef, :meldingId)
                    ON CONFLICT (digisos_id) DO NOTHING
                    """.trimIndent(),
                    mapOf(
                        "digisosId" to digisosId,
                        "fiksOrgId" to fiksOrgId,
                        "eksternRef" to eksternRef,
                        "meldingId" to meldingId,
                    ),
                ).asUpdate,
            )
        }

    fun lagreOpprettet(digisosId: UUID, fiksOrgId: UUID) =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf(
                    """
                    INSERT INTO sak (digisos_id, fiks_org_id, kilde)
                    VALUES (:digisosId, :fiksOrgId, 'OPPRETTET')
                    ON CONFLICT (digisos_id) DO NOTHING
                    """.trimIndent(),
                    mapOf("digisosId" to digisosId, "fiksOrgId" to fiksOrgId),
                ).asUpdate,
            )
        }

    fun oppdaterDigisosSoker(digisosId: UUID, json: String): Boolean =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf(
                    "UPDATE sak SET digisos_soker = CAST(:json AS jsonb), oppdatert = now() WHERE digisos_id = :digisosId",
                    mapOf("json" to json, "digisosId" to digisosId),
                ).asUpdate,
            ) > 0
        }

    fun hent(digisosId: UUID): Sak? =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf("SELECT * FROM sak WHERE digisos_id = :id", mapOf("id" to digisosId))
                    .map(::toSak)
                    .asSingle,
            )
        }

    fun hentDigisosSoker(digisosId: UUID): String? =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf("SELECT digisos_soker::text AS json FROM sak WHERE digisos_id = :id", mapOf("id" to digisosId))
                    .map { it.stringOrNull("json") }
                    .asSingle,
            )
        }

    fun hentAlle(limit: Int = 200): List<Sak> =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf("SELECT * FROM sak ORDER BY opprettet DESC LIMIT :limit", mapOf("limit" to limit))
                    .map(::toSak)
                    .asList,
            )
        }

    private fun toSak(row: Row) =
        Sak(
            digisosId = row.uuid("digisos_id"),
            fiksOrgId = row.uuid("fiks_org_id"),
            kilde = Kilde.valueOf(row.string("kilde")),
            eksternRef = row.stringOrNull("ekstern_ref"),
            opprettet = row.offsetDateTime("opprettet"),
            oppdatert = row.offsetDateTime("oppdatert"),
        )
}
