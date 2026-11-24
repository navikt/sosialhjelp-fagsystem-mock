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
import no.nav.sosialhjelp.fagsystem.FagsystemService
import no.nav.sosialhjelp.fagsystem.FiksIoConfig
import no.nav.sosialhjelp.fagsystem.auth.TexasClient
import no.nav.sosialhjelp.fagsystem.db.SakRepository
import org.slf4j.LoggerFactory
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.spec.PKCS8EncodedKeySpec
import java.util.Base64

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
                    val innhold = lesFiksIoInnhold(melding.dekryptertZipStream, objectMapper)
                    val digisosId = innhold.digisosId ?: throw IllegalArgumentException("Fant ikke digisosId i meldingen")
                    repository.lagreMottatt(
                        digisosId = digisosId,
                        fiksOrgId = fiksConfig.fiksOrgId,
                        eksternRef = innhold.eksternRef,
                        meldingId = melding.meldingId.uuid,
                        sokerFnr = innhold.sokerFnr,
                    )
                    runBlocking(Dispatchers.IO) { service.opprettInitiellInnsynsfil(digisosId) }
                    svar.svar(MELDINGSTYPE_SOKNAD_MOTTATT)
                    log.info("Mottok søknad digisosId=$digisosId")
                }
                MELDINGSTYPE_ETTERSENDELSE -> {
                    handleEttersendelse(melding)
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

    private fun handleEttersendelse(melding: MottattMelding) {
        val meldingId = melding.meldingId.uuid
        try {
            val innhold = lesFiksIoInnhold(melding.dekryptertZipStream, objectMapper)
            val digisosId = innhold.digisosId
            val vedlegg = innhold.vedlegg
            if (digisosId == null || vedlegg == null) {
                // TODO: Fjern når formatet på vedlegg.json er bekreftet i dev.
                log.warn("Ettersendelse meldingId=$meldingId mangler digisosId eller vedlegg.json")
                return
            }
            runBlocking(Dispatchers.IO) { service.registrerEttersendelse(digisosId, meldingId, innhold.eksternRef, vedlegg) }
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

        fun lesPrivatNokkel(pem: String): PrivateKey {
            val base64 =
                pem.replace(Regex("-----(BEGIN|END) PRIVATE KEY-----"), "")
                    .replace(Regex("\\s"), "")
            return KeyFactory.getInstance("RSA").generatePrivate(PKCS8EncodedKeySpec(Base64.getDecoder().decode(base64)))
        }
    }
}
