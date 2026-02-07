// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox.uma

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UmaReceivePaymentParamsTest {

    @Test
    fun create() {
        UmaReceivePaymentParams.builder()
            .receivingCurrencyAmount(1000L)
            .receivingCurrencyCode("USD")
            .senderUmaAddress("\$success.usd@sandbox.grid.uma.money")
            .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
            .receiverUmaAddress("\$receiver@uma.domain")
            .build()
    }

    @Test
    fun body() {
        val params =
            UmaReceivePaymentParams.builder()
                .receivingCurrencyAmount(1000L)
                .receivingCurrencyCode("USD")
                .senderUmaAddress("\$success.usd@sandbox.grid.uma.money")
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .receiverUmaAddress("\$receiver@uma.domain")
                .build()

        val body = params._body()

        assertThat(body.receivingCurrencyAmount()).isEqualTo(1000L)
        assertThat(body.receivingCurrencyCode()).isEqualTo("USD")
        assertThat(body.senderUmaAddress()).isEqualTo("\$success.usd@sandbox.grid.uma.money")
        assertThat(body.customerId()).isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(body.receiverUmaAddress()).isEqualTo("\$receiver@uma.domain")
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            UmaReceivePaymentParams.builder()
                .receivingCurrencyAmount(1000L)
                .receivingCurrencyCode("USD")
                .senderUmaAddress("\$success.usd@sandbox.grid.uma.money")
                .build()

        val body = params._body()

        assertThat(body.receivingCurrencyAmount()).isEqualTo(1000L)
        assertThat(body.receivingCurrencyCode()).isEqualTo("USD")
        assertThat(body.senderUmaAddress()).isEqualTo("\$success.usd@sandbox.grid.uma.money")
    }
}
