import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { HegSsrRequest } from '../heg.interface';

export class GetSsrRequestDto implements HegSsrRequest {
    @ApiProperty({
        description: 'Session ID from search or booking result',
        example: 'abcd1234-session-id',
    })
    @IsString()
    sessionId: string;

    @ApiPropertyOptional({
        description: 'SSR type: 0 = Baggage, 1 = Seat. Default is 0',
        example: 0,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1)
    type?: number = 0;

    @ApiPropertyOptional({
        description: 'Data string from search/verify. Required for pre-sale',
        example: 'encrypted-data-string',
    })
    @IsOptional()
    @IsString()
    data?: string;

    @ApiPropertyOptional({
        description: 'Order ID. Required for after-sale SSR query',
        example: 'ORD123456',
    })
    @IsOptional()
    @IsString()
    orderId?: string;
}
