// File generated from our OpenAPI spec by Stainless.

package com.grid.api.client

import com.grid.api.core.ClientOptions
import com.grid.api.core.getPackageVersion
import com.grid.api.services.blocking.ConfigService
import com.grid.api.services.blocking.ConfigServiceImpl
import com.grid.api.services.blocking.CustomerService
import com.grid.api.services.blocking.CustomerServiceImpl
import com.grid.api.services.blocking.InvitationService
import com.grid.api.services.blocking.InvitationServiceImpl
import com.grid.api.services.blocking.PlaidService
import com.grid.api.services.blocking.PlaidServiceImpl
import com.grid.api.services.blocking.PlatformService
import com.grid.api.services.blocking.PlatformServiceImpl
import com.grid.api.services.blocking.QuoteService
import com.grid.api.services.blocking.QuoteServiceImpl
import com.grid.api.services.blocking.ReceiverService
import com.grid.api.services.blocking.ReceiverServiceImpl
import com.grid.api.services.blocking.SandboxService
import com.grid.api.services.blocking.SandboxServiceImpl
import com.grid.api.services.blocking.TokenService
import com.grid.api.services.blocking.TokenServiceImpl
import com.grid.api.services.blocking.TransactionService
import com.grid.api.services.blocking.TransactionServiceImpl
import com.grid.api.services.blocking.TransferInService
import com.grid.api.services.blocking.TransferInServiceImpl
import com.grid.api.services.blocking.TransferOutService
import com.grid.api.services.blocking.TransferOutServiceImpl
import com.grid.api.services.blocking.UmaProviderService
import com.grid.api.services.blocking.UmaProviderServiceImpl
import com.grid.api.services.blocking.WebhookService
import com.grid.api.services.blocking.WebhookServiceImpl

class GridClientImpl(private val clientOptions: ClientOptions) : GridClient {

    private val clientOptionsWithUserAgent =
        if (clientOptions.headers.names().contains("User-Agent")) clientOptions
        else
            clientOptions
                .toBuilder()
                .putHeader("User-Agent", "${javaClass.simpleName}/Kotlin ${getPackageVersion()}")
                .build()

    // Pass the original clientOptions so that this client sets its own User-Agent.
    private val async: GridClientAsync by lazy { GridClientAsyncImpl(clientOptions) }

    private val withRawResponse: GridClient.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    private val config: ConfigService by lazy { ConfigServiceImpl(clientOptionsWithUserAgent) }

    private val customers: CustomerService by lazy {
        CustomerServiceImpl(clientOptionsWithUserAgent)
    }

    private val platform: PlatformService by lazy {
        PlatformServiceImpl(clientOptionsWithUserAgent)
    }

    private val plaid: PlaidService by lazy { PlaidServiceImpl(clientOptionsWithUserAgent) }

    private val transferIn: TransferInService by lazy {
        TransferInServiceImpl(clientOptionsWithUserAgent)
    }

    private val transferOut: TransferOutService by lazy {
        TransferOutServiceImpl(clientOptionsWithUserAgent)
    }

    private val receiver: ReceiverService by lazy {
        ReceiverServiceImpl(clientOptionsWithUserAgent)
    }

    private val quotes: QuoteService by lazy { QuoteServiceImpl(clientOptionsWithUserAgent) }

    private val transactions: TransactionService by lazy {
        TransactionServiceImpl(clientOptionsWithUserAgent)
    }

    private val webhooks: WebhookService by lazy { WebhookServiceImpl(clientOptionsWithUserAgent) }

    private val invitations: InvitationService by lazy {
        InvitationServiceImpl(clientOptionsWithUserAgent)
    }

    private val sandbox: SandboxService by lazy { SandboxServiceImpl(clientOptionsWithUserAgent) }

    private val umaProviders: UmaProviderService by lazy {
        UmaProviderServiceImpl(clientOptionsWithUserAgent)
    }

    private val tokens: TokenService by lazy { TokenServiceImpl(clientOptionsWithUserAgent) }

    override fun async(): GridClientAsync = async

    override fun withRawResponse(): GridClient.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): GridClient =
        GridClientImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun config(): ConfigService = config

    override fun customers(): CustomerService = customers

    override fun platform(): PlatformService = platform

    override fun plaid(): PlaidService = plaid

    override fun transferIn(): TransferInService = transferIn

    override fun transferOut(): TransferOutService = transferOut

    override fun receiver(): ReceiverService = receiver

    override fun quotes(): QuoteService = quotes

    override fun transactions(): TransactionService = transactions

    override fun webhooks(): WebhookService = webhooks

    override fun invitations(): InvitationService = invitations

    override fun sandbox(): SandboxService = sandbox

    override fun umaProviders(): UmaProviderService = umaProviders

    override fun tokens(): TokenService = tokens

    override fun close() = clientOptions.close()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        GridClient.WithRawResponse {

        private val config: ConfigService.WithRawResponse by lazy {
            ConfigServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val customers: CustomerService.WithRawResponse by lazy {
            CustomerServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val platform: PlatformService.WithRawResponse by lazy {
            PlatformServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val plaid: PlaidService.WithRawResponse by lazy {
            PlaidServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val transferIn: TransferInService.WithRawResponse by lazy {
            TransferInServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val transferOut: TransferOutService.WithRawResponse by lazy {
            TransferOutServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val receiver: ReceiverService.WithRawResponse by lazy {
            ReceiverServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val quotes: QuoteService.WithRawResponse by lazy {
            QuoteServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val transactions: TransactionService.WithRawResponse by lazy {
            TransactionServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val webhooks: WebhookService.WithRawResponse by lazy {
            WebhookServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val invitations: InvitationService.WithRawResponse by lazy {
            InvitationServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val sandbox: SandboxService.WithRawResponse by lazy {
            SandboxServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val umaProviders: UmaProviderService.WithRawResponse by lazy {
            UmaProviderServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val tokens: TokenService.WithRawResponse by lazy {
            TokenServiceImpl.WithRawResponseImpl(clientOptions)
        }

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): GridClient.WithRawResponse =
            GridClientImpl.WithRawResponseImpl(clientOptions.toBuilder().apply(modifier).build())

        override fun config(): ConfigService.WithRawResponse = config

        override fun customers(): CustomerService.WithRawResponse = customers

        override fun platform(): PlatformService.WithRawResponse = platform

        override fun plaid(): PlaidService.WithRawResponse = plaid

        override fun transferIn(): TransferInService.WithRawResponse = transferIn

        override fun transferOut(): TransferOutService.WithRawResponse = transferOut

        override fun receiver(): ReceiverService.WithRawResponse = receiver

        override fun quotes(): QuoteService.WithRawResponse = quotes

        override fun transactions(): TransactionService.WithRawResponse = transactions

        override fun webhooks(): WebhookService.WithRawResponse = webhooks

        override fun invitations(): InvitationService.WithRawResponse = invitations

        override fun sandbox(): SandboxService.WithRawResponse = sandbox

        override fun umaProviders(): UmaProviderService.WithRawResponse = umaProviders

        override fun tokens(): TokenService.WithRawResponse = tokens
    }
}
