import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

type SubscriptionType = 'default' | 'redirect' | 'embedded' | 'embedded_component';

interface SubscribeOptions {
  customerId: string;
  priceId: string;
  metadata: Record<string, string>;
  type?: 'default' | 'redirect' | 'embedded' | 'embedded_component';
  returnUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
}
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {

    const apiKey = this.configService.get<string>('STRIPE_API_KEY');
    if (!apiKey) {
      throw new Error('Stripe API key is not configured!');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-07-30.basil',
    });
  }

  /**
   * Create a Stripe Payment Intent for a one-time payment.
   *
   * This method initializes a payment process by creating a PaymentIntent
   * in Stripe. It supports automatic payment methods.
   *
   * @param amount            Amount to charge, in the smallest currency unit (e.g., cents for USD).
   * @param currency          ISO currency code (e.g., 'usd', 'eur').
   * @param metadata          Metadata for the payment. Must include 'paymentId' and 'paymentCategory'.
   * @param description       (Optional) Description of the payment (appears in Stripe dashboard).
   *
   * @returns The created Stripe PaymentIntent object.
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string | undefined>,
    description?: string
  ) {
    // Ensure required metadata fields are present
    if (!metadata.paymentId || !metadata.paymentCategory) {
      throw new Error("metadata must include 'paymentId' and 'paymentCategory'");
    }

    // Remove undefined values, since Stripe metadata only accepts strings
    const filteredMetadata: Record<string, string> = {};
    for (const key in metadata) {
      const value = metadata[key];
      if (value !== undefined) {
        filteredMetadata[key] = value;
      }
    }

    // Convert amount to smallest currency unit (cents) and ensure it's an integer
    const amountInCents = this.convertToSmallestCurrencyUnit(amount, currency);

    return this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      description,
      metadata: filteredMetadata,
      automatic_payment_methods: { enabled: true },
    });
  }


  /**
   * Cancel a Stripe PaymentIntent if it's still pending.
   * Also updates local payment record.
   *
   * @param paymentIntentId Stripe PaymentIntent ID
   * @param reason Optional cancellation reason
   */
  async cancelPaymentIntent(
    paymentIntentId: string,
    reason: Stripe.PaymentIntentCancelParams.CancellationReason = 'abandoned',
  ) {

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if the PaymentIntent can be cancelled
    if (!this.canCancelPaymentIntent(paymentIntent)) {
      this.logger.warn(
        `PaymentIntent ${paymentIntentId} cannot be cancelled. Current status: ${paymentIntent.status}`
      );
      return null;
    }

    return await this.stripe.paymentIntents.cancel(
      paymentIntentId,
      { cancellation_reason: reason }
    );
  }


  /**
   * Check if a PaymentIntent can be cancelled based on its current status
   */
  private canCancelPaymentIntent(paymentIntent: Stripe.PaymentIntent): boolean {
    const cancellableStatuses: Stripe.PaymentIntent.Status[] = [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing'
    ];

    return cancellableStatuses.includes(paymentIntent.status);
  }


  /**
   * Handles incoming Stripe webhook events.
   * 
   * - Verifies the signature with Stripe's secret.
   * - Parses the raw payload into a Stripe.Event object.
   * - Emits application-level events for downstream listeners.
   * 
   * @param signature Stripe-Signature header from the incoming request.
   * @param payload Raw request body (Buffer), required for verification.
   * @returns {Object} An acknowledgment object sent back to Stripe.
   * 
   * @throws {Error} If the webhook secret is missing or signature verification fails.
   * 
   * Example emitted events (prefixed with `stripe.`):
   * 
   * - **Account Events** → lifecycle updates related to connected accounts:
   *   - `stripe.account.updated` → account details were updated.
   *   - `stripe.account.application.authorized` → an application was authorized to access the account.
   *   - `stripe.account.application.deauthorized` → an application’s access was revoked.
   * 
   * - **Balance Events** → updates regarding available balance:
   *   - `stripe.balance.available` → new funds are available to withdraw.
   * 
   * - **Charge Events** → lifecycle of a payment charge:
   *   - `stripe.charge.captured` → a charge was successfully captured.
   *   - `stripe.charge.expired` → a charge authorization expired.
   *   - `stripe.charge.failed` → a charge attempt failed.
   *   - `stripe.charge.pending` → a charge is still pending.
   *   - `stripe.charge.refunded` → a charge was refunded (partial or full).
   *   - `stripe.charge.succeeded` → a charge was successfully paid.
   *   - `stripe.charge.updated` → details of a charge were updated.
   * 
   * - **Customer Events** → lifecycle of a customer object:
   *   - `stripe.customer.created` → a new customer was created.
   *   - `stripe.customer.deleted` → a customer was deleted.
   *   - `stripe.customer.updated` → customer details were updated.
   *   - `stripe.customer.source.created` → a new payment source was added.
   *   - `stripe.customer.source.deleted` → a payment source was removed.
   * 
   * - **Payment Method Events** → lifecycle of saved payment methods:
   *   - `stripe.payment_method.attached` → a payment method was attached to a customer.
   *   - `stripe.payment_method.detached` → a payment method was detached from a customer.
   *   - `stripe.payment_method.automatically_updated` → Stripe automatically updated card details (e.g., exp date).
   *   - `stripe.payment_method.updated` → a payment method was manually updated.
   * 
   * - **PaymentIntent Events** → status changes for payment intents:
   *   - `stripe.payment_intent.amount_capturable_updated` → the capturable amount was updated.
   *   - `stripe.payment_intent.canceled` → a payment intent was canceled.
   *   - `stripe.payment_intent.created` → a new payment intent was created.
   *   - `stripe.payment_intent.payment_failed` → the payment attempt failed.
   *   - `stripe.payment_intent.succeeded` → the payment was successful.
   * 
   * - **Subscription Events** → lifecycle of customer subscriptions:
   *   - `stripe.customer.subscription.created` → a new subscription was created.
   *   - `stripe.customer.subscription.deleted` → a subscription was canceled.
   *   - `stripe.customer.subscription.updated` → a subscription was updated (plan, status, etc.).
   * 
   * - **Invoice Events** → lifecycle of invoices:
   *   - `stripe.invoice.created` → an invoice was created.
   *   - `stripe.invoice.finalized` → an invoice was finalized and locked.
   *   - `stripe.invoice.paid` → an invoice was successfully paid.
   *   - `stripe.invoice.payment_failed` → payment for an invoice failed.
   *   - `stripe.invoice.updated` → invoice details were updated.
   */
  async handleWebhook(signature: string, payload: Buffer) {
    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!endpointSecret) {
      throw new Error('Stripe Webhook key is not configured!');
    }
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Define supported event types
    const supportedEvents = new Set([
      // Account Events
      'account.updated',
      'account.application.authorized',
      'account.application.deauthorized',

      // Balance Events
      'balance.available',

      // Charge Events
      'charge.captured',
      'charge.expired',
      'charge.failed',
      'charge.pending',
      'charge.refunded',
      'charge.succeeded',
      'charge.updated',

      // Customer Events
      'customer.created',
      'customer.deleted',
      'customer.updated',
      'customer.source.created',
      'customer.source.deleted',

      // Payment Method Events
      'payment_method.attached',
      'payment_method.detached',
      'payment_method.automatically_updated',
      'payment_method.updated',

      // PaymentIntent Events
      'payment_intent.amount_capturable_updated',
      'payment_intent.canceled',
      'payment_intent.created',
      'payment_intent.payment_failed',
      'payment_intent.succeeded',

      // Subscription Events
      'customer.subscription.created',
      'customer.subscription.deleted',
      'customer.subscription.updated',

      // Invoice Events
      'invoice.created',
      'invoice.finalized',
      'invoice.paid',
      'invoice.payment_failed',
      'invoice.updated'
    ]);

    // Emit event if supported, otherwise log warning
    if (supportedEvents.has(event.type)) {
      // use event
      this.eventEmitter.emit(`stripe.${event.type}`, event);
    } else {
      this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }
    return { received: true };
  }


  /** ==================== PRODUCT ==================== */

  /**
   * Create a Stripe product and attach your internal product ID in metadata
   * @param name - Product name for Stripe
   * @param productIdInDb - Internal DB product ID
   */
  async createProduct(name: string, productIdInDb: string) {
    return await this.stripe.products.create({
      name,
      metadata: {
        productId: productIdInDb,
      },
    });
  }


  /** ==================== PRICE ==================== */

  /**
   * Create a recurring price in Stripe for a given product
   * @param productId - Stripe product ID
   * @param amount - Price amount in the smallest currency unit (e.g., cents)
   * @param currency - Currency code (e.g., 'usd')
   * @param interval - Billing interval ('month' | 'year')
   * @param priceIdInDb - Internal DB price ID
   */
  async createPrice(
    productId: string,
    amount: number,
    currency: string,
    interval: 'month' | 'year',
    priceIdInDb: string,
  ) {
    return await this.stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency,
      recurring: { interval },
      metadata: {
        priceId: priceIdInDb,
      },
    });
  }


  /** ==================== CUSTOMER ==================== */

  /**
   * Create a Stripe customer with internal user ID in metadata
   * @param email - Customer email
   * @param userId - Internal DB user ID
   */
  async createCustomer(email: string, userId: string) {
    return await this.stripe.customers.create({
      email,
      metadata: {
        userId
      },
    });
  }

  /**
   * Retrieve a Stripe customer by Stripe customer ID
   * @param customerId - Stripe customer ID
   */
  async getCustomer(customerId: string) {
    return await this.stripe.customers.retrieve(customerId);
  }


  /** ==================== SUBSCRIPTION ==================== */

  async subscribe({
    customerId,
    priceId,
    metadata,
    type = 'default',
    returnUrl = 'https://example.com/',
    successUrl = 'https://example.com/',
    cancelUrl = 'https://example.com/',
  }: SubscribeOptions) {
    switch (type) {
      case 'default': {
        const subscription = await this.stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          metadata,
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          billing_mode: { type: 'flexible' },
          expand: ['latest_invoice.confirmation_secret'],
        });
        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const clientSecret =
          invoice.confirmation_secret && typeof invoice.confirmation_secret !== 'string'
            ? invoice.confirmation_secret.client_secret
            : undefined;

        return {
          subscriptionId: subscription.id,
          clientSecret,
        };
      }

      case 'redirect': {
        const session = await this.stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: customerId,
          line_items: [{ price: priceId, quantity: 1 }],
          metadata,
          success_url: successUrl,
          cancel_url: cancelUrl
        });
        return { url: session.url };
      }

      case 'embedded': {
        const session = await this.stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: customerId,
          line_items: [{ price: priceId, quantity: 1 }],
          metadata,
          ui_mode: 'embedded',
          return_url: returnUrl,
        });
        return { clientSecret: session.client_secret };
      }

      case 'embedded_component': {
        const session = await this.stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: customerId,
          line_items: [{ price: priceId, quantity: 1 }],
          metadata,
          ui_mode: 'custom',
          return_url: returnUrl,
        });
        return { clientSecret: session.client_secret };
      }

      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }
  }

  /**
   * Cancel an active Stripe subscription
   * @param subscriptionId - Stripe subscription ID
   */
  async unsubscribe(subscriptionId: string) {
    return await this.stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Creates a complete subscription flow for a user:
   * - Ensures a Stripe Customer exists for the user
   * - Ensures the Product and Price exist in Stripe
   * - Creates the Subscription with the selected flow type
   *
   * @param userId - Internal user ID
   * @param email - User email (used if creating a new Stripe Customer)
   * @param productIdInDb - Internal product ID
   * @param productName - Product display name (used if Product needs to be created)
   * @param priceIdInDb - Internal price ID
   * @param amount - Price amount in smallest currency unit (e.g., cents)
   * @param currency - Currency code (e.g., "usd")
   * @param interval - Billing interval ("month" or "year")
   * @param subscriptionIdInDb - Internal subscription ID
   * @param type - Subscription flow type ('default', 'redirect', 'embedded', 'embedded_component')
   * @param successUrl - Optional URL for successful checkout redirect
   * @param returnUrl - Optional URL for embedded flow return
   */
  async createUserSubscription(
    userId: string,
    email: string,
    productIdInDb: string,
    productName: string,
    priceIdInDb: string,
    amount: number,
    currency: string,
    interval: 'month' | 'year',
    subscriptionIdInDb: string,
    type: SubscriptionType = 'default',
    successUrl?: string,
    returnUrl?: string,
  ) {
    // Check if a Stripe Customer already exists for this user
    let customer: Stripe.Customer;
    const existingCustomers = await this.stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });

    customer = existingCustomers.data.length > 0
      ? existingCustomers.data[0]
      : await this.createCustomer(email, userId);


    // Check if the Stripe Product exists
    let product: Stripe.Product;
    const productList = await this.stripe.products.search({
      query: `metadata['productId']:'${productIdInDb}'`,
    });

    product = productList.data.length > 0
      ? productList.data[0]
      : await this.createProduct(productName, productIdInDb);


    // Check if the Stripe Price exists
    let price: Stripe.Price;
    const priceList = await this.stripe.prices.search({
      query: `metadata['priceId']:'${priceIdInDb}'`,
    });

    price = priceList.data.length > 0
      ? priceList.data[0]
      : await this.createPrice(product.id, amount, currency, interval, priceIdInDb);


    // Create the subscription using the specified type/flow
    return await this.subscribe({
      customerId: customer.id,
      priceId: price.id,
      metadata: {
        subscriptionId: subscriptionIdInDb,
        userId,
        productId: productIdInDb
      },
      type,
      successUrl,
      returnUrl,
    });
  }


  /**
   * Update an existing subscription with a new price
   * Stripe prices are immutable — this replaces the subscription's price item
   * @param subscriptionId - Stripe subscription ID
   * @param newPriceId - Stripe price ID to replace the old one
   * @param priceIdInDb - Internal DB price ID
   */
  async updateSubscriptionPrice(subscriptionId: string, newPriceId: string, priceIdInDb: string) {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;

    return await this.stripe.subscriptions.update(subscriptionId, {
      items: [{ id: subscriptionItemId, price: newPriceId }],
      metadata: {
        priceId: priceIdInDb,
      },
    });
  }

  /**
   * Convert amount to smallest currency unit based on currency
   * Most currencies use 2 decimal places (cents), but some use 0 or 3
   */
  private convertToSmallestCurrencyUnit(amount: number, currency: string): number {
    const currencyUpperCase = currency.toUpperCase();

    // Zero decimal currencies (already in smallest unit)
    const zeroDecimalCurrencies = [
      'BIF', 'CLP', 'DJF', 'GNF', 'IDR', 'JPY', 'KMF', 'KRW', 'MGA',
      'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
    ];

    // Three decimal currencies (multiply by 1000)
    const threeDecimalCurrencies = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];

    if (zeroDecimalCurrencies.includes(currencyUpperCase)) {
      return Math.round(amount);
    } else if (threeDecimalCurrencies.includes(currencyUpperCase)) {
      return Math.round(amount * 1000);
    } else {
      // Most currencies use 2 decimal places (multiply by 100)
      return Math.round(amount * 100);
    }
  }
}
