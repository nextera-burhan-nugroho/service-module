import {
  Body,
  Controller,
  Post,
  Headers,
  Req,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto, SubscribeUserDto } from './dto/subscription.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import type { Request } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

export type RawBodyRequest<T = Request> = T & {
  rawBody?: Buffer;
};

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /** ==================== ONE-TIME PAYMENT ==================== */
  @Post('payment-intent')
  @ApiOperation({ summary: 'Create a one-time payment intent' })
  @ApiBody({ type: CreatePaymentIntentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    const {amount, currency, paymentCategory, paymentId, description, userId} = dto
    return this.stripeService.createPaymentIntent(amount,currency, {
      paymentId, paymentCategory, userId
    }, description);
  }

  @Post('subscribe-user-flow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Subscribe user with auto-creation of customer, product, and price',
    description: 'Checks if customer, product, and price exist in Stripe. Creates them if not, then subscribes the user.'
  })
  @ApiBody({ type: SubscribeUserDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription flow completed successfully',
  })
  async subscribeUserFlow(@Body() dto: SubscribeUserDto) {
    return this.stripeService.createUserSubscription(
      dto.userId,
      dto.email,
      dto.productIdInDb,
      dto.productName,
      dto.priceIdInDb,
      dto.amount,
      dto.currency,
      dto.interval,
      dto.subscriptionIdInDb,
    );
  }

  @Post('subscribe-advance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Subscribe user with auto-creation of customer, product, and price',
    description: 'Checks if customer, product, and price exist in Stripe. Creates them if not, then subscribes the user.'
  })
  @ApiBody({ type: SubscribeUserDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription flow completed successfully',
  })
  async subscribeAdvance(@Body() dto: SubscribeUserDto) {
    return this.stripeService.createUserSubscription(
      dto.userId,
      dto.email,
      dto.productIdInDb,
      dto.productName,
      dto.priceIdInDb,
      dto.amount,
      dto.currency,
      dto.interval,
      dto.subscriptionIdInDb,
      'default'
    );
  }

  @Post('subscribe-embedded-component')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Subscribe user with auto-creation of customer, product, and price',
    description: 'Checks if customer, product, and price exist in Stripe. Creates them if not, then subscribes the user.'
  })
  @ApiBody({ type: SubscribeUserDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription flow completed successfully',
  })
  async subscribeComponent(@Body() dto: SubscribeUserDto) {
    return this.stripeService.createUserSubscription(
      dto.userId,
      dto.email,
      dto.productIdInDb,
      dto.productName,
      dto.priceIdInDb,
      dto.amount,
      dto.currency,
      dto.interval,
      dto.subscriptionIdInDb,
      'embedded_component'
    );
  }
 
  @Post('subscribe-embeded-form')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Subscribe user with auto-creation of customer, product, and price',
    description: 'Checks if customer, product, and price exist in Stripe. Creates them if not, then subscribes the user.'
  })
  @ApiBody({ type: SubscribeUserDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription flow completed successfully',
  })
  async subscribeForm(@Body() dto: SubscribeUserDto) {
    return this.stripeService.createUserSubscription(
      dto.userId,
      dto.email,
      dto.productIdInDb,
      dto.productName,
      dto.priceIdInDb,
      dto.amount,
      dto.currency,
      dto.interval,
      dto.subscriptionIdInDb,
      'embedded'
    );
  }

  @Post('unsubscribe/:subscribeId')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiParam({name: "subscribeId", required:true, type: String})
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  cancelSubscription(@Param('subscribeId') subscribeId: string) {
    return this.stripeService.unsubscribe(subscribeId);
  }

  /** ==================== WEBHOOK ==================== */
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async webhook(
    @Headers('Stripe-Signature') signature: string,
    @Req() body: RawBodyRequest<Request>,
  ) {
    if (!body.rawBody) {
      throw new Error(
        'Raw body is missing. Make sure raw-body parser is applied.',
      );
    }
    return this.stripeService.handleWebhook(signature, body.rawBody);
  }
}
