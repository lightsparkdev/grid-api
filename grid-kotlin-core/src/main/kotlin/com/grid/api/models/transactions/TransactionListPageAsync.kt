// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.grid.api.core.AutoPagerAsync
import com.grid.api.core.PageAsync
import com.grid.api.core.checkRequired
import com.grid.api.models.transferin.Transaction
import com.grid.api.services.async.TransactionServiceAsync
import java.util.Objects

/** @see TransactionServiceAsync.list */
class TransactionListPageAsync
private constructor(
    private val service: TransactionServiceAsync,
    private val params: TransactionListParams,
    private val response: TransactionListPageResponse,
) : PageAsync<Transaction> {

    /**
     * Delegates to [TransactionListPageResponse], but gracefully handles missing data.
     *
     * @see TransactionListPageResponse.data
     */
    fun data(): List<Transaction> = response._data().getNullable("data") ?: emptyList()

    /**
     * Delegates to [TransactionListPageResponse], but gracefully handles missing data.
     *
     * @see TransactionListPageResponse.nextCursor
     */
    fun nextCursor(): String? = response._nextCursor().getNullable("nextCursor")

    /**
     * Delegates to [TransactionListPageResponse], but gracefully handles missing data.
     *
     * @see TransactionListPageResponse.hasMore
     */
    fun hasMore(): Boolean? = response._hasMore().getNullable("hasMore")

    /**
     * Delegates to [TransactionListPageResponse], but gracefully handles missing data.
     *
     * @see TransactionListPageResponse.totalCount
     */
    fun totalCount(): Long? = response._totalCount().getNullable("totalCount")

    override fun items(): List<Transaction> = data()

    override fun hasNextPage(): Boolean = items().isNotEmpty() && nextCursor() != null

    fun nextPageParams(): TransactionListParams {
        val nextCursor =
            nextCursor() ?: throw IllegalStateException("Cannot construct next page params")
        return params.toBuilder().cursor(nextCursor).build()
    }

    override suspend fun nextPage(): TransactionListPageAsync = service.list(nextPageParams())

    fun autoPager(): AutoPagerAsync<Transaction> = AutoPagerAsync.from(this)

    /** The parameters that were used to request this page. */
    fun params(): TransactionListParams = params

    /** The response that this page was parsed from. */
    fun response(): TransactionListPageResponse = response

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [TransactionListPageAsync].
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

    /** A builder for [TransactionListPageAsync]. */
    class Builder internal constructor() {

        private var service: TransactionServiceAsync? = null
        private var params: TransactionListParams? = null
        private var response: TransactionListPageResponse? = null

        internal fun from(transactionListPageAsync: TransactionListPageAsync) = apply {
            service = transactionListPageAsync.service
            params = transactionListPageAsync.params
            response = transactionListPageAsync.response
        }

        fun service(service: TransactionServiceAsync) = apply { this.service = service }

        /** The parameters that were used to request this page. */
        fun params(params: TransactionListParams) = apply { this.params = params }

        /** The response that this page was parsed from. */
        fun response(response: TransactionListPageResponse) = apply { this.response = response }

        /**
         * Returns an immutable instance of [TransactionListPageAsync].
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
        fun build(): TransactionListPageAsync =
            TransactionListPageAsync(
                checkRequired("service", service),
                checkRequired("params", params),
                checkRequired("response", response),
            )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is TransactionListPageAsync &&
            service == other.service &&
            params == other.params &&
            response == other.response
    }

    override fun hashCode(): Int = Objects.hash(service, params, response)

    override fun toString() =
        "TransactionListPageAsync{service=$service, params=$params, response=$response}"
}
