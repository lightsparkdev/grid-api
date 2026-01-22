// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.umaproviders

import com.grid.api.core.AutoPager
import com.grid.api.core.Page
import com.grid.api.core.checkRequired
import com.grid.api.services.blocking.UmaProviderService
import java.util.Objects

/** @see UmaProviderService.list */
class UmaProviderListPage
private constructor(
    private val service: UmaProviderService,
    private val params: UmaProviderListParams,
    private val response: UmaProviderListPageResponse,
) : Page<UmaProviderListResponse> {

    /**
     * Delegates to [UmaProviderListPageResponse], but gracefully handles missing data.
     *
     * @see UmaProviderListPageResponse.data
     */
    fun data(): List<UmaProviderListResponse> = response._data().getNullable("data") ?: emptyList()

    /**
     * Delegates to [UmaProviderListPageResponse], but gracefully handles missing data.
     *
     * @see UmaProviderListPageResponse.nextCursor
     */
    fun nextCursor(): String? = response._nextCursor().getNullable("nextCursor")

    /**
     * Delegates to [UmaProviderListPageResponse], but gracefully handles missing data.
     *
     * @see UmaProviderListPageResponse.hasMore
     */
    fun hasMore(): Boolean? = response._hasMore().getNullable("hasMore")

    /**
     * Delegates to [UmaProviderListPageResponse], but gracefully handles missing data.
     *
     * @see UmaProviderListPageResponse.totalCount
     */
    fun totalCount(): Long? = response._totalCount().getNullable("totalCount")

    override fun items(): List<UmaProviderListResponse> = data()

    override fun hasNextPage(): Boolean = items().isNotEmpty() && nextCursor() != null

    fun nextPageParams(): UmaProviderListParams {
        val nextCursor =
            nextCursor() ?: throw IllegalStateException("Cannot construct next page params")
        return params.toBuilder().cursor(nextCursor).build()
    }

    override fun nextPage(): UmaProviderListPage = service.list(nextPageParams())

    fun autoPager(): AutoPager<UmaProviderListResponse> = AutoPager.from(this)

    /** The parameters that were used to request this page. */
    fun params(): UmaProviderListParams = params

    /** The response that this page was parsed from. */
    fun response(): UmaProviderListPageResponse = response

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [UmaProviderListPage].
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

    /** A builder for [UmaProviderListPage]. */
    class Builder internal constructor() {

        private var service: UmaProviderService? = null
        private var params: UmaProviderListParams? = null
        private var response: UmaProviderListPageResponse? = null

        internal fun from(umaProviderListPage: UmaProviderListPage) = apply {
            service = umaProviderListPage.service
            params = umaProviderListPage.params
            response = umaProviderListPage.response
        }

        fun service(service: UmaProviderService) = apply { this.service = service }

        /** The parameters that were used to request this page. */
        fun params(params: UmaProviderListParams) = apply { this.params = params }

        /** The response that this page was parsed from. */
        fun response(response: UmaProviderListPageResponse) = apply { this.response = response }

        /**
         * Returns an immutable instance of [UmaProviderListPage].
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
        fun build(): UmaProviderListPage =
            UmaProviderListPage(
                checkRequired("service", service),
                checkRequired("params", params),
                checkRequired("response", response),
            )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UmaProviderListPage &&
            service == other.service &&
            params == other.params &&
            response == other.response
    }

    override fun hashCode(): Int = Objects.hash(service, params, response)

    override fun toString() =
        "UmaProviderListPage{service=$service, params=$params, response=$response}"
}
