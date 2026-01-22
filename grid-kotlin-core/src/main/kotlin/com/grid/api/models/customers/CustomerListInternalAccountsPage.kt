// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.grid.api.core.AutoPager
import com.grid.api.core.Page
import com.grid.api.core.checkRequired
import com.grid.api.models.sandbox.internalaccounts.InternalAccount
import com.grid.api.services.blocking.CustomerService
import java.util.Objects

/** @see CustomerService.listInternalAccounts */
class CustomerListInternalAccountsPage
private constructor(
    private val service: CustomerService,
    private val params: CustomerListInternalAccountsParams,
    private val response: CustomerListInternalAccountsPageResponse,
) : Page<InternalAccount> {

    /**
     * Delegates to [CustomerListInternalAccountsPageResponse], but gracefully handles missing data.
     *
     * @see CustomerListInternalAccountsPageResponse.data
     */
    fun data(): List<InternalAccount> = response._data().getNullable("data") ?: emptyList()

    /**
     * Delegates to [CustomerListInternalAccountsPageResponse], but gracefully handles missing data.
     *
     * @see CustomerListInternalAccountsPageResponse.nextCursor
     */
    fun nextCursor(): String? = response._nextCursor().getNullable("nextCursor")

    /**
     * Delegates to [CustomerListInternalAccountsPageResponse], but gracefully handles missing data.
     *
     * @see CustomerListInternalAccountsPageResponse.hasMore
     */
    fun hasMore(): Boolean? = response._hasMore().getNullable("hasMore")

    /**
     * Delegates to [CustomerListInternalAccountsPageResponse], but gracefully handles missing data.
     *
     * @see CustomerListInternalAccountsPageResponse.totalCount
     */
    fun totalCount(): Long? = response._totalCount().getNullable("totalCount")

    override fun items(): List<InternalAccount> = data()

    override fun hasNextPage(): Boolean = items().isNotEmpty() && nextCursor() != null

    fun nextPageParams(): CustomerListInternalAccountsParams {
        val nextCursor =
            nextCursor() ?: throw IllegalStateException("Cannot construct next page params")
        return params.toBuilder().cursor(nextCursor).build()
    }

    override fun nextPage(): CustomerListInternalAccountsPage =
        service.listInternalAccounts(nextPageParams())

    fun autoPager(): AutoPager<InternalAccount> = AutoPager.from(this)

    /** The parameters that were used to request this page. */
    fun params(): CustomerListInternalAccountsParams = params

    /** The response that this page was parsed from. */
    fun response(): CustomerListInternalAccountsPageResponse = response

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of
         * [CustomerListInternalAccountsPage].
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

    /** A builder for [CustomerListInternalAccountsPage]. */
    class Builder internal constructor() {

        private var service: CustomerService? = null
        private var params: CustomerListInternalAccountsParams? = null
        private var response: CustomerListInternalAccountsPageResponse? = null

        internal fun from(customerListInternalAccountsPage: CustomerListInternalAccountsPage) =
            apply {
                service = customerListInternalAccountsPage.service
                params = customerListInternalAccountsPage.params
                response = customerListInternalAccountsPage.response
            }

        fun service(service: CustomerService) = apply { this.service = service }

        /** The parameters that were used to request this page. */
        fun params(params: CustomerListInternalAccountsParams) = apply { this.params = params }

        /** The response that this page was parsed from. */
        fun response(response: CustomerListInternalAccountsPageResponse) = apply {
            this.response = response
        }

        /**
         * Returns an immutable instance of [CustomerListInternalAccountsPage].
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
        fun build(): CustomerListInternalAccountsPage =
            CustomerListInternalAccountsPage(
                checkRequired("service", service),
                checkRequired("params", params),
                checkRequired("response", response),
            )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerListInternalAccountsPage &&
            service == other.service &&
            params == other.params &&
            response == other.response
    }

    override fun hashCode(): Int = Objects.hash(service, params, response)

    override fun toString() =
        "CustomerListInternalAccountsPage{service=$service, params=$params, response=$response}"
}
