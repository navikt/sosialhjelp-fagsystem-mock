package no.nav.sosialhjelp.fagsystem

import java.util.UUID

/**
 * All konfigurasjon leses fra miljøvariabler. Hemmeligheter (passord, nøkler)
 * kommer fra Nais-secrets og skal aldri logges. toString() er derfor overstyrt.
 */
data class AppConfig(
    val database: DatabaseConfig,
    val azure: AzureConfig?,
    val texas: TexasConfig?,
    val fiks: FiksConfig?,
    val fiksIo: FiksIoConfig?,
) {
    companion object {
        fun fromEnv(env: Map<String, String> = System.getenv()): AppConfig =
            AppConfig(
                database = DatabaseConfig.fromEnv(env),
                azure = AzureConfig.fromEnv(env),
                texas = TexasConfig.fromEnv(env),
                fiks = FiksConfig.fromEnv(env),
                fiksIo = FiksIoConfig.fromEnv(env),
            )
    }
}

data class DatabaseConfig(val jdbcUrl: String, val username: String?, val password: String?) {
    override fun toString() = "DatabaseConfig(jdbcUrl=<redacted>)"

    companion object {
        fun fromEnv(env: Map<String, String>): DatabaseConfig {
            // Nais (gcp.sqlInstances) setter DB_JDBC_URL når envVarPrefix = DB
            val jdbcUrl = env["DB_JDBC_URL"]
                ?: "jdbc:postgresql://localhost:5432/fagsystem?user=postgres&password=postgres"
            return DatabaseConfig(jdbcUrl, env["DB_USERNAME"], env["DB_PASSWORD"])
        }
    }
}

data class AzureConfig(val clientId: String, val preAuthorizedApps: String) {
    companion object {
        fun fromEnv(env: Map<String, String>): AzureConfig? {
            val clientId = env["AZURE_APP_CLIENT_ID"] ?: return null
            return AzureConfig(clientId, env["AZURE_APP_PRE_AUTHORIZED_APPS"] ?: "[]")
        }
    }
}

/** Texas: Nais-sidecar for token-introspeksjon og Maskinporten-token. */
data class TexasConfig(val tokenEndpoint: String, val introspectionEndpoint: String) {
    companion object {
        fun fromEnv(env: Map<String, String>): TexasConfig? {
            val token = env["NAIS_TOKEN_ENDPOINT"] ?: return null
            val introspect = env["NAIS_TOKEN_INTROSPECTION_ENDPOINT"] ?: return null
            return TexasConfig(token, introspect)
        }
    }
}

data class FiksConfig(
    val baseUrl: String,
    val fiksOrgId: UUID,
    val integrasjonId: UUID,
    val integrasjonPassord: String,
    val maskinportenScope: String,
) {
    override fun toString() =
        "FiksConfig(baseUrl=$baseUrl, fiksOrgId=$fiksOrgId, integrasjonId=$integrasjonId, integrasjonPassord=<redacted>)"

    companion object {
        fun fromEnv(env: Map<String, String>): FiksConfig? {
            val integrasjonId = env["FIKS_INTEGRASJON_ID"]?.takeUnless(::isPlaceholder) ?: return null
            val passord = env["FIKS_INTEGRASJON_PASSORD"]?.takeUnless(::isPlaceholder) ?: return null
            val fiksOrgId = env["FIKS_ORG_ID"]?.takeUnless(::isPlaceholder) ?: return null
            return FiksConfig(
                baseUrl = env["FIKS_BASE_URL"] ?: "https://api.fiks.test.ks.no",
                fiksOrgId = UUID.fromString(fiksOrgId),
                integrasjonId = UUID.fromString(integrasjonId),
                integrasjonPassord = passord,
                maskinportenScope = env["FIKS_MASKINPORTEN_SCOPE"] ?: "ks:fiks",
            )
        }
    }
}

/** Plassering av virksomhetssertifikatet i GCP Secret Manager. Ingen hemmeligheter. */
data class SecretRef(val projectId: String, val secretId: String, val version: String)

data class FiksIoConfig(
    val kontoId: UUID,
    /** PKCS#8 PEM, privatnøkkel for Fiks IO-kontoen. */
    val privatNokkelPem: String,
    /** JCEKS-keystore med virksomhetssertifikat. */
    val keystore: SecretRef,
    /** JSON med alias, password og type for keystoren. */
    val keystoreCredentials: SecretRef,
) {
    override fun toString() = "FiksIoConfig(kontoId=$kontoId, nøkler=<redacted>)"

    companion object {
        fun fromEnv(env: Map<String, String>): FiksIoConfig? {
            val kontoId = env["FIKS_IO_KONTO_ID"]?.takeUnless(::isPlaceholder) ?: return null
            return FiksIoConfig(
                kontoId = UUID.fromString(kontoId),
                privatNokkelPem = env["FIKS_IO_PRIVATE_KEY"]?.takeUnless(::isPlaceholder) ?: return null,
                keystore =
                    SecretRef(
                        env["VIRKSOMHETSSERTIFIKAT_PROJECT_ID"] ?: return null,
                        env["VIRKSOMHETSSERTIFIKAT_SECRET_ID"] ?: return null,
                        env["VIRKSOMHETSSERTIFIKAT_VERSION_ID"] ?: return null,
                    ),
                keystoreCredentials =
                    SecretRef(
                        env["VIRKSOMHETSSERTIFIKAT_PASSWORD_PROJECT_ID"] ?: return null,
                        env["VIRKSOMHETSSERTIFIKAT_PASSWORD_SECRET_ID"] ?: return null,
                        env["VIRKSOMHETSSERTIFIKAT_PASSWORD_VERSION_ID"] ?: return null,
                    ),
            )
        }
    }
}

const val PLACEHOLDER = "placeholder"

private fun isPlaceholder(value: String) = value.isBlank() || value.equals(PLACEHOLDER, ignoreCase = true)
