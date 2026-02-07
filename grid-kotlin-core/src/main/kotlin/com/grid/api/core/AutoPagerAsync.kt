// File generated from our OpenAPI spec by Stainless.

package com.grid.api.core

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.FlowCollector
import kotlinx.coroutines.flow.asFlow
import kotlinx.coroutines.flow.emitAll

class AutoPagerAsync<T> private constructor(private val firstPage: PageAsync<T>) : Flow<T> {

    companion object {

        fun <T> from(firstPage: PageAsync<T>): AutoPagerAsync<T> = AutoPagerAsync(firstPage)
    }

    override suspend fun collect(collector: FlowCollector<T>) {
        var page: PageAsync<T> = firstPage
        while (true) {
            collector.emitAll(page.items().asFlow())
            if (!page.hasNextPage()) {
                break
            }
            page = page.nextPage()
        }
    }
}
