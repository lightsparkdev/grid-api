// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.webhooks

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class WebhookSendTestResponseTest {

    @Test
    fun create() {
        val webhookSendTestResponse =
            WebhookSendTestResponse.builder()
                .responseStatus(200L)
                .responseBody("response_body")
                .url("https://api.mycompany.com/webhooks/uma")
                .build()

        assertThat(webhookSendTestResponse.responseStatus()).isEqualTo(200L)
        assertThat(webhookSendTestResponse.responseBody()).isEqualTo("response_body")
        assertThat(webhookSendTestResponse.url())
            .isEqualTo("https://api.mycompany.com/webhooks/uma")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val webhookSendTestResponse =
            WebhookSendTestResponse.builder()
                .responseStatus(200L)
                .responseBody("response_body")
                .url("https://api.mycompany.com/webhooks/uma")
                .build()

        val roundtrippedWebhookSendTestResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(webhookSendTestResponse),
                jacksonTypeRef<WebhookSendTestResponse>(),
            )

        assertThat(roundtrippedWebhookSendTestResponse).isEqualTo(webhookSendTestResponse)
    }
}
