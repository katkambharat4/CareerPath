# Stage 1: Build stage using Maven and Temurin Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy Maven POM and download dependencies for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy project source files and package executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage using slim Temurin JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-privileged user to run the application securely
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy packaged JAR from builder stage using exact artifact name from pom.xml
COPY --from=builder /build/target/careerpath-backend-1.0.0.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

# Expose standard port (Render dynamically overrides via $PORT environment variable)
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
