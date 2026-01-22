// File generated from our OpenAPI spec by Stainless.

package com.grid.api.client

import com.grid.api.core.ClientOptions
import com.grid.api.core.getPackageVersion
import com.grid.api.services.async.ConfigServiceAsync
import com.grid.api.services.async.ConfigServiceAsyncImpl
import com.grid.api.services.async.CustomerServiceAsync
import com.grid.api.services.async.CustomerServiceAsyncImpl
import com.grid.api.services.async.InvitationServiceAsync
import com.grid.api.services.async.InvitationServiceAsyncImpl
import com.grid.api.services.async.PlaidServiceAsync
import com.grid.api.services.async.PlaidServiceAsyncImpl
import com.grid.api.services.async.PlatformServiceAsync
import com.grid.api.services.async.PlatformServiceAsyncImpl
import com.grid.api.services.async.QuoteServiceAsync
import com.grid.api.services.async.QuoteServiceAsyncImpl
import com.grid.api.services.async.ReceiverServiceAsync
import com.grid.api.services.async.ReceiverServiceAsyncImpl
import com.grid.api.services.async.SandboxServiceAsync
import com.grid.api.services.async.SandboxServiceAsyncImpl
import com.grid.api.services.async.TokenServiceAsync
import com.grid.api.services.async.TokenServiceAsyncImpl
import com.grid.api.services.async.TransactionServiceAsync
import com.grid.api.services.async.TransactionServiceAsyncImpl
import com.grid.api.services.async.TransferInServiceAsync
import com.grid.api.services.async.TransferInServiceAsyncImpl
import com.grid.api.services.async.TransferOutServiceAsync
import com.grid.api.services.async.TransferOutServiceAsyncImpl
import com.grid.api.services.async.UmaProviderServiceAsync
import com.grid.api.services.async.UmaProviderServiceAsyncImpl
import com.grid.api.services.async.WebhookServiceAsync
import com.grid.api.services.async.WebhookServiceAsyncImpl

class GridClientAsyncImpl(private val clientOptions: ClientOptions) : GridClientAsync {

    private val clientOptionsWithUserAgent =
        if (clientOptions.headers.names().contains("User-Agent")) clientOptions
        else
            clientOptions
                .toBuilder()
                .putHeader("User-Agent", "${javaClass.simpleName}/Kotlin ${getPackageVersion()}")
                .build()

    // Pass the original clientOptions so that this client sets its own User-Agent.
    private val sync: GridClient by lazy { GridClientImpl(clientOptions) }

    private val withRawResponse: GridClientAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    private val config: ConfigServiceAsync by lazy {
        ConfigServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val customers: CustomerServiceAsync by lazy {
        CustomerServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val platform: PlatformServiceAsync by lazy {
        PlatformServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val plaid: PlaidServiceAsync by lazy {
        PlaidServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val transferIn: TransferInServiceAsync by lazy {
        TransferInServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val transferOut: TransferOutServiceAsync by lazy {
        TransferOutServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val receiver: ReceiverServiceAsync by lazy {
        ReceiverServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val quotes: QuoteServiceAsync by lazy {
        QuoteServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val transactions: TransactionServiceAsync by lazy {
        TransactionServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val webhooks: WebhookServiceAsync by lazy {
        WebhookServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val invitations: InvitationServiceAsync by lazy {
        InvitationServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val sandbox: SandboxServiceAsync by lazy {
        SandboxServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val umaProviders: UmaProviderServiceAsync by lazy {
        UmaProviderServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    private val tokens: TokenServiceAsync by lazy {
        TokenServiceAsyncImpl(clientOptionsWithUserAgent)
    }

    override fun sync(): GridClient = sync

    override fun withRawResponse(): GridClientAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): GridClientAsync =
        GridClientAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun config(): ConfigServiceAsync = config

    override fun customers(): CustomerServiceAsync = customers

    override fun platform(): PlatformServiceAsync = platform

    override fun plaid(): PlaidServiceAsync = plaid

    override fun transferIn(): TransferInServiceAsync = transferIn

    override fun transferOut(): TransferOutServiceAsync = transferOut

    override fun receiver(): ReceiverServiceAsync = receiver

    override fun quotes(): QuoteServiceAsync = quotes

    override fun transactions(): TransactionServiceAsync = transactions

    override fun webhooks(): WebhookServiceAsync = webhooks

    override fun invitations(): InvitationServiceAsync = invitations

    override fun sandbox(): SandboxServiceAsync = sandbox

    override fun umaProviders(): UmaProviderServiceAsync = umaProviders

    override fun tokens(): TokenServiceAsync = tokens

    override fun close() = clientOptions.close()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        GridClientAsync.WithRawResponse {

        private val config: ConfigServiceAsync.WithRawResponse by lazy {
            ConfigServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val customers: CustomerServiceAsync.WithRawResponse by lazy {
            CustomerServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val platform: PlatformServiceAsync.WithRawResponse by lazy {
            PlatformServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val plaid: PlaidServiceAsync.WithRawResponse by lazy {
            PlaidServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val transferIn: TransferInServiceAsync.WithRawResponse by lazy {
            TransferInServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val transferOut: TransferOutServiceAsync.WithRawResponse by lazy {
            TransferOutServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val receiver: ReceiverServiceAsync.WithRawResponse by lazy {
            ReceiverServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val quotes: QuoteServiceAsync.WithRawResponse by lazy {
            QuoteServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val transactions: TransactionServiceAsync.WithRawResponse by lazy {
            TransactionServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val webhooks: WebhookServiceAsync.WithRawResponse by lazy {
            WebhookServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val invitations: InvitationServiceAsync.WithRawResponse by lazy {
            InvitationServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val sandbox: SandboxServiceAsync.WithRawResponse by lazy {
            SandboxServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val umaProviders: UmaProviderServiceAsync.WithRawResponse by lazy {
            UmaProviderServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        private val tokens: TokenServiceAsync.WithRawResponse by lazy {
            TokenServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): GridClientAsync.WithRawResponse =
            GridClientAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        override fun config(): ConfigServiceAsync.WithRawResponse = config

        override fun customers(): CustomerServiceAsync.WithRawResponse = customers

        override fun platform(): PlatformServiceAsync.WithRawResponse = platform

        override fun plaid(): PlaidServiceAsync.WithRawResponse = plaid

        override fun transferIn(): TransferInServiceAsync.WithRawResponse = transferIn

        override fun transferOut(): TransferOutServiceAsync.WithRawResponse = transferOut

        override fun receiver(): ReceiverServiceAsync.WithRawResponse = receiver

        override fun quotes(): QuoteServiceAsync.WithRawResponse = quotes

        override fun transactions(): TransactionServiceAsync.WithRawResponse = transactions

        override fun webhooks(): WebhookServiceAsync.WithRawResponse = webhooks

        override fun invitations(): InvitationServiceAsync.WithRawResponse = invitations

        override fun sandbox(): SandboxServiceAsync.WithRawResponse = sandbox

        override fun umaProviders(): UmaProviderServiceAsync.WithRawResponse = umaProviders

        override fun tokens(): TokenServiceAsync.WithRawResponse = tokens
    }
}
