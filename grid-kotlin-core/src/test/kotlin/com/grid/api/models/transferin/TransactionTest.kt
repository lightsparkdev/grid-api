// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transferin

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.models.transactions.TransactionStatus
import com.grid.api.models.transactions.TransactionType
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TransactionTest {

    @Test
    fun create() {
        val transaction =
            Transaction.builder()
                .id("Transaction:019542f5-b3e7-1d02-0000-000000000004")
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .destination(
                    Transaction.Destination.AccountDestination.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .platformCustomerId("18d3e5f7b4a9c2")
                .status(TransactionStatus.CREATED)
                .type(TransactionType.INCOMING)
                .counterpartyInformation(
                    Transaction.CounterpartyInformation.builder()
                        .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                        .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                        .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                        .build()
                )
                .createdAt(OffsetDateTime.parse("2025-08-15T14:25:18Z"))
                .description("Payment for invoice #1234")
                .settledAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .updatedAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .build()

        assertThat(transaction.id()).isEqualTo("Transaction:019542f5-b3e7-1d02-0000-000000000004")
        assertThat(transaction.customerId())
            .isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(transaction.destination())
            .isEqualTo(
                Transaction.Destination.ofAccount(
                    Transaction.Destination.AccountDestination.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
            )
        assertThat(transaction.platformCustomerId()).isEqualTo("18d3e5f7b4a9c2")
        assertThat(transaction.status()).isEqualTo(TransactionStatus.CREATED)
        assertThat(transaction.type()).isEqualTo(TransactionType.INCOMING)
        assertThat(transaction.counterpartyInformation())
            .isEqualTo(
                Transaction.CounterpartyInformation.builder()
                    .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                    .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                    .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                    .build()
            )
        assertThat(transaction.createdAt()).isEqualTo(OffsetDateTime.parse("2025-08-15T14:25:18Z"))
        assertThat(transaction.description()).isEqualTo("Payment for invoice #1234")
        assertThat(transaction.settledAt()).isEqualTo(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
        assertThat(transaction.updatedAt()).isEqualTo(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val transaction =
            Transaction.builder()
                .id("Transaction:019542f5-b3e7-1d02-0000-000000000004")
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .destination(
                    Transaction.Destination.AccountDestination.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .platformCustomerId("18d3e5f7b4a9c2")
                .status(TransactionStatus.CREATED)
                .type(TransactionType.INCOMING)
                .counterpartyInformation(
                    Transaction.CounterpartyInformation.builder()
                        .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                        .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                        .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                        .build()
                )
                .createdAt(OffsetDateTime.parse("2025-08-15T14:25:18Z"))
                .description("Payment for invoice #1234")
                .settledAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .updatedAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .build()

        val roundtrippedTransaction =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(transaction),
                jacksonTypeRef<Transaction>(),
            )

        assertThat(roundtrippedTransaction).isEqualTo(transaction)
    }
}
