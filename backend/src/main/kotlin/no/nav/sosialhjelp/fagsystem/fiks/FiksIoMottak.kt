package no.nav.sosialhjelp.fagsystem.fiks

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
import no.nav.sosialhjelp.fagsystem.FiksIoConfig
import no.nav.sosialhjelp.fagsystem.auth.TexasClient
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import org.slf4j.LoggerFactory
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
 * For hver søknad: les digisosId fra meldingen, lagre saken, kvitter med
 * "mottatt" og ack. Uten kvittering faller Fiks tilbake til SvarUt.
 * Søknadsinnholdet (personopplysninger) lagres ikke og logges ikke.
 */
class FiksIoMottak(
    private val ioConfig: FiksIoConfig,
    private val fiksConfig: FiksConfig,
    private val texas: TexasClient,
    private val repository: SakRepository,
    private val objectMapper: ObjectMapper,
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
                    )
                    svar.svar(MELDINGSTYPE_SOKNAD_MOTTATT)
                    log.info("Mottok søknad digisosId=${metadata.digisosId}")
                }
                MELDINGSTYPE_ETTERSENDELSE -> {
                    svar.svar(MELDINGSTYPE_ETTERSENDELSE_MOTTATT)
                    log.info("Mottok ettersendelse, meldingId=${melding.meldingId.uuid}")
                }
                else -> log.warn("Ukjent meldingstype ${melding.meldingType}, ack uten svar")
            }
            svar.ack()
        } catch (e: Exception) {
            log.error("Feil ved håndtering av Fiks IO-melding ${melding.meldingId.uuid}: ${e.javaClass.simpleName}")
            svar.nackWithRequeue()
        }
    }

    internal data class Metadata(val digisosId: UUID, val eksternRef: String?)

    /** Finner JSON-filen i meldingen som inneholder digisosId (no.nav.digisos.soknad.v1-skjemaet). */
    private fun lesMetadata(melding: MottattMelding): Metadata {
        melding.dekryptertZipStream.use { zip ->
            while (true) {
                val entry = zip.nextEntry ?: break
                if (!entry.name.endsWith(".json")) continue
                val node = runCatching { objectMapper.readTree(zip.readAllBytes()) }.getOrNull() ?: continue
                val digisosId = node.path("digisosId").asText(null) ?: continue
                return Metadata(UUID.fromString(digisosId), node.path("eksternRef").asText(null))
            }
        }
        throw IllegalArgumentException("Fant ikke digisosId i meldingen")
    }

    override fun close() {
        klient?.close()
    }

    private companion object {
        // Første parameter i defaultTestConfiguration er Maskinporten-klient-ID. Den brukes bare når
        // klienten henter Maskinporten-token selv. Vi gir egen token-supplier (Texas), så verdien er ubrukt.
        const val PLACEHOLDER_IKKE_BRUKT = "ubrukt-token-kommer-fra-texas"

        fun lesPrivatNokkel(pem: String): PrivateKey {
            val base64 =
                pem.replace(Regex("-----(BEGIN|END) PRIVATE KEY-----"), "")
                    .replace(Regex("\\s"), "")
            return KeyFactory.getInstance("RSA").generatePrivate(PKCS8EncodedKeySpec(Base64.getDecoder().decode(base64)))
        }
    }
}
