// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.plaid.PlaidCreateLinkTokenParams
import com.grid.api.models.plaid.PlaidSubmitPublicTokenParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class PlaidServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun createLinkToken() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val plaidServiceAsync = client.plaid()

        val response =
            plaidServiceAsync.createLinkToken(
                PlaidCreateLinkTokenParams.builder()
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .build()
            )

        response.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun submitPublicToken() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val plaidServiceAsync = client.plaid()

        val externalAccount =
            plaidServiceAsync.submitPublicToken(
                PlaidSubmitPublicTokenParams.builder()
                    .plaidLinkToken("link-sandbox-abc123xyz-1234-5678")
                    .publicToken("public-sandbox-12345678-1234-1234-1234-123456789012")
                    .accountId("plaid_account_id_123")
                    .build()
            )

        externalAccount.validate()
    }
}
