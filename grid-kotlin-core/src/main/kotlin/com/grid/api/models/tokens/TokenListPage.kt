// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.tokens

import com.grid.api.core.AutoPager
import com.grid.api.core.Page
import com.grid.api.core.checkRequired
import com.grid.api.services.blocking.TokenService
import java.util.Objects

/** @see TokenService.list */
class TokenListPage
private constructor(
    private val service: TokenService,
    private val params: TokenListParams,
    private val response: TokenListPageResponse,
) : Page<ApiToken> {

    /**
     * Delegates to [TokenListPageResponse], but gracefully handles missing data.
     *
     * @see TokenListPageResponse.data
     */
    fun data(): List<ApiToken> = response._data().getNullable("data") ?: emptyList()

    /**
     * Delegates to [TokenListPageResponse], but gracefully handles missing data.
     *
     * @see TokenListPageResponse.nextCursor
     */
    fun nextCursor(): String? = response._nextCursor().getNullable("nextCursor")

    /**
     * Delegates to [TokenListPageResponse], but gracefully handles missing data.
     *
     * @see TokenListPageResponse.hasMore
     */
    fun hasMore(): Boolean? = response._hasMore().getNullable("hasMore")

    /**
     * Delegates to [TokenListPageResponse], but gracefully handles missing data.
     *
     * @see TokenListPageResponse.totalCount
     */
    fun totalCount(): Long? = response._totalCount().getNullable("totalCount")

    override fun items(): List<ApiToken> = data()

    override fun hasNextPage(): Boolean = items().isNotEmpty() && nextCursor() != null

    fun nextPageParams(): TokenListParams {
        val nextCursor =
            nextCursor() ?: throw IllegalStateException("Cannot construct next page params")
        return params.toBuilder().cursor(nextCursor).build()
    }

    override fun nextPage(): TokenListPage = service.list(nextPageParams())

    fun autoPager(): AutoPager<ApiToken> = AutoPager.from(this)

    /** The parameters that were used to request this page. */
    fun params(): TokenListParams = params

    /** The response that this page was parsed from. */
    fun response(): TokenListPageResponse = response

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [TokenListPage].
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

    /** A builder for [TokenListPage]. */
    class Builder internal constructor() {

        private var service: TokenService? = null
        private var params: TokenListParams? = null
        private var response: TokenListPageResponse? = null

        internal fun from(tokenListPage: TokenListPage) = apply {
            service = tokenListPage.service
            params = tokenListPage.params
            response = tokenListPage.response
        }

        fun service(service: TokenService) = apply { this.service = service }

        /** The parameters that were used to request this page. */
        fun params(params: TokenListParams) = apply { this.params = params }

        /** The response that this page was parsed from. */
        fun response(response: TokenListPageResponse) = apply { this.response = response }

        /**
         * Returns an immutable instance of [TokenListPage].
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
        fun build(): TokenListPage =
            TokenListPage(
                checkRequired("service", service),
                checkRequired("params", params),
                checkRequired("response", response),
            )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is TokenListPage &&
            service == other.service &&
            params == other.params &&
            response == other.response
    }

    override fun hashCode(): Int = Objects.hash(service, params, response)

    override fun toString() = "TokenListPage{service=$service, params=$params, response=$response}"
}
