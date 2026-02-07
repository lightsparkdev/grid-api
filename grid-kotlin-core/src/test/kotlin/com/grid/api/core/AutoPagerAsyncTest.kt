// File generated from our OpenAPI spec by Stainless.

package com.grid.api.core

import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class AutoPagerAsyncTest {

    private class PageAsyncImpl(
        private val items: List<String>,
        private val nextPage: PageAsync<String>? = null,
    ) : PageAsync<String> {

        override fun hasNextPage(): Boolean = nextPage != null

        override suspend fun nextPage(): PageAsync<String> = nextPage!!

        override fun items(): List<String> = items
    }

    @Test
    fun collect() {
        val firstPage =
            PageAsyncImpl(
                listOf("chunk1", "chunk2"),
                nextPage = PageAsyncImpl(listOf("chunk3", "chunk4")),
            )

        val autoPager = AutoPagerAsync.from(firstPage)

        assertThat(runBlocking { autoPager.toList() })
            .containsExactly("chunk1", "chunk2", "chunk3", "chunk4")
    }
}
