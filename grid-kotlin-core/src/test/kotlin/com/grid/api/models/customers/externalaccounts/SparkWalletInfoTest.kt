// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class SparkWalletInfoTest {

    @Test
    fun create() {
        val sparkWalletInfo =
            SparkWalletInfo.builder()
                .accountType(SparkWalletInfo.AccountType.SPARK_WALLET)
                .address("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
                .build()

        assertThat(sparkWalletInfo.accountType())
            .isEqualTo(SparkWalletInfo.AccountType.SPARK_WALLET)
        assertThat(sparkWalletInfo.address())
            .isEqualTo("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val sparkWalletInfo =
            SparkWalletInfo.builder()
                .accountType(SparkWalletInfo.AccountType.SPARK_WALLET)
                .address("spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy3duxlf7hjzkp0rqx6dj6mrhu")
                .build()

        val roundtrippedSparkWalletInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(sparkWalletInfo),
                jacksonTypeRef<SparkWalletInfo>(),
            )

        assertThat(roundtrippedSparkWalletInfo).isEqualTo(sparkWalletInfo)
    }
}
