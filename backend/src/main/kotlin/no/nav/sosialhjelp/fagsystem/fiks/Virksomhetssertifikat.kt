package no.nav.sosialhjelp.fagsystem.fiks

import com.fasterxml.jackson.databind.ObjectMapper
import no.nav.sosialhjelp.fagsystem.SecretRef
import org.slf4j.LoggerFactory
import java.io.ByteArrayInputStream
import java.security.KeyStore
import java.security.cert.X509Certificate

class VirksomhetssertifikatException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

data class DigisosKeyStoreCredentials(
    val alias: String,
    val password: String,
    val type: String? = null,
) {
    override fun toString() = "DigisosKeyStoreCredentials(alias=$alias, password=<redacted>, type=$type)"
}

class Virksomhetssertifikat(val keyStore: KeyStore, val credentials: DigisosKeyStoreCredentials) {
    override fun toString() = "Virksomhetssertifikat(alias=${credentials.alias}, <redacted>)"

    companion object {
        private val log = LoggerFactory.getLogger(Virksomhetssertifikat::class.java)

        fun hent(
            keystore: SecretRef,
            credentials: SecretRef,
            objectMapper: ObjectMapper,
            hentSecrets: (List<SecretRef>) -> List<ByteArray> = { SecretManager.hent(*it.toTypedArray()) },
        ): Virksomhetssertifikat {
            val (keystoreBytes, credentialsBytes) =
                try {
                    hentSecrets(listOf(keystore, credentials))
                } catch (e: Exception) {
                    throw VirksomhetssertifikatException("Kunne ikke hente virksomhetssertifikat: ${e.javaClass.simpleName}", e)
                }
            return lastInn(keystoreBytes, credentialsBytes, objectMapper)
        }

        internal fun lastInn(keystoreBytes: ByteArray, credentialsBytes: ByteArray, objectMapper: ObjectMapper): Virksomhetssertifikat {
            if (keystoreBytes.isEmpty() || credentialsBytes.isEmpty()) {
                throw VirksomhetssertifikatException("Virksomhetssertifikat eller passord er tomt")
            }
            val credentials =
                try {
                    objectMapper.readValue(credentialsBytes, DigisosKeyStoreCredentials::class.java)
                } catch (e: Exception) {
                    throw VirksomhetssertifikatException("Kunne ikke lese keystore-credentials: ${e.javaClass.simpleName}", e)
                }
            val keyStore =
                try {
                    KeyStore.getInstance(credentials.type?.takeIf { it.isNotBlank() } ?: "JCEKS").apply {
                        load(ByteArrayInputStream(keystoreBytes), credentials.password.toCharArray())
                    }
                } catch (e: Exception) {
                    throw VirksomhetssertifikatException("Kunne ikke laste keystore: ${e.javaClass.simpleName}", e)
                }
            val utloper = (keyStore.getCertificate(credentials.alias) as? X509Certificate)?.notAfter
            log.info("Hentet virksomhetssertifikat, størrelse=${keystoreBytes.size}, alias=${credentials.alias}, utløper=$utloper")
            return Virksomhetssertifikat(keyStore, credentials)
        }
    }
}
