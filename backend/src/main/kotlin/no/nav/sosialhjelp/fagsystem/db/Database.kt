package no.nav.sosialhjelp.fagsystem.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.nav.sosialhjelp.fagsystem.DatabaseConfig
import org.flywaydb.core.Flyway
import javax.sql.DataSource

object Database {
    fun dataSource(config: DatabaseConfig): HikariDataSource =
        HikariDataSource(
            HikariConfig().apply {
                jdbcUrl = config.jdbcUrl
                config.username?.let { username = it }
                config.password?.let { password = it }
                maximumPoolSize = 5
                minimumIdle = 1
            },
        )

    fun migrate(dataSource: DataSource) {
        Flyway.configure().dataSource(dataSource).load().migrate()
    }
}
