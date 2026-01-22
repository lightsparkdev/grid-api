// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.grid.api.core.AutoPagerAsync
import com.grid.api.core.PageAsync
import com.grid.api.core.checkRequired
import com.grid.api.services.async.customers.ExternalAccountServiceAsync
import java.util.Objects

/** @see ExternalAccountServiceAsync.list */
class ExternalAccountListPageAsync
private constructor(
    private val service: ExternalAccountServiceAsync,
    private val params: ExternalAccountListParams,
    private val response: ExternalAccountListPageResponse,
) : PageAsync<ExternalAccount> {

    /**
     * Delegates to [ExternalAccountListPageResponse], but gracefully handles missing data.
     *
     * @see ExternalAccountListPageResponse.data
     */
    fun data(): List<ExternalAccount> = response._data().getNullable("data") ?: emptyList()

    /**
     * Delegates to [ExternalAccountListPageResponse], but gracefully handles missing data.
     *
     * @see ExternalAccountListPageResponse.nextCursor
     */
    fun nextCursor(): String? = response._nextCursor().getNullable("nextCursor")

    /**
     * Delegates to [ExternalAccountListPageResponse], but gracefully handles missing data.
     *
     * @see ExternalAccountListPageResponse.hasMore
     */
    fun hasMore(): Boolean? = response._hasMore().getNullable("hasMore")

    /**
     * Delegates to [ExternalAccountListPageResponse], but gracefully handles missing data.
     *
     * @see ExternalAccountListPageResponse.totalCount
     */
    fun totalCount(): Long? = response._totalCount().getNullable("totalCount")

    override fun items(): List<ExternalAccount> = data()

    override fun hasNextPage(): Boolean = items().isNotEmpty() && nextCursor() != null

    fun nextPageParams(): ExternalAccountListParams {
        val nextCursor =
            nextCursor() ?: throw IllegalStateException("Cannot construct next page params")
        return params.toBuilder().cursor(nextCursor).build()
    }

    override suspend fun nextPage(): ExternalAccountListPageAsync = service.list(nextPageParams())

    fun autoPager(): AutoPagerAsync<ExternalAccount> = AutoPagerAsync.from(this)

    /** The parameters that were used to request this page. */
    fun params(): ExternalAccountListParams = params

    /** The response that this page was parsed from. */
    fun response(): ExternalAccountListPageResponse = response

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [ExternalAccountListPageAsync].
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

    /** A builder for [ExternalAccountListPageAsync]. */
    class Builder internal constructor() {

        private var service: ExternalAccountServiceAsync? = null
        private var params: ExternalAccountListParams? = null
        private var response: ExternalAccountListPageResponse? = null

        internal fun from(externalAccountListPageAsync: ExternalAccountListPageAsync) = apply {
            service = externalAccountListPageAsync.service
            params = externalAccountListPageAsync.params
            response = externalAccountListPageAsync.response
        }

        fun service(service: ExternalAccountServiceAsync) = apply { this.service = service }

        /** The parameters that were used to request this page. */
        fun params(params: ExternalAccountListParams) = apply { this.params = params }

        /** The response that this page was parsed from. */
        fun response(response: ExternalAccountListPageResponse) = apply { this.response = response }

        /**
         * Returns an immutable instance of [ExternalAccountListPageAsync].
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
        fun build(): ExternalAccountListPageAsync =
            ExternalAccountListPageAsync(
                checkRequired("service", service),
                checkRequired("params", params),
                checkRequired("response", response),
            )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExternalAccountListPageAsync &&
            service == other.service &&
            params == other.params &&
            response == other.response
    }

    override fun hashCode(): Int = Objects.hash(service, params, response)

    override fun toString() =
        "ExternalAccountListPageAsync{service=$service, params=$params, response=$response}"
}
