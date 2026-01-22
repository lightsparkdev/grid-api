// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.grid.api.core.AutoPagerAsync
import com.grid.api.core.PageAsync
import com.grid.api.core.checkRequired
import com.grid.api.services.async.QuoteServiceAsync
import java.util.Objects

/** @see QuoteServiceAsync.list */
class QuoteListPageAsync
private constructor(
    private val service: QuoteServiceAsync,
    private val params: QuoteListParams,
    private val response: QuoteListPageResponse,
) : PageAsync<Quote> {

    /**
     * Delegates to [QuoteListPageResponse], but gracefully handles missing data.
     *
     * @see QuoteListPageResponse.data
     */
    fun data(): List<Quote> = response._data().getNullable("data") ?: emptyList()

    /**
     * Delegates to [QuoteListPageResponse], but gracefully handles missing data.
     *
     * @see QuoteListPageResponse.nextCursor
     */
    fun nextCursor(): String? = response._nextCursor().getNullable("nextCursor")

    /**
     * Delegates to [QuoteListPageResponse], but gracefully handles missing data.
     *
     * @see QuoteListPageResponse.hasMore
     */
    fun hasMore(): Boolean? = response._hasMore().getNullable("hasMore")

    /**
     * Delegates to [QuoteListPageResponse], but gracefully handles missing data.
     *
     * @see QuoteListPageResponse.totalCount
     */
    fun totalCount(): Long? = response._totalCount().getNullable("totalCount")

    override fun items(): List<Quote> = data()

    override fun hasNextPage(): Boolean = items().isNotEmpty() && nextCursor() != null

    fun nextPageParams(): QuoteListParams {
        val nextCursor =
            nextCursor() ?: throw IllegalStateException("Cannot construct next page params")
        return params.toBuilder().cursor(nextCursor).build()
    }

    override suspend fun nextPage(): QuoteListPageAsync = service.list(nextPageParams())

    fun autoPager(): AutoPagerAsync<Quote> = AutoPagerAsync.from(this)

    /** The parameters that were used to request this page. */
    fun params(): QuoteListParams = params

    /** The response that this page was parsed from. */
    fun response(): QuoteListPageResponse = response

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [QuoteListPageAsync].
         *
         * The following fields are required:
         * ```kotlin
         * .service()
         * .params()
         * .response()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [QuoteListPageAsync]. */
    class Builder internal constructor() {

        private var service: QuoteServiceAsync? = null
        private var params: QuoteListParams? = null
        private var response: QuoteListPageResponse? = null

        internal fun from(quoteListPageAsync: QuoteListPageAsync) = apply {
            service = quoteListPageAsync.service
            params = quoteListPageAsync.params
            response = quoteListPageAsync.response
        }

        fun service(service: QuoteServiceAsync) = apply { this.service = service }

        /** The parameters that were used to request this page. */
        fun params(params: QuoteListParams) = apply { this.params = params }

        /** The response that this page was parsed from. */
        fun response(response: QuoteListPageResponse) = apply { this.response = response }

        /**
         * Returns an immutable instance of [QuoteListPageAsync].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .service()
         * .params()
         * .response()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): QuoteListPageAsync =
            QuoteListPageAsync(
                checkRequired("service", service),
                checkRequired("params", params),
                checkRequired("response", response),
            )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is QuoteListPageAsync &&
            service == other.service &&
            params == other.params &&
            response == other.response
    }

    override fun hashCode(): Int = Objects.hash(service, params, response)

    override fun toString() =
        "QuoteListPageAsync{service=$service, params=$params, response=$response}"
}
