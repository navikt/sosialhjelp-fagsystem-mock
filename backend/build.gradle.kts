plugins {
    kotlin("jvm") version "2.4.21"
    id("io.ktor.plugin") version "3.6.0"
}

group = "no.nav.sosialhjelp"

kotlin {
    jvmToolchain(21)
}

application {
    mainClass.set("no.nav.sosialhjelp.fagsystem.ApplicationKt")
}

repositories {
    mavenCentral()
}

val ktorVersion = "3.6.0"

dependencies {
    // Ktor
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-server-call-logging:$ktorVersion")
    implementation("io.ktor:ktor-server-auth:$ktorVersion")
    implementation("io.ktor:ktor-server-metrics-micrometer:$ktorVersion")
    implementation("io.ktor:ktor-serialization-jackson:$ktorVersion")
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("io.micrometer:micrometer-registry-prometheus:1.17.2")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.20.0")

    // Database
    implementation("org.postgresql:postgresql:42.7.14")
    implementation("com.zaxxer:HikariCP:7.1.0")
    implementation("com.github.seratch:kotliquery:1.9.1")
    implementation("org.flywaydb:flyway-database-postgresql:13.11.1")

    // Fiks
    implementation("no.ks.fiks:digisos-klient:3.0.1")
    implementation("no.ks.fiks:fiks-io-klient-java:3.4.5")
    implementation("no.ks.fiks:kryptering:2.0.8")
    implementation("com.google.cloud:google-cloud-secretmanager:2.62.0")

    // Logging
    implementation("ch.qos.logback:logback-classic:1.6.6")
    implementation("net.logstash.logback:logstash-logback-encoder:9.0")

    testImplementation(kotlin("test"))
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("io.ktor:ktor-client-mock:$ktorVersion")
    testImplementation("io.kotest:kotest-assertions-core-jvm:6.2.6")
    testImplementation("org.testcontainers:testcontainers-postgresql:2.0.5")
}

tasks.test {
    useJUnitPlatform()
}
