# Grid Kotlin API Library

[![Maven Central](https://img.shields.io/maven-central/v/com.grid.api/grid-kotlin)](https://central.sonatype.com/artifact/com.grid.api/grid-kotlin/0.0.1)
[![javadoc](https://javadoc.io/badge2/com.grid.api/grid-kotlin/0.0.1/javadoc.svg)](https://javadoc.io/doc/com.grid.api/grid-kotlin/0.0.1)

The Grid Kotlin SDK provides convenient access to the [Grid REST API](grid.lightspark.com) from applications written in Kotlin.

It is generated with [Stainless](https://www.stainless.com/).

KDocs are available on [javadoc.io](https://javadoc.io/doc/com.grid.api/grid-kotlin/0.0.1).

## Installation

### Gradle

```kotlin
implementation("com.grid.api:grid-kotlin:0.0.1")
```

### Maven

```xml
<dependency>
  <groupId>com.grid.api</groupId>
  <artifactId>grid-kotlin</artifactId>
  <version>0.0.1</version>
</dependency>
```

## Requirements

This library requires Java 8 or later.

## Usage

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.quotes.Quote
import com.grid.api.models.quotes.QuoteCreateParams

// Configures using the `grid.username`, `grid.password`, `grid.webhookSignature` and `grid.baseUrl` system properties
// Or configures using the `GRID_USERNAME`, `GRID_PASSWORD`, `GRID_WEBHOOK_SIGNATURE` and `GRID_BASE_URL` environment variables
val client: GridClient = GridOkHttpClient.fromEnv()

val params: QuoteCreateParams = QuoteCreateParams.builder()
    .accountDestination("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
    .lockedCurrencyAmount(10000L)
    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
    .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
    .build()
val quote: Quote = client.quotes().create(params)
```

## Client configuration

Configure the client using system properties or environment variables:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

// Configures using the `grid.username`, `grid.password`, `grid.webhookSignature` and `grid.baseUrl` system properties
// Or configures using the `GRID_USERNAME`, `GRID_PASSWORD`, `GRID_WEBHOOK_SIGNATURE` and `GRID_BASE_URL` environment variables
val client: GridClient = GridOkHttpClient.fromEnv()
```

Or manually:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

val client: GridClient = GridOkHttpClient.builder()
    .username("My Username")
    .password("My Password")
    .build()
```

Or using a combination of the two approaches:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

val client: GridClient = GridOkHttpClient.builder()
    // Configures using the `grid.username`, `grid.password`, `grid.webhookSignature` and `grid.baseUrl` system properties
    // Or configures using the `GRID_USERNAME`, `GRID_PASSWORD`, `GRID_WEBHOOK_SIGNATURE` and `GRID_BASE_URL` environment variables
    .fromEnv()
    .username("My Username")
    .build()
```

See this table for the available options:

| Setter             | System property         | Environment variable     | Required | Default value                                  |
| ------------------ | ----------------------- | ------------------------ | -------- | ---------------------------------------------- |
| `username`         | `grid.username`         | `GRID_USERNAME`          | true     | -                                              |
| `password`         | `grid.password`         | `GRID_PASSWORD`          | true     | -                                              |
| `webhookSignature` | `grid.webhookSignature` | `GRID_WEBHOOK_SIGNATURE` | false    | -                                              |
| `baseUrl`          | `grid.baseUrl`          | `GRID_BASE_URL`          | true     | `"https://api.lightspark.com/grid/2025-10-13"` |

System properties take precedence over environment variables.

> [!TIP]
> Don't create more than one client in the same application. Each client has a connection pool and
> thread pools, which are more efficient to share between requests.

### Modifying configuration

To temporarily use a modified client configuration, while reusing the same connection and thread pools, call `withOptions()` on any client or service:

```kotlin
import com.grid.api.client.GridClient

val clientWithOptions: GridClient = client.withOptions {
    it.baseUrl("https://example.com")
    it.maxRetries(42)
}
```

The `withOptions()` method does not affect the original client or service.

## Requests and responses

To send a request to the Grid API, build an instance of some `Params` class and pass it to the corresponding client method. When the response is received, it will be deserialized into an instance of a Kotlin class.

For example, `client.quotes().create(...)` should be called with an instance of `QuoteCreateParams`, and it will return an instance of `Quote`.

## Immutability

Each class in the SDK has an associated [builder](https://blogs.oracle.com/javamagazine/post/exploring-joshua-blochs-builder-design-pattern-in-java) or factory method for constructing it.

Each class is [immutable](https://docs.oracle.com/javase/tutorial/essential/concurrency/immutable.html) once constructed. If the class has an associated builder, then it has a `toBuilder()` method, which can be used to convert it back to a builder for making a modified copy.

Because each class is immutable, builder modification will _never_ affect already built class instances.

## Asynchronous execution

The default client is synchronous. To switch to asynchronous execution, call the `async()` method:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.quotes.Quote
import com.grid.api.models.quotes.QuoteCreateParams

// Configures using the `grid.username`, `grid.password`, `grid.webhookSignature` and `grid.baseUrl` system properties
// Or configures using the `GRID_USERNAME`, `GRID_PASSWORD`, `GRID_WEBHOOK_SIGNATURE` and `GRID_BASE_URL` environment variables
val client: GridClient = GridOkHttpClient.fromEnv()

val params: QuoteCreateParams = QuoteCreateParams.builder()
    .accountDestination("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
    .lockedCurrencyAmount(10000L)
    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
    .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
    .build()
val quote: Quote = client.async().quotes().create(params)
```

Or create an asynchronous client from the beginning:

```kotlin
import com.grid.api.client.GridClientAsync
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.quotes.Quote
import com.grid.api.models.quotes.QuoteCreateParams

// Configures using the `grid.username`, `grid.password`, `grid.webhookSignature` and `grid.baseUrl` system properties
// Or configures using the `GRID_USERNAME`, `GRID_PASSWORD`, `GRID_WEBHOOK_SIGNATURE` and `GRID_BASE_URL` environment variables
val client: GridClientAsync = GridOkHttpClientAsync.fromEnv()

val params: QuoteCreateParams = QuoteCreateParams.builder()
    .accountDestination("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
    .lockedCurrencyAmount(10000L)
    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
    .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
    .build()
val quote: Quote = client.quotes().create(params)
```

The asynchronous client supports the same options as the synchronous one, except most methods are [suspending](https://kotlinlang.org/docs/coroutines-guide.html).

## File uploads

The SDK defines methods that accept files.

To upload a file, pass a [`Path`](https://docs.oracle.com/javase/8/docs/api/java/nio/file/Path.html):

```kotlin
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import com.grid.api.models.customers.bulk.BulkUploadCsvResponse
import java.nio.file.Paths

val params: BulkUploadCsvParams = BulkUploadCsvParams.builder()
    .file(Paths.get("/path/to/file"))
    .build()
val response: BulkUploadCsvResponse = client.customers().bulk().uploadCsv(params)
```

Or an arbitrary [`InputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html):

```kotlin
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import com.grid.api.models.customers.bulk.BulkUploadCsvResponse
import java.net.URL

val params: BulkUploadCsvParams = BulkUploadCsvParams.builder()
    .file(URL("https://example.com//path/to/file").openStream())
    .build()
val response: BulkUploadCsvResponse = client.customers().bulk().uploadCsv(params)
```

Or a `ByteArray`:

```kotlin
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import com.grid.api.models.customers.bulk.BulkUploadCsvResponse

val params: BulkUploadCsvParams = BulkUploadCsvParams.builder()
    .file("content".toByteArray())
    .build()
val response: BulkUploadCsvResponse = client.customers().bulk().uploadCsv(params)
```

Note that when passing a non-`Path` its filename is unknown so it will not be included in the request. To manually set a filename, pass a [`MultipartField`](grid-kotlin-core/src/main/kotlin/com/grid/api/core/Values.kt):

```kotlin
import com.grid.api.core.MultipartField
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import com.grid.api.models.customers.bulk.BulkUploadCsvResponse
import java.io.InputStream
import java.net.URL

val params: BulkUploadCsvParams = BulkUploadCsvParams.builder()
    .file(MultipartField.builder<InputStream>()
        .value(URL("https://example.com//path/to/file").openStream())
        .filename("/path/to/file")
        .build())
    .build()
val response: BulkUploadCsvResponse = client.customers().bulk().uploadCsv(params)
```

## Raw responses

The SDK defines methods that deserialize responses into instances of Kotlin classes. However, these methods don't provide access to the response headers, status code, or the raw response body.

To access this data, prefix any HTTP method call on a client or service with `withRawResponse()`:

```kotlin
import com.grid.api.core.http.Headers
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.quotes.Quote
import com.grid.api.models.quotes.QuoteCreateParams

val params: QuoteCreateParams = QuoteCreateParams.builder()
    .accountDestination("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
    .lockedCurrencyAmount(10000L)
    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
    .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
    .build()
val quote: HttpResponseFor<Quote> = client.quotes().withRawResponse().create(params)

val statusCode: Int = quote.statusCode()
val headers: Headers = quote.headers()
```

You can still deserialize the response into an instance of a Kotlin class if needed:

```kotlin
import com.grid.api.models.quotes.Quote

val parsedQuote: Quote = quote.parse()
```

## Error handling

The SDK throws custom unchecked exception types:

- [`GridServiceException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/GridServiceException.kt): Base class for HTTP errors. See this table for which exception subclass is thrown for each HTTP status code:

  | Status | Exception                                                                                                                |
  | ------ | ------------------------------------------------------------------------------------------------------------------------ |
  | 400    | [`BadRequestException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/BadRequestException.kt)                     |
  | 401    | [`UnauthorizedException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/UnauthorizedException.kt)                 |
  | 403    | [`PermissionDeniedException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/PermissionDeniedException.kt)         |
  | 404    | [`NotFoundException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/NotFoundException.kt)                         |
  | 422    | [`UnprocessableEntityException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/UnprocessableEntityException.kt)   |
  | 429    | [`RateLimitException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/RateLimitException.kt)                       |
  | 5xx    | [`InternalServerException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/InternalServerException.kt)             |
  | others | [`UnexpectedStatusCodeException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/UnexpectedStatusCodeException.kt) |

- [`GridIoException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/GridIoException.kt): I/O networking errors.

- [`GridRetryableException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/GridRetryableException.kt): Generic error indicating a failure that could be retried by the client.

- [`GridInvalidDataException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/GridInvalidDataException.kt): Failure to interpret successfully parsed data. For example, when accessing a property that's supposed to be required, but the API unexpectedly omitted it from the response.

- [`GridException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/GridException.kt): Base class for all exceptions. Most errors will result in one of the previously mentioned ones, but completely generic errors may be thrown using the base class.

## Pagination

The SDK defines methods that return a paginated lists of results. It provides convenient ways to access the results either one page at a time or item-by-item across all pages.

### Auto-pagination

To iterate through all results across all pages, use the `autoPager()` method, which automatically fetches more pages as needed.

When using the synchronous client, the method returns a [`Sequence`](https://kotlinlang.org/docs/sequences.html)

```kotlin
import com.grid.api.models.customers.CustomerListPage

val page: CustomerListPage = client.customers().list()
page.autoPager()
    .take(50)
    .forEach { customer -> println(customer) }
```

When using the asynchronous client, the method returns a [`Flow`](https://kotlinlang.org/docs/flow.html):

```kotlin
import com.grid.api.models.customers.CustomerListPageAsync

val page: CustomerListPageAsync = client.async().customers().list()
page.autoPager()
    .take(50)
    .forEach { customer -> println(customer) }
```

### Manual pagination

To access individual page items and manually request the next page, use the `items()`,
`hasNextPage()`, and `nextPage()` methods:

```kotlin
import com.grid.api.models.customers.CustomerListPage
import com.grid.api.models.customers.CustomerOneOf

val page: CustomerListPage = client.customers().list()
while (true) {
    for (customer in page.items()) {
        println(customer)
    }

    if (!page.hasNextPage()) {
        break
    }

    page = page.nextPage()
}
```

## Logging

The SDK uses the standard [OkHttp logging interceptor](https://github.com/square/okhttp/tree/master/okhttp-logging-interceptor).

Enable logging by setting the `GRID_LOG` environment variable to `info`:

```sh
export GRID_LOG=info
```

Or to `debug` for more verbose logging:

```sh
export GRID_LOG=debug
```

## ProGuard and R8

Although the SDK uses reflection, it is still usable with [ProGuard](https://github.com/Guardsquare/proguard) and [R8](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization) because `grid-kotlin-core` is published with a [configuration file](grid-kotlin-core/src/main/resources/META-INF/proguard/grid-kotlin-core.pro) containing [keep rules](https://www.guardsquare.com/manual/configuration/usage).

ProGuard and R8 should automatically detect and use the published rules, but you can also manually copy the keep rules if necessary.

## Jackson

The SDK depends on [Jackson](https://github.com/FasterXML/jackson) for JSON serialization/deserialization. It is compatible with version 2.13.4 or higher, but depends on version 2.18.2 by default.

The SDK throws an exception if it detects an incompatible Jackson version at runtime (e.g. if the default version was overridden in your Maven or Gradle config).

If the SDK threw an exception, but you're _certain_ the version is compatible, then disable the version check using the `checkJacksonVersionCompatibility` on [`GridOkHttpClient`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClient.kt) or [`GridOkHttpClientAsync`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClientAsync.kt).

> [!CAUTION]
> We make no guarantee that the SDK works correctly when the Jackson version check is disabled.

Also note that there are bugs in older Jackson versions that can affect the SDK. We don't work around all Jackson bugs ([example](https://github.com/FasterXML/jackson-databind/issues/3240)) and expect users to upgrade Jackson for those instead.

## Network options

### Retries

The SDK automatically retries 2 times by default, with a short exponential backoff between requests.

Only the following error types are retried:

- Connection errors (for example, due to a network connectivity problem)
- 408 Request Timeout
- 409 Conflict
- 429 Rate Limit
- 5xx Internal

The API may also explicitly instruct the SDK to retry or not retry a request.

To set a custom number of retries, configure the client using the `maxRetries` method:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

val client: GridClient = GridOkHttpClient.builder()
    .fromEnv()
    .maxRetries(4)
    .build()
```

### Timeouts

Requests time out after 1 minute by default.

To set a custom timeout, configure the method call using the `timeout` method:

```kotlin
import com.grid.api.models.quotes.Quote

val quote: Quote = client.quotes().create(
  params, RequestOptions.builder().timeout(Duration.ofSeconds(30)).build()
)
```

Or configure the default for all method calls at the client level:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient
import java.time.Duration

val client: GridClient = GridOkHttpClient.builder()
    .fromEnv()
    .timeout(Duration.ofSeconds(30))
    .build()
```

### Proxies

To route requests through a proxy, configure the client using the `proxy` method:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient
import java.net.InetSocketAddress
import java.net.Proxy

val client: GridClient = GridOkHttpClient.builder()
    .fromEnv()
    .proxy(Proxy(
      Proxy.Type.HTTP, InetSocketAddress(
        "https://example.com", 8080
      )
    ))
    .build()
```

### HTTPS

> [!NOTE]
> Most applications should not call these methods, and instead use the system defaults. The defaults include
> special optimizations that can be lost if the implementations are modified.

To configure how HTTPS connections are secured, configure the client using the `sslSocketFactory`, `trustManager`, and `hostnameVerifier` methods:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

val client: GridClient = GridOkHttpClient.builder()
    .fromEnv()
    // If `sslSocketFactory` is set, then `trustManager` must be set, and vice versa.
    .sslSocketFactory(yourSSLSocketFactory)
    .trustManager(yourTrustManager)
    .hostnameVerifier(yourHostnameVerifier)
    .build()
```

### Custom HTTP client

The SDK consists of three artifacts:

- `grid-kotlin-core`
  - Contains core SDK logic
  - Does not depend on [OkHttp](https://square.github.io/okhttp)
  - Exposes [`GridClient`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClient.kt), [`GridClientAsync`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientAsync.kt), [`GridClientImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientImpl.kt), and [`GridClientAsyncImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientAsyncImpl.kt), all of which can work with any HTTP client
- `grid-kotlin-client-okhttp`
  - Depends on [OkHttp](https://square.github.io/okhttp)
  - Exposes [`GridOkHttpClient`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClient.kt) and [`GridOkHttpClientAsync`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClientAsync.kt), which provide a way to construct [`GridClientImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientImpl.kt) and [`GridClientAsyncImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientAsyncImpl.kt), respectively, using OkHttp
- `grid-kotlin`
  - Depends on and exposes the APIs of both `grid-kotlin-core` and `grid-kotlin-client-okhttp`
  - Does not have its own logic

This structure allows replacing the SDK's default HTTP client without pulling in unnecessary dependencies.

#### Customized [`OkHttpClient`](https://square.github.io/okhttp/3.x/okhttp/okhttp3/OkHttpClient.html)

> [!TIP]
> Try the available [network options](#network-options) before replacing the default client.

To use a customized `OkHttpClient`:

1. Replace your [`grid-kotlin` dependency](#installation) with `grid-kotlin-core`
2. Copy `grid-kotlin-client-okhttp`'s [`OkHttpClient`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/OkHttpClient.kt) class into your code and customize it
3. Construct [`GridClientImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientImpl.kt) or [`GridClientAsyncImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientAsyncImpl.kt), similarly to [`GridOkHttpClient`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClient.kt) or [`GridOkHttpClientAsync`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClientAsync.kt), using your customized client

### Completely custom HTTP client

To use a completely custom HTTP client:

1. Replace your [`grid-kotlin` dependency](#installation) with `grid-kotlin-core`
2. Write a class that implements the [`HttpClient`](grid-kotlin-core/src/main/kotlin/com/grid/api/core/http/HttpClient.kt) interface
3. Construct [`GridClientImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientImpl.kt) or [`GridClientAsyncImpl`](grid-kotlin-core/src/main/kotlin/com/grid/api/client/GridClientAsyncImpl.kt), similarly to [`GridOkHttpClient`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClient.kt) or [`GridOkHttpClientAsync`](grid-kotlin-client-okhttp/src/main/kotlin/com/grid/api/client/okhttp/GridOkHttpClientAsync.kt), using your new client class

## Undocumented API functionality

The SDK is typed for convenient usage of the documented API. However, it also supports working with undocumented or not yet supported parts of the API.

### Parameters

To set undocumented parameters, call the `putAdditionalHeader`, `putAdditionalQueryParam`, or `putAdditionalBodyProperty` methods on any `Params` class:

```kotlin
import com.grid.api.core.JsonValue
import com.grid.api.models.quotes.QuoteCreateParams

val params: QuoteCreateParams = QuoteCreateParams.builder()
    .putAdditionalHeader("Secret-Header", "42")
    .putAdditionalQueryParam("secret_query_param", "42")
    .putAdditionalBodyProperty("secretProperty", JsonValue.from("42"))
    .build()
```

These can be accessed on the built object later using the `_additionalHeaders()`, `_additionalQueryParams()`, and `_additionalBodyProperties()` methods.

To set undocumented parameters on _nested_ headers, query params, or body classes, call the `putAdditionalProperty` method on the nested class:

```kotlin
import com.grid.api.core.JsonValue
import com.grid.api.models.transferin.TransferInCreateParams

val params: TransferInCreateParams = TransferInCreateParams.builder()
    .destination(TransferInCreateParams.Destination.builder()
        .putAdditionalProperty("secretProperty", JsonValue.from("42"))
        .build())
    .build()
```

These properties can be accessed on the nested built object later using the `_additionalProperties()` method.

To set a documented parameter or property to an undocumented or not yet supported _value_, pass a [`JsonValue`](grid-kotlin-core/src/main/kotlin/com/grid/api/core/Values.kt) object to its setter:

```kotlin
import com.grid.api.core.JsonValue
import com.grid.api.models.quotes.QuoteCreateParams

val params: QuoteCreateParams = QuoteCreateParams.builder()
    .destination(JsonValue.from(42))
    .lockedCurrencyAmount(10000L)
    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
    .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
    .build()
```

The most straightforward way to create a [`JsonValue`](grid-kotlin-core/src/main/kotlin/com/grid/api/core/Values.kt) is using its `from(...)` method:

```kotlin
import com.grid.api.core.JsonValue

// Create primitive JSON values
val nullValue: JsonValue = JsonValue.from(null)
val booleanValue: JsonValue = JsonValue.from(true)
val numberValue: JsonValue = JsonValue.from(42)
val stringValue: JsonValue = JsonValue.from("Hello World!")

// Create a JSON array value equivalent to `["Hello", "World"]`
val arrayValue: JsonValue = JsonValue.from(listOf(
  "Hello", "World"
))

// Create a JSON object value equivalent to `{ "a": 1, "b": 2 }`
val objectValue: JsonValue = JsonValue.from(mapOf(
  "a" to 1, "b" to 2
))

// Create an arbitrarily nested JSON equivalent to:
// {
//   "a": [1, 2],
//   "b": [3, 4]
// }
val complexValue: JsonValue = JsonValue.from(mapOf(
  "a" to listOf(
    1, 2
  ), "b" to listOf(
    3, 4
  )
))
```

Normally a `Builder` class's `build` method will throw [`IllegalStateException`](https://docs.oracle.com/javase/8/docs/api/java/lang/IllegalStateException.html) if any required parameter or property is unset.

To forcibly omit a required parameter or property, pass [`JsonMissing`](grid-kotlin-core/src/main/kotlin/com/grid/api/core/Values.kt):

```kotlin
import com.grid.api.core.JsonMissing
import com.grid.api.models.quotes.QuoteCreateParams

val params: QuoteCreateParams = QuoteCreateParams.builder()
    .lockedCurrencyAmount(10000L)
    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
    .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
    .destination(JsonMissing.of())
    .build()
```

### Response properties

To access undocumented response properties, call the `_additionalProperties()` method:

```kotlin
import com.grid.api.core.JsonBoolean
import com.grid.api.core.JsonNull
import com.grid.api.core.JsonNumber
import com.grid.api.core.JsonValue

val additionalProperties: Map<String, JsonValue> = client.quotes().create(params)._additionalProperties()
val secretPropertyValue: JsonValue = additionalProperties.get("secretProperty")

val result = when (secretPropertyValue) {
    is JsonNull -> "It's null!"
    is JsonBoolean -> "It's a boolean!"
    is JsonNumber -> "It's a number!"
    // Other types include `JsonMissing`, `JsonString`, `JsonArray`, and `JsonObject`
    else -> "It's something else!"
}
```

To access a property's raw JSON value, which may be undocumented, call its `_` prefixed method:

```kotlin
import com.grid.api.core.JsonField
import com.grid.api.models.quotes.QuoteDestinationOneOf

val destination: JsonField<QuoteDestinationOneOf> = client.quotes().create(params)._destination()

if (destination.isMissing()) {
  // The property is absent from the JSON response
} else if (destination.isNull()) {
  // The property was set to literal null
} else {
  // Check if value was provided as a string
  // Other methods include `asNumber()`, `asBoolean()`, etc.
  val jsonString: String? = destination.asString();

  // Try to deserialize into a custom type
  val myObject: MyClass = destination.asUnknown()!!.convert(MyClass::class.java)
}
```

### Response validation

In rare cases, the API may return a response that doesn't match the expected type. For example, the SDK may expect a property to contain a `String`, but the API could return something else.

By default, the SDK will not throw an exception in this case. It will throw [`GridInvalidDataException`](grid-kotlin-core/src/main/kotlin/com/grid/api/errors/GridInvalidDataException.kt) only if you directly access the property.

If you would prefer to check that the response is completely well-typed upfront, then either call `validate()`:

```kotlin
import com.grid.api.models.quotes.Quote

val quote: Quote = client.quotes().create(params).validate()
```

Or configure the method call to validate the response using the `responseValidation` method:

```kotlin
import com.grid.api.models.quotes.Quote

val quote: Quote = client.quotes().create(
  params, RequestOptions.builder().responseValidation(true).build()
)
```

Or configure the default for all method calls at the client level:

```kotlin
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient

val client: GridClient = GridOkHttpClient.builder()
    .fromEnv()
    .responseValidation(true)
    .build()
```

## FAQ

### Why don't you use plain `enum` classes?

Kotlin `enum` classes are not trivially [forwards compatible](https://www.stainless.com/blog/making-java-enums-forwards-compatible). Using them in the SDK could cause runtime exceptions if the API is updated to respond with a new enum value.

### Why do you represent fields using `JsonField<T>` instead of just plain `T`?

Using `JsonField<T>` enables a few features:

- Allowing usage of [undocumented API functionality](#undocumented-api-functionality)
- Lazily [validating the API response against the expected shape](#response-validation)
- Representing absent vs explicitly null values

### Why don't you use [`data` classes](https://kotlinlang.org/docs/data-classes.html)?

It is not [backwards compatible to add new fields to a data class](https://kotlinlang.org/docs/api-guidelines-backward-compatibility.html#avoid-using-data-classes-in-your-api) and we don't want to introduce a breaking change every time we add a field to a class.

### Why don't you use checked exceptions?

Checked exceptions are widely considered a mistake in the Java programming language. In fact, they were omitted from Kotlin for this reason.

Checked exceptions:

- Are verbose to handle
- Encourage error handling at the wrong level of abstraction, where nothing can be done about the error
- Are tedious to propagate due to the [function coloring problem](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function)
- Don't play well with lambdas (also due to the function coloring problem)

## Semantic versioning

This package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:

1. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_
2. Changes that we do not expect to impact the vast majority of users in practice.

We take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.

We are keen for your feedback; please open an [issue](https://www.github.com/stainless-sdks/grid-kotlin/issues) with questions, bugs, or suggestions.
