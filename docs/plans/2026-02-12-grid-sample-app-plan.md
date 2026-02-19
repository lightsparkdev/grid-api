# Grid API Sample Application Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a sample app (Kotlin backend + shared React frontend) demonstrating the Grid API payout flow: create customer → external account → quote → execute → sandbox fund, with live webhook streaming.

**Architecture:** Thin backend proxy pattern. Ktor server translates JSON requests to Grid SDK builder calls. React frontend runs a step-by-step wizard, passing IDs between steps. Webhooks stream via SSE from backend to frontend.

**Tech Stack:** Kotlin 2.1 + Ktor 3.x + Grid Kotlin SDK (backend), React 18 + TypeScript + Vite 5 + Tailwind CSS 4 (frontend)

**Design doc:** `docs/plans/2026-02-12-grid-sample-app-design.md`

---

### Task 1: Kotlin Backend — Gradle Project Scaffold

**Files:**
- Create: `samples/kotlin/build.gradle.kts`
- Create: `samples/kotlin/settings.gradle.kts`
- Create: `samples/kotlin/gradle.properties`
- Create: `samples/kotlin/.env.example`
- Create: `samples/kotlin/src/main/resources/application.yaml`
- Create: `samples/kotlin/src/main/resources/logback.xml`

**Step 1: Initialize Gradle wrapper**

```bash
cd samples/kotlin
gradle wrapper --gradle-version 8.12
```

If `gradle` is not installed locally, copy wrapper files from `/Users/pengying/Src/grid-api/sdks/grid-kotlin/`:

```bash
mkdir -p samples/kotlin
cp -r sdks/grid-kotlin/gradle samples/kotlin/gradle
cp sdks/grid-kotlin/gradlew samples/kotlin/gradlew
cp sdks/grid-kotlin/gradlew.bat samples/kotlin/gradlew.bat
```

**Step 2: Create settings.gradle.kts**

```kotlin
rootProject.name = "grid-sample"
```

**Step 3: Create gradle.properties**

```properties
kotlin.code.style=official
org.gradle.jvmargs=-Xmx1024m
```

**Step 4: Create build.gradle.kts**

```kotlin
plugins {
    kotlin("jvm") version "2.1.21"
    kotlin("plugin.serialization") version "2.1.21"
    id("io.ktor.plugin") version "3.1.3"
}

kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

group = "com.grid.sample"
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=true")
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor server
    implementation("io.ktor:ktor-server-core:3.1.3")
    implementation("io.ktor:ktor-server-netty:3.1.3")
    implementation("io.ktor:ktor-server-cors:3.1.3")
    implementation("io.ktor:ktor-server-sse:3.1.3")
    implementation("io.ktor:ktor-server-content-negotiation:3.1.3")
    implementation("io.ktor:ktor-server-config-yaml:3.1.3")

    // Grid Kotlin SDK
    implementation("com.lightspark.grid:lightspark-grid-kotlin:0.4.0")

    // JSON
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.18.2")

    // Environment
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")

    // Logging
    implementation("ch.qos.logback:logback-classic:1.5.6")
}
```

**Step 5: Create .env.example**

```bash
# Grid API Credentials (from https://app.lightspark.com)
GRID_API_TOKEN_ID=your_api_token_id
GRID_API_CLIENT_SECRET=your_api_client_secret

# Webhook verification (P-256 public key, PEM format)
GRID_WEBHOOK_PUBLIC_KEY=your_webhook_public_key
```

**Step 6: Create application.yaml**

```yaml
ktor:
  application:
    modules:
      - com.grid.sample.ApplicationKt.module
  deployment:
    port: 8080
```

**Step 7: Create logback.xml**

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="INFO">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

**Step 8: Verify compilation**

```bash
cd samples/kotlin && ./gradlew build
```

Expected: BUILD SUCCESSFUL (may have warnings about no source files yet, that's fine)

**Step 9: Commit**

```bash
git add samples/kotlin/
git commit -m "feat(samples): scaffold Kotlin backend Gradle project"
```

---

### Task 2: Kotlin Backend — Core Infrastructure

**Files:**
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/Application.kt`
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/Config.kt`
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/GridClientBuilder.kt`
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/WebhookStream.kt`
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/JsonUtils.kt`
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/Routing.kt`

**Step 1: Create Config.kt**

```kotlin
package com.grid.sample

import io.github.cdimascio.dotenv.dotenv

object Config {
    private val dotenv = dotenv {
        directory = "./"
        ignoreIfMalformed = true
        ignoreIfMissing = true
    }

    val apiTokenId: String = getEnvVar("GRID_API_TOKEN_ID")
    val apiClientSecret: String = getEnvVar("GRID_API_CLIENT_SECRET")
    val webhookPublicKey: String = getEnvVar("GRID_WEBHOOK_PUBLIC_KEY").replace("\\n", "\n")

    private fun getEnvVar(key: String): String =
        System.getProperty(key)
            ?: dotenv[key]
            ?: System.getenv(key)
            ?: throw IllegalStateException("$key environment variable not set")
}
```

**Step 2: Create GridClientBuilder.kt**

```kotlin
package com.grid.sample

import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

object GridClientBuilder {
    val client: GridClient by lazy {
        GridOkHttpClient.builder()
            .username(Config.apiTokenId)
            .password(Config.apiClientSecret)
            .build()
    }
}
```

**Step 3: Create WebhookStream.kt**

```kotlin
package com.grid.sample

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

object WebhookStream {
    private val _eventFlow = MutableSharedFlow<String>(replay = 10)
    val eventFlow: SharedFlow<String> = _eventFlow.asSharedFlow()

    fun addEvent(event: String) {
        println("Broadcasting webhook: $event")
        _eventFlow.tryEmit(event)
    }
}
```

**Step 4: Create JsonUtils.kt**

```kotlin
package com.grid.sample

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

object JsonUtils {
    val mapper: ObjectMapper = jacksonObjectMapper().apply {
        enable(SerializationFeature.INDENT_OUTPUT)
    }

    fun prettyPrint(obj: Any): String =
        try {
            mapper.writeValueAsString(obj)
        } catch (e: Exception) {
            """{"error": "Failed to serialize response: ${e.message}"}"""
        }
}
```

**Step 5: Create Routing.kt**

Minimal routing that just installs CORS and SSE — route modules added in later tasks.

```kotlin
package com.grid.sample

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.routing.*
import io.ktor.server.sse.*

fun Application.module() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowCredentials = true
        anyHost()
    }
    install(SSE)
    routing {
        // Route modules will be added here
    }
}
```

**Step 6: Create Application.kt**

```kotlin
package com.grid.sample

import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}
```

**Step 7: Verify compilation**

```bash
cd samples/kotlin && ./gradlew build
```

Expected: BUILD SUCCESSFUL

**Step 8: Commit**

```bash
git add samples/kotlin/src/
git commit -m "feat(samples): add Kotlin backend core infrastructure"
```

---

### Task 3: Kotlin Backend — Customer Route

**Files:**
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/Customers.kt`
- Modify: `samples/kotlin/src/main/kotlin/com/grid/sample/Routing.kt`

**Step 1: Create Customers.kt**

```kotlin
package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.grid.api.models.customers.CustomerCreateParams
import com.grid.api.models.customers.CustomerCreateParams.CreateCustomerRequest
import com.grid.api.models.customers.CustomerType
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.customerRoutes() {
    route("/api/customers") {
        post {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)

                val individualRequest = CreateCustomerRequest
                    .IndividualCustomerCreateRequest.builder()
                    .customerType(CustomerType.INDIVIDUAL)
                    .apply {
                        json.optText("platformCustomerId")?.let { platformCustomerId(it) }
                        json.optText("fullName")?.let { fullName(it) }
                        json.optText("nationality")?.let { nationality(it) }
                    }
                    .build()

                val params = CustomerCreateParams.builder()
                    .createCustomerRequest(
                        CreateCustomerRequest.ofIndividualCustomerCreate(individualRequest)
                    )
                    .build()

                val customer = GridClientBuilder.client.customers().create(params)
                call.respondText(
                    JsonUtils.prettyPrint(customer),
                    ContentType.Application.Json,
                    HttpStatusCode.Created
                )
            } catch (e: Exception) {
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null
```

**Step 2: Register route in Routing.kt**

Add inside the `routing { }` block:

```kotlin
import com.grid.sample.routes.customerRoutes

// Inside routing { }:
customerRoutes()
```

**Step 3: Verify compilation**

```bash
cd samples/kotlin && ./gradlew build
```

Expected: BUILD SUCCESSFUL

**Step 4: Commit**

```bash
git add samples/kotlin/src/
git commit -m "feat(samples): add customer creation route"
```

---

### Task 4: Kotlin Backend — External Account Route

**Files:**
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/ExternalAccounts.kt`
- Modify: `samples/kotlin/src/main/kotlin/com/grid/sample/Routing.kt`

**Step 1: Create ExternalAccounts.kt**

```kotlin
package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreateParams
import com.grid.api.models.customers.externalaccounts.ExternalAccountInfoOneOf
import com.grid.api.models.customers.externalaccounts.IndividualBeneficiary
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.externalAccountRoutes() {
    route("/api/customers/{customerId}/external-accounts") {
        post {
            try {
                val customerId = call.parameters["customerId"]
                    ?: return@post call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)
                val accountInfo = json.get("accountInfo")

                val usAccountInfo = ExternalAccountInfoOneOf
                    .UsAccountExternalAccountInfo.builder()
                    .accountNumber(accountInfo.get("accountNumber").asText())
                    .routingNumber(accountInfo.get("routingNumber").asText())
                    .accountType(accountInfo.optText("accountType") ?: "CHECKING")
                    .apply {
                        val beneficiaryNode = json.get("beneficiary")
                        if (beneficiaryNode != null && !beneficiaryNode.isNull) {
                            beneficiary(
                                IndividualBeneficiary.builder()
                                    .firstName(beneficiaryNode.optText("firstName") ?: "")
                                    .lastName(beneficiaryNode.optText("lastName") ?: "")
                                    .build()
                            )
                        }
                    }
                    .build()

                val externalAccountCreate = ExternalAccountCreate.builder()
                    .accountInfo(
                        ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(usAccountInfo)
                    )
                    .currency(json.optText("currency") ?: "USD")
                    .customerId(customerId)
                    .apply {
                        json.optText("platformAccountId")?.let { platformAccountId(it) }
                    }
                    .build()

                val params = ExternalAccountCreateParams.builder()
                    .externalAccountCreate(externalAccountCreate)
                    .build()

                val account = GridClientBuilder.client.customers().externalAccounts().create(params)
                call.respondText(
                    JsonUtils.prettyPrint(account),
                    ContentType.Application.Json,
                    HttpStatusCode.Created
                )
            } catch (e: Exception) {
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null
```

**Step 2: Register route in Routing.kt**

```kotlin
import com.grid.sample.routes.externalAccountRoutes

// Inside routing { }:
externalAccountRoutes()
```

**Step 3: Verify compilation**

```bash
cd samples/kotlin && ./gradlew build
```

**Step 4: Commit**

```bash
git add samples/kotlin/src/
git commit -m "feat(samples): add external account creation route"
```

---

### Task 5: Kotlin Backend — Quote Routes (Create + Execute)

**Files:**
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/Quotes.kt`
- Modify: `samples/kotlin/src/main/kotlin/com/grid/sample/Routing.kt`

**Step 1: Create Quotes.kt**

```kotlin
package com.grid.sample.routes

import com.fasterxml.jackson.databind.JsonNode
import com.grid.api.models.quotes.BaseDestination
import com.grid.api.models.quotes.BaseQuoteSource
import com.grid.api.models.quotes.QuoteCreateParams
import com.grid.api.models.quotes.QuoteSourceOneOf
import com.grid.api.models.quotes.QuoteDestinationOneOf
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.quoteRoutes() {
    route("/api/quotes") {
        post {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)

                val sourceNode = json.get("source")
                val source = buildQuoteSource(sourceNode)

                val destNode = json.get("destination")
                val destination = buildQuoteDestination(destNode)

                val params = QuoteCreateParams.builder()
                    .source(source)
                    .destination(destination)
                    .lockedCurrencyAmount(json.get("lockedCurrencyAmount").asLong())
                    .lockedCurrencySide(
                        when (json.optText("lockedCurrencySide")?.uppercase()) {
                            "RECEIVING" -> QuoteCreateParams.LockedCurrencySide.RECEIVING
                            else -> QuoteCreateParams.LockedCurrencySide.SENDING
                        }
                    )
                    .apply {
                        json.optText("description")?.let { description(it) }
                    }
                    .build()

                val quote = GridClientBuilder.client.quotes().create(params)
                call.respondText(
                    JsonUtils.prettyPrint(quote),
                    ContentType.Application.Json,
                    HttpStatusCode.Created
                )
            } catch (e: Exception) {
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        post("/{quoteId}/execute") {
            try {
                val quoteId = call.parameters["quoteId"]
                    ?: return@post call.respondText(
                        """{"error": "quoteId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val quote = GridClientBuilder.client.quotes().execute(quoteId)
                call.respondText(
                    JsonUtils.prettyPrint(quote),
                    ContentType.Application.Json,
                    HttpStatusCode.OK
                )
            } catch (e: Exception) {
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

private fun buildQuoteSource(sourceNode: JsonNode): QuoteSourceOneOf {
    val sourceType = sourceNode.optText("sourceType")

    if (sourceType == "REALTIME_FUNDING" || sourceNode.has("currency")) {
        return QuoteSourceOneOf.ofRealtimeFundingQuoteSource(
            QuoteSourceOneOf.RealtimeFundingQuoteSource.builder()
                .sourceType(BaseQuoteSource.SourceType.REALTIME_FUNDING)
                .currency(sourceNode.get("currency").asText())
                .apply {
                    sourceNode.optText("customerId")?.let { customerId(it) }
                }
                .build()
        )
    }

    return QuoteSourceOneOf.ofAccountQuoteSource(
        QuoteSourceOneOf.AccountQuoteSource.builder()
            .sourceType(BaseQuoteSource.SourceType.ACCOUNT)
            .accountId(sourceNode.get("accountId").asText())
            .apply {
                sourceNode.optText("customerId")?.let { customerId(it) }
            }
            .build()
    )
}

private fun buildQuoteDestination(destNode: JsonNode): QuoteDestinationOneOf {
    if (destNode.has("umaAddress")) {
        return QuoteDestinationOneOf.ofUmaAddressDestination(
            QuoteDestinationOneOf.UmaAddressDestination.builder()
                .destinationType(BaseDestination.DestinationType.UMA_ADDRESS)
                .umaAddress(destNode.get("umaAddress").asText())
                .build()
        )
    }

    return QuoteDestinationOneOf.ofAccountDestination(
        QuoteDestinationOneOf.AccountDestination.builder()
            .destinationType(BaseDestination.DestinationType.ACCOUNT)
            .accountId(destNode.get("accountId").asText())
            .build()
    )
}

private fun JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null
```

**Step 2: Register route in Routing.kt**

```kotlin
import com.grid.sample.routes.quoteRoutes

// Inside routing { }:
quoteRoutes()
```

**Step 3: Verify compilation**

```bash
cd samples/kotlin && ./gradlew build
```

**Step 4: Commit**

```bash
git add samples/kotlin/src/
git commit -m "feat(samples): add quote creation and execution routes"
```

---

### Task 6: Kotlin Backend — Sandbox + Webhooks + SSE Routes

**Files:**
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/Sandbox.kt`
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/Webhooks.kt`
- Create: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/Sse.kt`
- Modify: `samples/kotlin/src/main/kotlin/com/grid/sample/Routing.kt`

**Step 1: Create Sandbox.kt**

```kotlin
package com.grid.sample.routes

import com.grid.api.models.sandbox.SandboxSendFundsParams
import com.grid.sample.GridClientBuilder
import com.grid.sample.JsonUtils
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.sandboxRoutes() {
    route("/api/sandbox") {
        post("/send-funds") {
            try {
                val body = call.receiveText()
                val json = JsonUtils.mapper.readTree(body)

                val params = SandboxSendFundsParams.builder()
                    .quoteId(json.get("quoteId").asText())
                    .currencyCode(json.optText("currencyCode") ?: "USD")
                    .apply {
                        if (json.has("currencyAmount") && !json.get("currencyAmount").isNull) {
                            currencyAmount(json.get("currencyAmount").asLong())
                        }
                    }
                    .build()

                val response = GridClientBuilder.client.sandbox().sendFunds(params)
                call.respondText(
                    JsonUtils.prettyPrint(response),
                    ContentType.Application.Json,
                    HttpStatusCode.OK
                )
            } catch (e: Exception) {
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
    }
}

private fun com.fasterxml.jackson.databind.JsonNode.optText(field: String): String? =
    if (has(field) && !get(field).isNull) get(field).asText() else null
```

**Step 2: Create Webhooks.kt**

```kotlin
package com.grid.sample.routes

import com.grid.sample.Config
import com.grid.sample.WebhookStream
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.security.KeyFactory
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

fun Route.webhookRoutes() {
    route("/api/webhooks") {
        post {
            val rawBody = call.receiveText()
            val signatureHeader = call.request.headers["X-Grid-Signature"]

            if (signatureHeader != null) {
                val isValid = verifyWebhookSignature(rawBody, signatureHeader)
                if (!isValid) {
                    call.respondText(
                        """{"error": "Invalid webhook signature"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.Unauthorized
                    )
                    return@post
                }
            }

            WebhookStream.addEvent(rawBody)
            call.respond(HttpStatusCode.OK)
        }
    }
}

private fun verifyWebhookSignature(body: String, signature: String): Boolean {
    return try {
        val publicKeyPem = Config.webhookPublicKey
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")

        val keyBytes = Base64.getDecoder().decode(publicKeyPem)
        val keySpec = X509EncodedKeySpec(keyBytes)
        val keyFactory = KeyFactory.getInstance("EC")
        val publicKey = keyFactory.generatePublic(keySpec)

        val sig = Signature.getInstance("SHA256withECDSA")
        sig.initVerify(publicKey)
        sig.update(body.toByteArray())

        val decodedSignature = Base64.getDecoder().decode(signature)
        sig.verify(decodedSignature)
    } catch (e: Exception) {
        println("Webhook signature verification failed: ${e.message}")
        false
    }
}
```

**Step 3: Create Sse.kt**

```kotlin
package com.grid.sample.routes

import com.grid.sample.WebhookStream
import io.ktor.server.routing.*
import io.ktor.server.sse.*
import io.ktor.sse.*
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlin.time.Duration.Companion.seconds

fun Route.sseRoutes() {
    sse("/api/sse") {
        val connected = """{"type":"connected","timestamp":${System.currentTimeMillis()}}"""
        send(ServerSentEvent(connected))

        WebhookStream.eventFlow
            .onEach { event -> send(ServerSentEvent(event)) }
            .catch { e -> println("SSE stream error: ${e.message}") }
            .launchIn(this)
    }

    sse("/api/sse/heartbeat") {
        heartbeat {
            period = 30.seconds
            event = ServerSentEvent("heartbeat")
        }
    }
}
```

**Step 4: Update Routing.kt with all routes**

Replace the full `Routing.kt` with:

```kotlin
package com.grid.sample

import com.grid.sample.routes.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.routing.*
import io.ktor.server.sse.*

fun Application.module() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowCredentials = true
        anyHost()
    }
    install(SSE)
    routing {
        customerRoutes()
        externalAccountRoutes()
        quoteRoutes()
        sandboxRoutes()
        webhookRoutes()
        sseRoutes()
    }
}
```

**Step 5: Verify compilation**

```bash
cd samples/kotlin && ./gradlew build
```

Expected: BUILD SUCCESSFUL

**Step 6: Commit**

```bash
git add samples/kotlin/src/
git commit -m "feat(samples): add sandbox, webhook, and SSE routes"
```

---

### Task 7: Frontend — Vite + React + Tailwind Scaffold

**Files:**
- Create: `samples/frontend/package.json`
- Create: `samples/frontend/vite.config.ts`
- Create: `samples/frontend/tsconfig.json`
- Create: `samples/frontend/tsconfig.node.json`
- Create: `samples/frontend/index.html`
- Create: `samples/frontend/src/main.tsx`
- Create: `samples/frontend/src/index.css`

**Step 1: Create package.json**

```json
{
  "name": "grid-sample-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.10",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.10",
    "typescript": "^5.6.3",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

**Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 5: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid API Sample</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 6: Create src/index.css**

```css
@import "tailwindcss";
```

**Step 7: Create src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 8: Create placeholder src/App.tsx**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Grid API Sample</h1>
      <p className="text-gray-400">Frontend scaffold — components coming next.</p>
    </div>
  )
}
```

**Step 9: Install dependencies and verify**

```bash
cd samples/frontend && npm install && npm run build
```

Expected: Build succeeds, output in `dist/`

**Step 10: Commit**

```bash
git add samples/frontend/
git commit -m "feat(samples): scaffold Vite + React + Tailwind frontend"
```

---

### Task 8: Frontend — API Client + Shared Components

**Files:**
- Create: `samples/frontend/src/lib/api.ts`
- Create: `samples/frontend/src/components/JsonEditor.tsx`
- Create: `samples/frontend/src/components/ResponsePanel.tsx`

**Step 1: Create api.ts**

```typescript
export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data: T
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(text)
  }
  if (!res.ok) {
    throw new Error((data as Record<string, string>).error ?? text)
  }
  return data
}
```

**Step 2: Create JsonEditor.tsx**

```tsx
import { useState, useEffect } from 'react'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function JsonEditor({ value, onChange, disabled }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      JSON.parse(value)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [value])

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        className="w-full h-48 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-y disabled:opacity-50"
      />
      {error && (
        <p className="text-red-400 text-xs mt-1">Invalid JSON: {error}</p>
      )}
    </div>
  )
}
```

**Step 3: Create ResponsePanel.tsx**

```tsx
import { useState } from 'react'

interface ResponsePanelProps {
  response: string | null
  error: string | null
}

export default function ResponsePanel({ response, error }: ResponsePanelProps) {
  const [expanded, setExpanded] = useState(true)

  if (!response && !error) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-400 hover:text-gray-200 mb-1"
      >
        {expanded ? '▼' : '▶'} Response
      </button>
      {expanded && (
        <pre
          className={`text-sm font-mono p-3 rounded-lg overflow-auto max-h-64 ${
            error
              ? 'bg-red-950 text-red-300 border border-red-800'
              : 'bg-gray-900 text-gray-300 border border-gray-700'
          }`}
        >
          {error ?? response}
        </pre>
      )}
    </div>
  )
}
```

**Step 4: Verify build**

```bash
cd samples/frontend && npm run build
```

**Step 5: Commit**

```bash
git add samples/frontend/src/
git commit -m "feat(samples): add API client and shared editor/response components"
```

---

### Task 9: Frontend — Step Components

**Files:**
- Create: `samples/frontend/src/steps/CreateCustomer.tsx`
- Create: `samples/frontend/src/steps/CreateExternalAccount.tsx`
- Create: `samples/frontend/src/steps/CreateQuote.tsx`
- Create: `samples/frontend/src/steps/ExecuteQuote.tsx`
- Create: `samples/frontend/src/steps/SandboxFund.tsx`

**Step 1: Create CreateCustomer.tsx**

```tsx
import { useState } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

const DEFAULT_BODY = JSON.stringify({
  customerType: "INDIVIDUAL",
  platformCustomerId: `sample-customer-${Date.now()}`
}, null, 2)

interface Props {
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function CreateCustomer({ onComplete, disabled }: Props) {
  const [body, setBody] = useState(DEFAULT_BODY)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>('/api/customers', JSON.parse(body))
      const pretty = JSON.stringify(data, null, 2)
      setResponse(pretty)
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">Create an individual customer on the Grid platform.</p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Creating...' : 'Create Customer'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
```

**Step 2: Create CreateExternalAccount.tsx**

```tsx
import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  customerId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function CreateExternalAccount({ customerId, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBody(JSON.stringify({
      currency: "USD",
      accountInfo: {
        accountType: "CHECKING",
        routingNumber: "021000021",
        accountNumber: "123456789"
      }
    }, null, 2))
  }, [customerId])

  const submit = async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>(
        `/api/customers/${customerId}/external-accounts`,
        JSON.parse(body)
      )
      const pretty = JSON.stringify(data, null, 2)
      setResponse(pretty)
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Create a USD bank account for customer <code className="text-blue-400">{customerId ?? '...'}</code>
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Creating...' : 'Create External Account'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
```

**Step 3: Create CreateQuote.tsx**

```tsx
import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  externalAccountId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function CreateQuote({ externalAccountId, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBody(JSON.stringify({
      source: {
        sourceType: "REALTIME_FUNDING",
        currency: "USDC"
      },
      destination: {
        destinationType: "ACCOUNT",
        accountId: externalAccountId ?? "<external-account-id>"
      },
      lockedCurrencyAmount: 1000,
      lockedCurrencySide: "SENDING"
    }, null, 2))
  }, [externalAccountId])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>('/api/quotes', JSON.parse(body))
      const pretty = JSON.stringify(data, null, 2)
      setResponse(pretty)
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Create a quote to send USDC → USD to external account <code className="text-blue-400">{externalAccountId ?? '...'}</code>
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Creating...' : 'Create Quote'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
```

**Step 4: Create ExecuteQuote.tsx**

```tsx
import { useState } from 'react'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  quoteId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function ExecuteQuote({ quoteId, onComplete, disabled }: Props) {
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!quoteId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>(`/api/quotes/${quoteId}/execute`)
      const pretty = JSON.stringify(data, null, 2)
      setResponse(pretty)
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Execute quote <code className="text-blue-400">{quoteId ?? '...'}</code> to initiate the payment.
      </p>
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Executing...' : 'Execute Quote'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
```

**Step 5: Create SandboxFund.tsx**

```tsx
import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  quoteId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function SandboxFund({ quoteId, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBody(JSON.stringify({
      quoteId: quoteId ?? "<quote-id>",
      currencyCode: "USD"
    }, null, 2))
  }, [quoteId])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>('/api/sandbox/send-funds', JSON.parse(body))
      const pretty = JSON.stringify(data, null, 2)
      setResponse(pretty)
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Simulate funding in the sandbox to complete the payment.
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Funding...' : 'Send Sandbox Funds'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
```

**Step 6: Verify build**

```bash
cd samples/frontend && npm run build
```

**Step 7: Commit**

```bash
git add samples/frontend/src/steps/
git commit -m "feat(samples): add all wizard step components"
```

---

### Task 10: Frontend — Webhook Stream + Step Wizard + App Assembly

**Files:**
- Create: `samples/frontend/src/components/WebhookStream.tsx`
- Create: `samples/frontend/src/components/StepWizard.tsx`
- Modify: `samples/frontend/src/App.tsx`

**Step 1: Create WebhookStream.tsx**

```tsx
import { useState, useEffect, useRef } from 'react'

interface WebhookEvent {
  timestamp: number
  type: string
  raw: string
}

export default function WebhookStream() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/sse')
      eventSourceRef.current = es

      es.onopen = () => setConnected(true)
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'connected') return
          setEvents((prev) => [{
            timestamp: Date.now(),
            type: data.type ?? 'unknown',
            raw: JSON.stringify(data, null, 2)
          }, ...prev])
        } catch {
          setEvents((prev) => [{
            timestamp: Date.now(),
            type: 'raw',
            raw: event.data
          }, ...prev])
        }
      }
      es.onerror = () => {
        setConnected(false)
        es.close()
        setTimeout(connect, 3000)
      }
    }

    connect()
    return () => eventSourceRef.current?.close()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold">Webhooks</h2>
        <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {events.length === 0 && (
          <p className="text-sm text-gray-500">No webhook events received yet.</p>
        )}
        {events.map((evt, i) => (
          <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-900 text-purple-300 text-xs rounded font-mono">
                  {evt.type}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                {expandedIndex === i ? '▼' : '▶'}
              </button>
            </div>
            {expandedIndex === i && (
              <pre className="mt-2 text-xs font-mono text-gray-300 overflow-auto max-h-48">
                {evt.raw}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Create StepWizard.tsx**

```tsx
import { ReactNode } from 'react'

interface Step {
  title: string
  summary: string | null
  content: ReactNode
}

interface StepWizardProps {
  steps: Step[]
  activeStep: number
}

export default function StepWizard({ steps, activeStep }: StepWizardProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const isCompleted = i < activeStep
        const isActive = i === activeStep
        const isFuture = i > activeStep

        return (
          <div key={i} className={`rounded-lg border ${
            isActive ? 'border-blue-600 bg-gray-900' :
            isCompleted ? 'border-green-800 bg-gray-900/50' :
            'border-gray-800 bg-gray-900/30 opacity-50'
          }`}>
            <div className="flex items-center gap-3 p-4">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                isCompleted ? 'bg-green-700 text-green-200' :
                isActive ? 'bg-blue-600 text-white' :
                'bg-gray-700 text-gray-400'
              }`}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <h3 className={`font-medium ${isFuture ? 'text-gray-500' : 'text-gray-100'}`}>
                {step.title}
              </h3>
              {isCompleted && step.summary && (
                <span className="ml-auto text-xs text-green-400 font-mono truncate max-w-xs">
                  {step.summary}
                </span>
              )}
            </div>
            {isActive && (
              <div className="px-4 pb-4">
                {step.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

**Step 3: Rewrite App.tsx**

```tsx
import { useState } from 'react'
import StepWizard from './components/StepWizard'
import WebhookStream from './components/WebhookStream'
import CreateCustomer from './steps/CreateCustomer'
import CreateExternalAccount from './steps/CreateExternalAccount'
import CreateQuote from './steps/CreateQuote'
import ExecuteQuote from './steps/ExecuteQuote'
import SandboxFund from './steps/SandboxFund'

export default function App() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [externalAccountId, setExternalAccountId] = useState<string | null>(null)
  const [quoteId, setQuoteId] = useState<string | null>(null)

  const advance = () => setActiveStep((s) => s + 1)

  const steps = [
    {
      title: '1. Create Customer',
      summary: customerId ? `ID: ${customerId}` : null,
      content: (
        <CreateCustomer
          disabled={activeStep !== 0}
          onComplete={(data) => {
            setCustomerId(data.id as string)
            advance()
          }}
        />
      ),
    },
    {
      title: '2. Create External Account',
      summary: externalAccountId ? `ID: ${externalAccountId}` : null,
      content: (
        <CreateExternalAccount
          customerId={customerId}
          disabled={activeStep !== 1}
          onComplete={(data) => {
            setExternalAccountId(data.id as string)
            advance()
          }}
        />
      ),
    },
    {
      title: '3. Create Quote',
      summary: quoteId ? `ID: ${quoteId}` : null,
      content: (
        <CreateQuote
          externalAccountId={externalAccountId}
          disabled={activeStep !== 2}
          onComplete={(data) => {
            setQuoteId((data.quoteId ?? data.id) as string)
            advance()
          }}
        />
      ),
    },
    {
      title: '4. Execute Quote',
      summary: activeStep > 3 ? 'Executed' : null,
      content: (
        <ExecuteQuote
          quoteId={quoteId}
          disabled={activeStep !== 3}
          onComplete={() => advance()}
        />
      ),
    },
    {
      title: '5. Sandbox Fund',
      summary: activeStep > 4 ? 'Funded' : null,
      content: (
        <SandboxFund
          quoteId={quoteId}
          disabled={activeStep !== 4}
          onComplete={() => advance()}
        />
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold">Grid API Sample</h1>
        <p className="text-sm text-gray-400">Payout flow: USDC → USD via external bank account</p>
      </header>
      <div className="flex">
        <main className="w-3/5 p-6 border-r border-gray-800 min-h-[calc(100vh-73px)]">
          <StepWizard steps={steps} activeStep={activeStep} />
        </main>
        <aside className="w-2/5 p-6 min-h-[calc(100vh-73px)]">
          <WebhookStream />
        </aside>
      </div>
    </div>
  )
}
```

**Step 4: Verify build**

```bash
cd samples/frontend && npm run build
```

**Step 5: Commit**

```bash
git add samples/frontend/src/
git commit -m "feat(samples): assemble wizard flow, webhook stream, and App layout"
```

---

### Task 11: READMEs

**Files:**
- Create: `samples/README.md`
- Create: `samples/kotlin/README.md`
- Create: `samples/frontend/README.md`

**Step 1: Create samples/README.md**

```markdown
# Grid API Samples

Sample applications demonstrating the Grid API payout flow — creating a customer, linking a bank account, creating and executing a quote, and simulating funding in the sandbox.

## Structure

```
samples/
├── frontend/   # Shared React frontend (works with any backend)
└── kotlin/     # Kotlin (Ktor) backend using the Grid Kotlin SDK
```

## Quick Start

See the [Kotlin backend README](kotlin/README.md) for setup instructions.

## Adding a New Language Backend

Each backend must implement the same API contract:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/customers` | Create a customer |
| POST | `/api/customers/{id}/external-accounts` | Create an external account |
| POST | `/api/quotes` | Create a quote |
| POST | `/api/quotes/{id}/execute` | Execute a quote |
| POST | `/api/sandbox/send-funds` | Simulate sandbox funding |
| POST | `/api/webhooks` | Receive webhook events from Grid |
| GET  | `/api/sse` | Stream webhook events to the frontend via SSE |

The backend should run on port `8080`. The frontend proxies `/api` requests to `http://localhost:8080`.
```

**Step 2: Create samples/kotlin/README.md**

```markdown
# Grid API Kotlin Sample

A sample application demonstrating the Grid API payout flow using the [Grid Kotlin SDK](https://github.com/lightsparkdev/grid-kotlin-sdk).

## What It Does

This sample walks through a complete payout:

1. **Create Customer** — Register an individual customer on the platform
2. **Create External Account** — Link a USD bank account to the customer
3. **Create Quote** — Get a real-time quote for USDC → USD conversion
4. **Execute Quote** — Initiate the payment
5. **Sandbox Fund** — Simulate funding to complete the transaction

Webhook events are streamed to the frontend in real time via Server-Sent Events (SSE).

## Prerequisites

- **Java 21+** ([Eclipse Temurin](https://adoptium.net/) recommended)
- **Node.js 18+** (for the frontend)
- **Grid API sandbox credentials** from [app.lightspark.com](https://app.lightspark.com)

## Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:

   ```bash
   GRID_API_TOKEN_ID=your_api_token_id
   GRID_API_CLIENT_SECRET=your_api_client_secret
   GRID_WEBHOOK_PUBLIC_KEY=your_webhook_public_key
   ```

## Running

Start the backend and frontend in two separate terminals:

**Terminal 1 — Backend (port 8080):**

```bash
cd samples/kotlin
./gradlew run
```

**Terminal 2 — Frontend (port 5173):**

```bash
cd samples/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Webhook Setup

To receive webhooks locally, expose your backend with a tunnel:

```bash
ngrok http 8080
```

Then configure the webhook URL in your [Grid dashboard](https://app.lightspark.com) as:

```
https://<your-ngrok-id>.ngrok.io/api/webhooks
```

## Architecture

```
Browser (React)  →  Vite Dev Server (:5173)  →  Ktor Backend (:8080)  →  Grid API
                         proxy /api                 Grid Kotlin SDK
                                                         ↑
                                              Grid Webhooks (POST)
                                                         ↓
                                              SSE stream → Browser
```

The backend is a thin proxy — it holds your API credentials and translates JSON requests into Grid SDK calls. The frontend handles the step-by-step wizard flow.
```

**Step 3: Create samples/frontend/README.md**

```markdown
# Grid API Sample Frontend

Shared React frontend for the Grid API sample backends. Works with any backend that implements the [API contract](../README.md).

## Running

```bash
npm install
npm run dev
```

The dev server starts on [http://localhost:5173](http://localhost:5173) and proxies `/api` requests to `http://localhost:8080`.

## Configuring the Backend URL

If your backend runs on a different port, update the proxy target in `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',
  }
}
```

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 4
```

**Step 4: Commit**

```bash
git add samples/README.md samples/kotlin/README.md samples/frontend/README.md
git commit -m "docs(samples): add READMEs for samples, Kotlin backend, and frontend"
```

---

### Task 12: Final Verification

**Step 1: Verify Kotlin backend compiles**

```bash
cd samples/kotlin && ./gradlew build
```

Expected: BUILD SUCCESSFUL

**Step 2: Verify frontend builds**

```bash
cd samples/frontend && npm run build
```

Expected: Build succeeds

**Step 3: Manually test the full flow**

1. Set up `.env` with real sandbox credentials
2. Start backend: `cd samples/kotlin && ./gradlew run`
3. Start frontend: `cd samples/frontend && npm run dev`
4. Open http://localhost:5173
5. Walk through all 5 wizard steps
6. Verify webhooks appear in the right panel (if webhook URL is configured)

**Step 4: Final commit if any fixes needed**

```bash
git add -A samples/
git commit -m "fix(samples): address issues found during manual testing"
```
