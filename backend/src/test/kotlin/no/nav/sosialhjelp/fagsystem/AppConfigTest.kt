package no.nav.sosialhjelp.fagsystem

import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.string.shouldNotContain
import kotlin.test.Test

class AppConfigTest {
    @Test
    fun `placeholder-verdier gir ingen Fiks-konfig`() {
        val config =
            AppConfig.fromEnv(
                mapOf(
                    "FIKS_INTEGRASJON_ID" to "placeholder",
                    "FIKS_INTEGRASJON_PASSORD" to "placeholder",
                    "FIKS_ORG_ID" to "placeholder",
                    "FIKS_IO_KONTO_ID" to "placeholder",
                ),
            )
        config.fiks.shouldBeNull()
        config.fiksIo.shouldBeNull()
    }

    @Test
    fun `toString lekker ikke passord`() {
        val fiks =
            FiksConfig.fromEnv(
                mapOf(
                    "FIKS_INTEGRASJON_ID" to "11111111-1111-1111-1111-111111111111",
                    "FIKS_INTEGRASJON_PASSORD" to "hemmelig",
                    "FIKS_ORG_ID" to "22222222-2222-2222-2222-222222222222",
                ),
            )
        fiks.shouldNotBeNull()
        fiks.toString() shouldNotContain "hemmelig"
    }
}
