package no.nav.sosialhjelp.fagsystem

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldNotContain
import no.nav.sosialhjelp.fagsystem.fiks.Virksomhetssertifikat
import no.nav.sosialhjelp.fagsystem.fiks.VirksomhetssertifikatException
import java.io.ByteArrayOutputStream
import java.security.KeyStore
import kotlin.test.Test
import kotlin.test.assertFailsWith

class VirksomhetssertifikatTest {
    private val passord = "hemmelig-passord"

    @Test
    fun `tom keystore gir exception`() {
        assertFailsWith<VirksomhetssertifikatException> {
            Virksomhetssertifikat.lastInn(ByteArray(0), "{}".toByteArray(), jacksonObjectMapper())
        }
    }

    @Test
    fun `ugyldig credentials gir exception uten passord i meldingen`() {
        val e =
            assertFailsWith<VirksomhetssertifikatException> {
                Virksomhetssertifikat.lastInn(byteArrayOf(1), """{"password":"$passord"}""".toByteArray(), jacksonObjectMapper())
            }
        e.message.orEmpty() shouldNotContain passord
    }

    @Test
    fun `laster JCEKS-keystore og maskerer passord i toString`() {
        val ks = KeyStore.getInstance("JCEKS").apply { load(null, passord.toCharArray()) }
        val bytes = ByteArrayOutputStream().also { ks.store(it, passord.toCharArray()) }.toByteArray()
        val sertifikat =
            Virksomhetssertifikat.lastInn(
                bytes,
                """{"alias":"min-alias","password":"$passord","type":"JCEKS"}""".toByteArray(),
                jacksonObjectMapper(),
            )
        sertifikat.credentials.alias shouldBe "min-alias"
        sertifikat.toString() shouldNotContain passord
        sertifikat.credentials.toString() shouldNotContain passord
    }
}
