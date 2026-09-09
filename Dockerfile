# ==============================================================================
# Multi-Stage Dockerfile for Full-Stack Spring Boot + Vanilla JS Blog App
# Build Stage: Compiles source and packages the production executable JAR
# Runtime Stage: Ultra-lightweight Eclipse Temurin 21 JRE runtime image
# ==============================================================================

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and static resources
COPY src ./src

# Build production executable JAR (skipping tests for swift container builds)
RUN mvn clean package -DskipTests

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create unprivileged application user for container security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose default HTTP port
EXPOSE 8080

# Configure production environment defaults
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

# Launch application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
