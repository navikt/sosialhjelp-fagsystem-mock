package no.nav.sosialhjelp.fagsystem.fiks

import com.google.cloud.secretmanager.v1.SecretManagerServiceClient
import com.google.cloud.secretmanager.v1.SecretVersionName
import no.nav.sosialhjelp.fagsystem.SecretRef
import java.io.IOException
import java.util.zip.CRC32C

/** Henter secrets fra GCP Secret Manager og verifiserer CRC32C. */
object SecretManager {
    @Throws(IOException::class)
    fun hent(vararg refs: SecretRef): List<ByteArray> =
        SecretManagerServiceClient.create().use { client ->
            refs.map { ref ->
                val response = client.accessSecretVersion(SecretVersionName.of(ref.projectId, ref.secretId, ref.version))
                val data = response.payload.data.toByteArray()
                val checksum = CRC32C().apply { update(data, 0, data.size) }
                if (response.payload.dataCrc32C != checksum.value) {
                    throw IOException("Data corruption detected for secret ${ref.secretId}")
                }
                data
            }
        }
}
