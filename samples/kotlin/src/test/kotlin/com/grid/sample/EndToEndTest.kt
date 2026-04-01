package com.grid.sample

import com.fasterxml.jackson.databind.JsonNode
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

/**
 * End-to-end tests that exercise the full payout flow against the Grid sandbox API.
 * Requires GRID_CLIENT_ID, GRID_CLIENT_SECRET, and GRID_WEBHOOK_PUBKEY to be set.
 */
class EndToEndTest {

    private fun parseJson(text: String): JsonNode = JsonUtils.mapper.readTree(text)

    private fun ApplicationTestBuilder.configureApp() {
        application { module() }
    }

    @Test
    fun `create individual customer`() = testApplication {
        configureApp()
        val response = client.post("/api/customers") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "platformCustomerId": "test_${System.currentTimeMillis()}",
                    "customerType": "INDIVIDUAL",
                    "fullName": "Test User",
                    "nationality": "US",
                    "birthDate": "1990-01-01",
                    "address": {
                        "country": "US",
                        "line1": "123 Test St",
                        "postalCode": "10001",
                        "city": "New York",
                        "state": "NY"
                    }
                }
            """)
        }

        assertEquals(HttpStatusCode.Created, response.status)
        val json = parseJson(response.bodyAsText())
        assertNotNull(json.get("id")?.asText(), "Customer should have an id")
        assertEquals("INDIVIDUAL", json.get("customerType")?.asText())
    }

    @Test
    fun `create MXN external account`() = testApplication {
        configureApp()

        // Step 1: Create customer
        val customerResponse = client.post("/api/customers") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "platformCustomerId": "test_mxn_${System.currentTimeMillis()}",
                    "customerType": "INDIVIDUAL",
                    "fullName": "Carlos Test",
                    "nationality": "MX",
                    "birthDate": "1990-01-01"
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, customerResponse.status)
        val customerId = parseJson(customerResponse.bodyAsText()).get("id").asText()

        // Step 2: Create MXN external account
        val accountResponse = client.post("/api/customers/$customerId/external-accounts") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "customerId": "$customerId",
                    "currency": "MXN",
                    "platformAccountId": "acct_test_${System.currentTimeMillis()}",
                    "accountInfo": {
                        "accountType": "MXN_ACCOUNT",
                        "clabeNumber": "014027000005555601",
                        "paymentRails": ["SPEI"]
                    },
                    "beneficiary": {
                        "beneficiaryType": "INDIVIDUAL",
                        "fullName": "Carlos Test",
                        "countryOfResidence": "MX"
                    }
                }
            """)
        }

        assertEquals(HttpStatusCode.Created, accountResponse.status)
        val accountJson = parseJson(accountResponse.bodyAsText())
        assertNotNull(accountJson.get("id")?.asText(), "External account should have an id")
    }

    @Test
    fun `create INR external account with UPI`() = testApplication {
        configureApp()

        val customerResponse = client.post("/api/customers") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "platformCustomerId": "test_inr_${System.currentTimeMillis()}",
                    "customerType": "INDIVIDUAL",
                    "fullName": "Priya Test",
                    "nationality": "IN",
                    "birthDate": "1991-06-12"
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, customerResponse.status)
        val customerId = parseJson(customerResponse.bodyAsText()).get("id").asText()

        val accountResponse = client.post("/api/customers/$customerId/external-accounts") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "customerId": "$customerId",
                    "currency": "INR",
                    "platformAccountId": "acct_test_${System.currentTimeMillis()}",
                    "accountInfo": {
                        "accountType": "INR_ACCOUNT",
                        "vpa": "test@upi",
                        "paymentRails": ["UPI"]
                    },
                    "beneficiary": {
                        "beneficiaryType": "INDIVIDUAL",
                        "fullName": "Priya Test",
                        "countryOfResidence": "IN"
                    }
                }
            """)
        }

        assertEquals(HttpStatusCode.Created, accountResponse.status)
        val accountJson = parseJson(accountResponse.bodyAsText())
        assertNotNull(accountJson.get("id")?.asText(), "External account should have an id")
    }

    @Test
    fun `create external account rejects missing accountType`() = testApplication {
        configureApp()

        val response = client.post("/api/customers/fake-id/external-accounts") {
            contentType(ContentType.Application.Json)
            setBody("""{"accountInfo": {}}""")
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val json = parseJson(response.bodyAsText())
        assertTrue(json.get("error").asText().contains("accountType"))
    }

    @Test
    fun `create external account rejects missing accountInfo`() = testApplication {
        configureApp()

        val response = client.post("/api/customers/fake-id/external-accounts") {
            contentType(ContentType.Application.Json)
            setBody("""{}""")
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val json = parseJson(response.bodyAsText())
        assertTrue(json.get("error").asText().contains("accountInfo"))
    }

    @Test
    fun `create quote with USD source`() = testApplication {
        configureApp()

        // Step 1: Create customer
        val customerResponse = client.post("/api/customers") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "platformCustomerId": "test_quote_${System.currentTimeMillis()}",
                    "customerType": "INDIVIDUAL",
                    "fullName": "Quote Test",
                    "nationality": "MX",
                    "birthDate": "1990-01-01"
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, customerResponse.status)
        val customerId = parseJson(customerResponse.bodyAsText()).get("id").asText()

        // Step 2: Create external account
        val accountResponse = client.post("/api/customers/$customerId/external-accounts") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "customerId": "$customerId",
                    "currency": "MXN",
                    "platformAccountId": "acct_test_${System.currentTimeMillis()}",
                    "accountInfo": {
                        "accountType": "MXN_ACCOUNT",
                        "clabeNumber": "014027000005555601",
                        "paymentRails": ["SPEI"]
                    },
                    "beneficiary": {
                        "beneficiaryType": "INDIVIDUAL",
                        "fullName": "Quote Test",
                        "countryOfResidence": "MX"
                    }
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, accountResponse.status)
        val externalAccountId = parseJson(accountResponse.bodyAsText()).get("id").asText()

        // Step 3: Create quote
        val quoteResponse = client.post("/api/quotes") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "source": {
                        "sourceType": "REALTIME_FUNDING",
                        "currency": "USD",
                        "customerId": "$customerId"
                    },
                    "destination": {
                        "accountId": "$externalAccountId"
                    },
                    "lockedCurrencyAmount": 1000,
                    "lockedCurrencySide": "SENDING",
                    "purposeOfPayment": "GIFT"
                }
            """)
        }

        assertEquals(HttpStatusCode.Created, quoteResponse.status)
        val quoteJson = parseJson(quoteResponse.bodyAsText())
        assertNotNull(quoteJson.get("id")?.asText(), "Quote should have an id")
    }

    @Test
    fun `full payout flow - create customer, account, quote, and fund`() = testApplication {
        configureApp()

        // Step 1: Create customer
        val customerResponse = client.post("/api/customers") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "platformCustomerId": "test_e2e_${System.currentTimeMillis()}",
                    "customerType": "INDIVIDUAL",
                    "fullName": "E2E Test User",
                    "nationality": "MX",
                    "birthDate": "1988-07-15",
                    "address": {
                        "country": "MX",
                        "line1": "Av. Reforma 222",
                        "postalCode": "06600",
                        "city": "Mexico City",
                        "state": "CDMX"
                    }
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, customerResponse.status, "Customer creation failed: ${customerResponse.bodyAsText()}")
        val customerJson = parseJson(customerResponse.bodyAsText())
        val customerId = customerJson.get("id").asText()
        assertNotNull(customerId)

        // Step 2: Create MXN external account
        val accountResponse = client.post("/api/customers/$customerId/external-accounts") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "customerId": "$customerId",
                    "currency": "MXN",
                    "platformAccountId": "acct_e2e_${System.currentTimeMillis()}",
                    "accountInfo": {
                        "accountType": "MXN_ACCOUNT",
                        "clabeNumber": "014027000005555601",
                        "paymentRails": ["SPEI"]
                    },
                    "beneficiary": {
                        "beneficiaryType": "INDIVIDUAL",
                        "fullName": "E2E Test User",
                        "countryOfResidence": "MX"
                    }
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, accountResponse.status, "External account creation failed: ${accountResponse.bodyAsText()}")
        val accountJson = parseJson(accountResponse.bodyAsText())
        val externalAccountId = accountJson.get("id").asText()
        assertNotNull(externalAccountId)

        // Step 3: Create quote (USD -> MXN)
        val quoteResponse = client.post("/api/quotes") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "source": {
                        "sourceType": "REALTIME_FUNDING",
                        "currency": "USD",
                        "customerId": "$customerId"
                    },
                    "destination": {
                        "accountId": "$externalAccountId"
                    },
                    "lockedCurrencyAmount": 1000,
                    "lockedCurrencySide": "SENDING",
                    "purposeOfPayment": "GIFT"
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, quoteResponse.status, "Quote creation failed: ${quoteResponse.bodyAsText()}")
        val quoteJson = parseJson(quoteResponse.bodyAsText())
        val quoteId = quoteJson.get("id").asText()
        assertNotNull(quoteId)

        // Step 4: Sandbox fund (realtime-funded quotes skip the execute step)
        val fundResponse = client.post("/api/sandbox/send-funds") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "quoteId": "$quoteId",
                    "currencyCode": "USD",
                    "currencyAmount": 1000
                }
            """)
        }
        assertEquals(HttpStatusCode.OK, fundResponse.status, "Sandbox funding failed: ${fundResponse.bodyAsText()}")
    }
}
