import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { HegQueryOrderRequest } from '../heg.interface';

export class QueryOrderRequestDto implements HegQueryOrderRequest {
    @ApiProperty({
        description: 'Order ID to query',
        example: 'abcd1234-order-id',
    })
    @IsString()
    orderId: string;
}
