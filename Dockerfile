# ==============================================================================
# Multi-Stage Dockerfile for Full-Stack Spring Boot + Vanilla JS Blog App
# Optimized for Render.com Free Tier (512MB RAM) and Cloud Environments
# ==============================================================================

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Configure Maven memory constraints for reliable cloud container builds
ENV MAVEN_OPTS="-Xmx512m -XX:+TieredCompilation -XX:TieredStopAtLevel=1"

# Copy POM and sources
COPY pom.xml .
COPY src ./src

# Build production executable JAR (skipping tests for swift container builds)
RUN mvn clean package -DskipTests --batch-mode

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create unprivileged application user for container security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Render dynamic port environment variable (defaults to 8080)
ENV PORT=8080

EXPOSE 8080

# Launch application with shell expansion so $PORT is dynamically bound by Render
ENTRYPOINT ["sh", "-c", "java -Xmx320m -Xms128m -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-8080} -jar app.jar"]
