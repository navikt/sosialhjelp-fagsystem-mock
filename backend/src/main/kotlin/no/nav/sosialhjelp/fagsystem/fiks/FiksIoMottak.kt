package no.nav.sosialhjelp.fagsystem.fiks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import no.ks.fiks.io.client.FiksIOKlient
import no.ks.fiks.io.client.FiksIOKlientFactory
import no.ks.fiks.io.client.SvarSender
import no.ks.fiks.io.client.konfigurasjon.FiksIOKonfigurasjon
import no.ks.fiks.io.client.konfigurasjon.KontoKonfigurasjon
import no.ks.fiks.io.client.konfigurasjon.VirksomhetssertifikatKonfigurasjon
import no.ks.fiks.io.client.model.KontoId
import no.ks.fiks.io.client.model.MottattMelding
import no.nav.sosialhjelp.fagsystem.FiksConfig
import no.nav.sosialhjelp.fagsystem.FagsystemService
import no.nav.sosialhjelp.fagsystem.FiksIoConfig
import no.nav.sosialhjelp.fagsystem.auth.TexasClient
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import org.slf4j.LoggerFactory
import java.io.OutputStream
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.spec.PKCS8EncodedKeySpec
import java.util.Base64
import java.util.UUID

const val MELDINGSTYPE_SOKNAD = "no.nav.digisos.soknad.v1"
const val MELDINGSTYPE_ETTERSENDELSE = "no.nav.digisos.ettersendelse.v1"
const val MELDINGSTYPE_SOKNAD_MOTTATT = "no.nav.digisos.soknad.mottatt.v1"
const val MELDINGSTYPE_ETTERSENDELSE_MOTTATT = "no.nav.digisos.ettersendelse.mottatt.v1"

/**
 * For hver søknad: les digisosId fra meldingen, lagre saken, opprett initiell
 * innsynsfil, kvitter med "mottatt" og ack. Uten kvittering faller Fiks tilbake til SvarUt.
 * Søknadsinnholdet lagres ikke, bortsett fra søkers fnr (testdata) som lagres i sak.soker_fnr.
 */
class FiksIoMottak(
    private val ioConfig: FiksIoConfig,
    private val fiksConfig: FiksConfig,
    private val texas: TexasClient,
    private val repository: SakRepository,
    private val objectMapper: ObjectMapper,
    private val service: FagsystemService,
) : AutoCloseable {
    private val log = LoggerFactory.getLogger(FiksIoMottak::class.java)
    private var klient: FiksIOKlient? = null

    fun start() {
        val sertifikat = Virksomhetssertifikat.hent(ioConfig.keystore, ioConfig.keystoreCredentials, objectMapper)
        val konfig =
            FiksIOKonfigurasjon.defaultTestConfiguration(
                PLACEHOLDER_IKKE_BRUKT,
                fiksConfig.integrasjonId,
                fiksConfig.integrasjonPassord,
                KontoKonfigurasjon.builder()
                    .kontoId(KontoId(ioConfig.kontoId))
                    .privatNokkel(lesPrivatNokkel(ioConfig.privatNokkelPem))
                    .build(),
                VirksomhetssertifikatKonfigurasjon.builder()
                    .keyStore(sertifikat.keyStore)
                    .keyStorePassword(sertifikat.credentials.password)
                    .keyAlias(sertifikat.credentials.alias)
                    .keyPassword(sertifikat.credentials.password)
                    .build(),
            )
        klient =
            FiksIOKlientFactory(konfig)
                .setMaskinportenAccessTokenSupplier {
                    runBlocking(Dispatchers.IO) { texas.maskinportenToken(fiksConfig.maskinportenScope) }
                }.build()
                .also { it.newSubscription(::handle) }
        log.info("Fiks IO-mottak startet for konto ${ioConfig.kontoId}")
    }

    internal fun handle(melding: MottattMelding, svar: SvarSender) {
        try {
            when (melding.meldingType) {
                MELDINGSTYPE_SOKNAD -> {
                    val metadata = lesMetadata(melding)
                    repository.lagreMottatt(
                        digisosId = metadata.digisosId,
                        fiksOrgId = fiksConfig.fiksOrgId,
                        eksternRef = metadata.eksternRef,
                        meldingId = melding.meldingId.uuid,
                        sokerFnr = metadata.sokerFnr,
                    )
                    runBlocking(Dispatchers.IO) { service.opprettInitiellInnsynsfil(metadata.digisosId) }
                    svar.svar(MELDINGSTYPE_SOKNAD_MOTTATT)
                    log.info("Mottok søknad digisosId=${metadata.digisosId}")
                }
                MELDINGSTYPE_ETTERSENDELSE -> {
                    haandterEttersendelse(melding)
                    svar.svar(MELDINGSTYPE_ETTERSENDELSE_MOTTATT)
                }
                else -> log.warn("Ukjent meldingstype ${melding.meldingType}, ack uten svar")
            }
            svar.ack()
        } catch (e: Exception) {
            log.error("Feil ved håndtering av Fiks IO-melding ${melding.meldingId.uuid}: ${e.javaClass.simpleName}")
            svar.nackWithRequeue()
        }
    }

    internal data class Metadata(val digisosId: UUID, val eksternRef: String?, val sokerFnr: String?)

    /** Finner JSON-filen i meldingen som inneholder digisosId (no.nav.digisos.soknad.v1-skjemaet). */
    private fun lesMetadata(melding: MottattMelding): Metadata {
        var digisosIdMetadata: Pair<UUID, String?>? = null
        var sokerFnr: String? = null
        // Strømmen må leses helt ut før den lukkes, ellers feiler skrivetråden i
        // fiks-io-klienten med "Pipe closed".
        melding.dekryptertZipStream.use { zip ->
            while (true) {
                val entry = zip.nextEntry ?: break
                if (!entry.name.endsWith(".json")) {
                    zip.transferTo(OutputStream.nullOutputStream())
                    continue
                }
                val node = runCatching { objectMapper.readTree(zip.readAllBytes()) }.getOrNull() ?: continue
                if (sokerFnr == null) {
                    sokerFnr = lesSokerFnr(node)
                }
                if (digisosIdMetadata == null) {
                    val digisosId = node.path("digisosId").asText(null)
                    if (digisosId != null) {
                        digisosIdMetadata = UUID.fromString(digisosId) to node.path("eksternRef").asText(null)
                    }
                }
            }
        }
        val (digisosId, eksternRef) = digisosIdMetadata ?: throw IllegalArgumentException("Fant ikke digisosId i meldingen")
        return Metadata(digisosId, eksternRef, sokerFnr)
    }

    /** Leser alle JSON-filer i meldingen (maks MAKS_JSON_BYTES hver). Andre filer leses ut uten å se på innholdet. */
    private fun lesJsonFiler(melding: MottattMelding): List<JsonNode> {
        val filer = mutableListOf<JsonNode>()
        // Strømmen må leses helt ut før den lukkes, ellers feiler skrivetråden i
        // fiks-io-klienten med "Pipe closed".
        melding.dekryptertZipStream.use { zip ->
            while (true) {
                val entry = zip.nextEntry ?: break
                val bytes = if (entry.name.endsWith(".json")) zip.readNBytes(MAKS_JSON_BYTES + 1) else null
                zip.transferTo(OutputStream.nullOutputStream())
                if (bytes == null) continue
                if (bytes.size > MAKS_JSON_BYTES) {
                    log.warn("JSON-fil i melding over $MAKS_JSON_BYTES bytes, hoppet over")
                    continue
                }
                runCatching { objectMapper.readTree(bytes) }.getOrNull()?.let(filer::add)
            }
        }
        return filer
    }

    private fun finnMetadata(filer: List<JsonNode>): Metadata? =
        filer.firstNotNullOfOrNull { node ->
            node.path("digisosId").asText(null)?.let { Metadata(UUID.fromString(it), node.path("eksternRef").asText(null), sokerFnr = null) }
        }

    private fun finnVedlegg(filer: List<JsonNode>): List<EttersendtVedlegg>? =
        filer.firstOrNull { it.path("vedlegg").isArray }?.let(EttersendtVedlegg::fraVedleggJson)

    private fun haandterEttersendelse(melding: MottattMelding) {
        val meldingId = melding.meldingId.uuid
        try {
            val filer = lesJsonFiler(melding)
            val metadata = finnMetadata(filer)
            val vedlegg = finnVedlegg(filer)
            if (metadata == null || vedlegg == null) {
                log.warn("Ettersendelse meldingId=$meldingId mangler digisosId eller vedlegg.json. JSON-nøkler: ${filer.map { it.fieldNames().asSequence().toList() }}")
                return
            }
            runBlocking(Dispatchers.IO) { service.registrerEttersendelse(metadata.digisosId, meldingId, metadata.eksternRef, vedlegg) }
        } catch (e: Exception) {
            log.error("Kunne ikke behandle ettersendelse meldingId=$meldingId: ${e.javaClass.simpleName}")
        }
    }

    override fun close() {
        klient?.close()
    }

    private companion object {
        // Første parameter i defaultTestConfiguration er Maskinporten-klient-ID. Den brukes bare når
        // klienten henter Maskinporten-token selv. Vi gir egen token-supplier (Texas), så verdien er ubrukt.
        const val PLACEHOLDER_IKKE_BRUKT = "ubrukt-token-kommer-fra-texas"
        const val MAKS_JSON_BYTES = 1_048_576

        fun lesPrivatNokkel(pem: String): PrivateKey {
            val base64 =
                pem.replace(Regex("-----(BEGIN|END) PRIVATE KEY-----"), "")
                    .replace(Regex("\\s"), "")
            return KeyFactory.getInstance("RSA").generatePrivate(PKCS8EncodedKeySpec(Base64.getDecoder().decode(base64)))
        }
    }
}

internal fun lesSokerFnr(node: JsonNode): String? =
    node.path("data")
        .path("personalia")
        .path("personIdentifikator")
        .path("verdi")
        .asText(null)
        ?.takeIf { it.matches(Regex("^[0-9]{11}$")) }
