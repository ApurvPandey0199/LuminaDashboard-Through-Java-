package com.apurv.blog.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${SPRING_DATASOURCE_URL:}")
    private String datasourceUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:}")
    private String datasourceUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String datasourcePassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // If a real external MySQL database URL is provided (e.g. from Render or Railway)
        if (datasourceUrl != null && !datasourceUrl.isBlank() && !datasourceUrl.contains("localhost")) {
            logger.info("Configuring production MySQL DataSource with URL: {}", datasourceUrl);
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(datasourceUrl);
            ds.setUsername(datasourceUsername != null ? datasourceUsername : "root");
            ds.setPassword(datasourcePassword != null ? datasourcePassword : "");
            ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
            ds.setMaximumPoolSize(5);
            ds.setMinimumIdle(1);
            ds.setConnectionTimeout(20000);
            ds.setIdleTimeout(30000);
            return ds;
        }

        // Resilient fallback to in-memory database with MySQL compatibility mode
        logger.info("No external MySQL URL provided. Falling back to in-memory database in MySQL mode for instant zero-config startup.");
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:h2:mem:blog_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL");
        ds.setDriverClassName("org.h2.Driver");
        ds.setUsername("sa");
        ds.setPassword("");
        ds.setMaximumPoolSize(5);
        return ds;
    }
}
