// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.plaid

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PlaidSubmitPublicTokenParamsTest {

    @Test
    fun create() {
        PlaidSubmitPublicTokenParams.builder()
            .plaidLinkToken("link-sandbox-abc123xyz-1234-5678")
            .publicToken("public-sandbox-12345678-1234-1234-1234-123456789012")
            .accountId("plaid_account_id_123")
            .build()
    }

    @Test
    fun pathParams() {
        val params =
            PlaidSubmitPublicTokenParams.builder()
                .plaidLinkToken("link-sandbox-abc123xyz-1234-5678")
                .publicToken("public-sandbox-12345678-1234-1234-1234-123456789012")
                .build()

        assertThat(params._pathParam(0)).isEqualTo("link-sandbox-abc123xyz-1234-5678")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun body() {
        val params =
            PlaidSubmitPublicTokenParams.builder()
                .plaidLinkToken("link-sandbox-abc123xyz-1234-5678")
                .publicToken("public-sandbox-12345678-1234-1234-1234-123456789012")
                .accountId("plaid_account_id_123")
                .build()

        val body = params._body()

        assertThat(body.publicToken())
            .isEqualTo("public-sandbox-12345678-1234-1234-1234-123456789012")
        assertThat(body.accountId()).isEqualTo("plaid_account_id_123")
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            PlaidSubmitPublicTokenParams.builder()
                .plaidLinkToken("link-sandbox-abc123xyz-1234-5678")
                .publicToken("public-sandbox-12345678-1234-1234-1234-123456789012")
                .build()

        val body = params._body()

        assertThat(body.publicToken())
            .isEqualTo("public-sandbox-12345678-1234-1234-1234-123456789012")
    }
}
