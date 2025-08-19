import { IsInt, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsInt()
  @IsNotEmpty()
  amount: number; // in smallest currency unit (e.g. cents)

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  paymentCategory: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
