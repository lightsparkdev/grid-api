# syntax=docker/dockerfile:1.7
#
# Build context must be the parent `samples/` directory because the Kotlin
# Gradle build invokes `npm install`/`npm run build` against `../frontend`.
# From the repo root:
#
#   docker build -f samples/kotlin/Dockerfile -t grid-sample samples/

# ---- build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src

COPY kotlin/gradlew kotlin/gradlew
COPY kotlin/gradle kotlin/gradle
RUN chmod +x kotlin/gradlew

# Cache Gradle deps before pulling sources.
COPY kotlin/build.gradle.kts kotlin/settings.gradle.kts kotlin/gradle.properties kotlin/
RUN cd kotlin && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

# Cache npm deps before pulling sources.
COPY frontend/package.json frontend/package-lock.json frontend/

# Now the rest of the sources, then build.
COPY kotlin kotlin
COPY frontend frontend
RUN cd kotlin && ./gradlew --no-daemon installDist

# ---- runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /src/kotlin/build/install/grid-sample /app

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/bin/grid-sample"]
