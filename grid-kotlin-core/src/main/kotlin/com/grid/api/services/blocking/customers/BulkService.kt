// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.customers

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.customers.bulk.BulkGetJobStatusParams
import com.grid.api.models.customers.bulk.BulkGetJobStatusResponse
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import com.grid.api.models.customers.bulk.BulkUploadCsvResponse

interface BulkService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): BulkService

    /**
     * Retrieve the current status and results of a bulk customer import job. This endpoint can be
     * used to track the progress of both CSV uploads.
     *
     * The response includes:
     * - Overall job status
     * - Progress statistics
     * - Detailed error information for failed entries
     * - Completion timestamp when finished
     */
    fun getJobStatus(
        jobId: String,
        params: BulkGetJobStatusParams = BulkGetJobStatusParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): BulkGetJobStatusResponse =
        getJobStatus(params.toBuilder().jobId(jobId).build(), requestOptions)

    /** @see getJobStatus */
    fun getJobStatus(
        params: BulkGetJobStatusParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): BulkGetJobStatusResponse

    /** @see getJobStatus */
    fun getJobStatus(jobId: String, requestOptions: RequestOptions): BulkGetJobStatusResponse =
        getJobStatus(jobId, BulkGetJobStatusParams.none(), requestOptions)

    /**
     * Upload a CSV file containing customer information for bulk creation. The CSV file should
     * follow a specific format with required and optional columns based on customer type.
     *
     * ### CSV Format
     * The CSV file should have the following columns:
     *
     * Required columns for all customers:
     * - umaAddress: The customer's UMA address (e.g., $john.doe@uma.domain.com)
     * - platformCustomerId: Your platform's unique identifier for the customer
     * - customerType: Either "INDIVIDUAL" or "BUSINESS"
     *
     * Required columns for individual customers:
     * - fullName: Individual's full name
     * - birthDate: Date of birth in YYYY-MM-DD format
     * - addressLine1: Street address line 1
     * - city: City
     * - state: State/Province/Region
     * - postalCode: Postal/ZIP code
     * - country: Country code (ISO 3166-1 alpha-2)
     *
     * Required columns for business customers:
     * - businessLegalName: Legal name of the business
     * - addressLine1: Street address line 1
     * - city: City
     * - state: State/Province/Region
     * - postalCode: Postal/ZIP code
     * - country: Country code (ISO 3166-1 alpha-2)
     *
     * Optional columns for all customers:
     * - addressLine2: Street address line 2
     * - platformAccountId: Your platform's identifier for the bank account
     * - description: Optional description for the customer
     *
     * Optional columns for individual customers:
     * - email: Customer's email address
     *
     * Optional columns for business customers:
     * - businessRegistrationNumber: Business registration number
     * - businessTaxId: Tax identification number
     *
     * ### Example CSV
     *
     * ```csv
     * umaAddress,platformCustomerId,customerType,fullName,birthDate,addressLine1,city,state,postalCode,country,platformAccountId,businessLegalName
     * john.doe@uma.domain.com,customer123,INDIVIDUAL,John Doe,1990-01-15,123 Main St,San Francisco,CA,94105,US
     * acme@uma.domain.com,biz456,BUSINESS,,,400 Commerce Way,Austin,TX,78701,US
     * ```
     *
     * The upload process is asynchronous and will return a job ID that can be used to track
     * progress. You can monitor the job status using the `/customers/bulk/jobs/{jobId}` endpoint.
     */
    fun uploadCsv(
        params: BulkUploadCsvParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): BulkUploadCsvResponse

    /** A view of [BulkService] that provides access to raw HTTP responses for each method. */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(modifier: (ClientOptions.Builder) -> Unit): BulkService.WithRawResponse

        /**
         * Returns a raw HTTP response for `get /customers/bulk/jobs/{jobId}`, but is otherwise the
         * same as [BulkService.getJobStatus].
         */
        @MustBeClosed
        fun getJobStatus(
            jobId: String,
            params: BulkGetJobStatusParams = BulkGetJobStatusParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<BulkGetJobStatusResponse> =
            getJobStatus(params.toBuilder().jobId(jobId).build(), requestOptions)

        /** @see getJobStatus */
        @MustBeClosed
        fun getJobStatus(
            params: BulkGetJobStatusParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<BulkGetJobStatusResponse>

        /** @see getJobStatus */
        @MustBeClosed
        fun getJobStatus(
            jobId: String,
            requestOptions: RequestOptions,
        ): HttpResponseFor<BulkGetJobStatusResponse> =
            getJobStatus(jobId, BulkGetJobStatusParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `post /customers/bulk/csv`, but is otherwise the same as
         * [BulkService.uploadCsv].
         */
        @MustBeClosed
        fun uploadCsv(
            params: BulkUploadCsvParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<BulkUploadCsvResponse>
    }
}
