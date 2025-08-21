import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { HegPaymentRequest } from '../heg.interface';

export class PayRequestDto implements HegPaymentRequest {
    @ApiProperty({
        description: 'Order ID',
        example: 'abcd1234-order-id',
    })
    @IsString()
    orderId: string;
}
