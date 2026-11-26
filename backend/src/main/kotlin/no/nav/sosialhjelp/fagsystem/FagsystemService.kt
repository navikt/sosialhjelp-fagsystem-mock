package no.nav.sosialhjelp.fagsystem

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import no.nav.sosialhjelp.fagsystem.db.EttersendelseRepository
import no.nav.sosialhjelp.fagsystem.db.Sak
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import no.nav.sosialhjelp.fagsystem.fiks.EttersendtVedlegg
import no.nav.sosialhjelp.fagsystem.fiks.FiksDigisosClient
import org.slf4j.LoggerFactory
import java.time.Instant
import java.util.UUID

const val DIGISOS_SOKER_TYPE = "no.nav.digisos.digisos.soker.v1"

private val log = LoggerFactory.getLogger(FagsystemService::class.java)

/**
 * Speiler semantikken til mock-alt-api sitt innsyn-api, slik at frontenden
 * kan bruke samme kall uansett mål.
 */
class FagsystemService(
    private val repository: SakRepository,
    private val ettersendelser: EttersendelseRepository,
    private val fiks: FiksDigisosClient?,
    private val fiksOrgId: UUID?,
    private val objectMapper: ObjectMapper,
) {
    private fun fiksOrFail(): FiksDigisosClient =
        fiks ?: throw IllegalStateException("Fiks er ikke konfigurert (placeholder-verdier)")

    /**
     * Sender oppdatert digisos-soker til Fiks.
     * - Kjent sak: oppdateres.
     * - Ukjent sak og fnr oppgitt: ny sak opprettes hos Fiks først.
     * - Ukjent sak uten fnr: forsøker å oppdatere direkte (sak kan være opprettet før vi lagret den).
     * Returnerer digisosId som faktisk ble brukt.
     */
    suspend fun oppdaterDigisosSak(fiksDigisosId: String?, fnr: String?, body: String): UUID {
        val modell = validerDigisosSakApiModel(body)
        val fiksClient = fiksOrFail()
        val orgId = fiksOrgId!!

        val eksisterende = fiksDigisosId?.toUuidOrNull()?.let(repository::hent)
        val digisosId =
            when {
                eksisterende != null -> eksisterende.digisosId
                fnr != null -> fiksClient.opprettNySak(fnr).also { repository.lagreOpprettet(it, orgId, fnr) }
                else -> {
                    val id = requireNotNull(fiksDigisosId?.toUuidOrNull()) { "Ugyldig fiksDigisosId" }
                    repository.lagreOpprettet(id, orgId)
                    id
                }
            }

        val json = objectMapper.writeValueAsString(modell)
        fiksClient.oppdaterSak(digisosId, json)
        repository.oppdaterDigisosSoker(digisosId, json)
        return digisosId
    }

    /** Oppretter og lagrer initiell innsynsfil for en mottatt sak dersom den mangler. */
    suspend fun opprettInitiellInnsynsfil(digisosId: UUID) {
        val sak = repository.hent(digisosId) ?: return
        if (repository.hentDigisosSoker(digisosId) != null) return

        val json =
            objectMapper.writeValueAsString(
                mapOf(
                    "type" to DIGISOS_SOKER_TYPE,
                    "sak" to mapOf("soker" to initialSoker(sak)),
                ),
            )
        fiksOrFail().oppdaterSak(digisosId, json)
        repository.oppdaterDigisosSoker(digisosId, json)
    }

    suspend fun registrerEttersendelse(digisosId: UUID, meldingId: UUID, eksternRef: String?, vedlegg: List<EttersendtVedlegg>) {
        if (repository.hent(digisosId) == null) {
            log.warn("Ettersendelse for ukjent sak digisosId=$digisosId meldingId=$meldingId")
            return
        }
        if (ettersendelser.meldingFinnes(meldingId)) return

        oppdaterInnsynsfilMedVedlegg(digisosId, vedlegg)
        ettersendelser.lagre(digisosId, meldingId, eksternRef, vedlegg)
        log.info("Ettersendelse registrert digisosId=$digisosId meldingId=$meldingId antallVedlegg=${vedlegg.size}")
    }

    /** Legger til hendelser for levert dokumentasjon i innsynsfilen og sender hele filen til Fiks. */
    private suspend fun oppdaterInnsynsfilMedVedlegg(digisosId: UUID, vedlegg: List<EttersendtVedlegg>) {
        val innsynsfil = repository.hentDigisosSoker(digisosId)?.let(objectMapper::readTree) ?: return
        val soker = innsynsfil.path("sak").path("soker")
        val hendelser = KoblingAvVedlegg.hendelserForEttersendelse(soker, vedlegg, Instant.now().toString())
        if (hendelser.isEmpty()) return

        (soker.path("hendelser") as ArrayNode).addAll(hendelser)
        val json = objectMapper.writeValueAsString(innsynsfil)
        fiksOrFail().oppdaterSak(digisosId, json)
        repository.oppdaterDigisosSoker(digisosId, json)
    }

    /** Returnerer `sak.soker` (DigisosSokerJson), eller null hvis saken er ukjent. */
    fun hentInnsynsfil(fiksDigisosId: String): JsonNode? {
        val id = fiksDigisosId.toUuidOrNull() ?: return null
        val sak = repository.hent(id) ?: return null
        val lagret = repository.hentDigisosSoker(id)
        return if (lagret != null) {
            objectMapper.readTree(lagret).path("sak").path("soker")
        } else {
            initialSoker(sak)
        }
    }

    fun lastOppFil(fiksDigisosId: String, filnavn: String, mimetype: String, data: ByteArray): UUID {
        val id = requireNotNull(fiksDigisosId.toUuidOrNull()) { "Ugyldig fiksDigisosId" }
        return fiksOrFail().lastOppFil(id, filnavn, mimetype, data)
    }

    fun hentSaker(): List<Sak> = repository.hentAlle()

    private fun validerDigisosSakApiModel(body: String): ObjectNode {
        val node = objectMapper.readTree(body)
        require(node is ObjectNode) { "Body må være et JSON-objekt" }
        require(node.path("type").asText() == DIGISOS_SOKER_TYPE) { "type må være $DIGISOS_SOKER_TYPE" }
        require(node.path("sak").path("soker").isObject) { "sak.soker mangler" }
        return node
    }

    private fun initialSoker(sak: Sak): JsonNode =
        objectMapper.valueToTree(
            mapOf(
                "version" to "1.0.0",
                "avsender" to mapOf("systemnavn" to "sosialhjelp-fagsystem-mock", "systemversjon" to "1.0.0"),
                "hendelser" to
                    listOf(
                        mapOf(
                            "type" to "soknadsStatus",
                            "hendelsestidspunkt" to sak.opprettet.toInstant().toString(),
                            "status" to "MOTTATT",
                        ),
                    ),
            ),
        )
}

private fun String.toUuidOrNull(): UUID? = runCatching { UUID.fromString(this) }.getOrNull()
