// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class OutgoingRateDetailsTest {

    @Test
    fun create() {
        val outgoingRateDetails =
            OutgoingRateDetails.builder()
                .counterpartyFixedFee(10L)
                .counterpartyMultiplier(1.08)
                .gridApiFixedFee(10L)
                .gridApiMultiplier(0.925)
                .gridApiVariableFeeAmount(30.0)
                .gridApiVariableFeeRate(0.003)
                .build()

        assertThat(outgoingRateDetails.counterpartyFixedFee()).isEqualTo(10L)
        assertThat(outgoingRateDetails.counterpartyMultiplier()).isEqualTo(1.08)
        assertThat(outgoingRateDetails.gridApiFixedFee()).isEqualTo(10L)
        assertThat(outgoingRateDetails.gridApiMultiplier()).isEqualTo(0.925)
        assertThat(outgoingRateDetails.gridApiVariableFeeAmount()).isEqualTo(30.0)
        assertThat(outgoingRateDetails.gridApiVariableFeeRate()).isEqualTo(0.003)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val outgoingRateDetails =
            OutgoingRateDetails.builder()
                .counterpartyFixedFee(10L)
                .counterpartyMultiplier(1.08)
                .gridApiFixedFee(10L)
                .gridApiMultiplier(0.925)
                .gridApiVariableFeeAmount(30.0)
                .gridApiVariableFeeRate(0.003)
                .build()

        val roundtrippedOutgoingRateDetails =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(outgoingRateDetails),
                jacksonTypeRef<OutgoingRateDetails>(),
            )

        assertThat(roundtrippedOutgoingRateDetails).isEqualTo(outgoingRateDetails)
    }
}
