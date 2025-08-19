import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: '12345', description: 'Internal user ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'cus_ABC123', description: 'Stripe customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: 'pm_ABC123',
    description: 'Stripe payment method ID',
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    example: 'card',
    description: 'Payment category (e.g., card, bank_transfer)',
  })
  @IsString()
  paymentCategroy: string;

  @ApiProperty({
    example: 'price_ABC123',
    description: 'Stripe price ID for subscription',
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({
    example: 'usd',
    description: 'Currency code (e.g., usd, eur)',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;
}


export class SubscribeUserDto {
  userId: string;
  email: string;
  productIdInDb: string;
  productName: string;
  priceIdInDb: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  subscriptionIdInDb: string;
}