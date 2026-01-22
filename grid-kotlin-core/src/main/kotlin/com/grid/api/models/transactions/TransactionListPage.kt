// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.grid.api.core.AutoPager
import com.grid.api.core.Page
import com.grid.api.core.checkRequired
import com.grid.api.models.transferin.Transaction
import com.grid.api.services.blocking.TransactionService
import java.util.Objects

/** @see TransactionService.list */
class TransactionListPage
private constructor(
    private val service: TransactionService,
    private val params: TransactionListParams,
    private val response: TransactionListPageResponse,
) : Page<Transaction> {

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

    override fun nextPage(): TransactionListPage = service.list(nextPageParams())

    fun autoPager(): AutoPager<Transaction> = AutoPager.from(this)

    /** The parameters that were used to request this page. */
    fun params(): TransactionListParams = params

    /** The response that this page was parsed from. */
    fun response(): TransactionListPageResponse = response

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [TransactionListPage].
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

    /** A builder for [TransactionListPage]. */
    class Builder internal constructor() {

        private var service: TransactionService? = null
        private var params: TransactionListParams? = null
        private var response: TransactionListPageResponse? = null

        internal fun from(transactionListPage: TransactionListPage) = apply {
            service = transactionListPage.service
            params = transactionListPage.params
            response = transactionListPage.response
        }

        fun service(service: TransactionService) = apply { this.service = service }

        /** The parameters that were used to request this page. */
        fun params(params: TransactionListParams) = apply { this.params = params }

        /** The response that this page was parsed from. */
        fun response(response: TransactionListPageResponse) = apply { this.response = response }

        /**
         * Returns an immutable instance of [TransactionListPage].
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
        fun build(): TransactionListPage =
            TransactionListPage(
                checkRequired("service", service),
                checkRequired("params", params),
                checkRequired("response", response),
            )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is TransactionListPage &&
            service == other.service &&
            params == other.params &&
            response == other.response
    }

    override fun hashCode(): Int = Objects.hash(service, params, response)

    override fun toString() =
        "TransactionListPage{service=$service, params=$params, response=$response}"
}
