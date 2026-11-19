package no.nav.sosialhjelp.fagsystem.db

import kotliquery.Row
import kotliquery.queryOf
import kotliquery.sessionOf
import no.nav.sosialhjelp.fagsystem.fiks.EttersendtVedlegg
import java.util.UUID
import javax.sql.DataSource

class EttersendelseRepository(private val dataSource: DataSource) {
    fun meldingFinnes(meldingId: UUID): Boolean =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf(
                    "SELECT EXISTS (SELECT 1 FROM ettersendelse_vedlegg WHERE fiks_io_melding_id = :meldingId) AS finnes",
                    mapOf("meldingId" to meldingId),
                ).map { it.boolean("finnes") }.asSingle
            ) ?: false
        }

    fun lagre(digisosId: UUID, meldingId: UUID, eksternRef: String?, vedlegg: List<EttersendtVedlegg>) {
        sessionOf(dataSource).use { session ->
            session.transaction { tx ->
                vedlegg.forEachIndexed { posisjon, v ->
                    tx.run(
                        queryOf(
                            """
                            INSERT INTO ettersendelse_vedlegg (
                                digisos_id, fiks_io_melding_id, posisjon, ekstern_ref, type,
                                tilleggsinfo, hendelse_type, hendelse_referanse, status,
                                antall_filer
                            ) VALUES (
                                :digisosId, :meldingId, :posisjon, :eksternRef, :type,
                                :tilleggsinfo, :hendelseType, :hendelseReferanse, :status,
                                :antallFiler
                            )
                            ON CONFLICT (fiks_io_melding_id, posisjon) DO NOTHING
                            """.trimIndent(),
                            mapOf(
                                "digisosId" to digisosId,
                                "meldingId" to meldingId,
                                "posisjon" to posisjon,
                                "eksternRef" to eksternRef,
                                "type" to v.type,
                                "tilleggsinfo" to v.tilleggsinfo,
                                "hendelseType" to v.hendelseType,
                                "hendelseReferanse" to v.hendelseReferanse,
                                "status" to v.status,
                                "antallFiler" to v.antallFiler,
                            ),
                        ).asUpdate,
                    )
                }
            }
        }
    }

    fun hentForSak(digisosId: UUID): List<EttersendtVedlegg> =
        sessionOf(dataSource).use { session ->
            session.run(
                queryOf(
                    """
                    SELECT type, tilleggsinfo, status, hendelse_type, hendelse_referanse, antall_filer
                    FROM ettersendelse_vedlegg
                    WHERE digisos_id = :digisosId
                    ORDER BY mottatt, posisjon
                    """.trimIndent(),
                    mapOf("digisosId" to digisosId),
                ).map(::toEttersendtVedlegg).asList
            )
        }

    private fun toEttersendtVedlegg(row: Row) =
        EttersendtVedlegg(
            type = row.stringOrNull("type"),
            tilleggsinfo = row.stringOrNull("tilleggsinfo"),
            status = row.stringOrNull("status"),
            hendelseType = row.stringOrNull("hendelse_type"),
            hendelseReferanse = row.stringOrNull("hendelse_referanse"),
            antallFiler = row.int("antall_filer"),
        )
}
