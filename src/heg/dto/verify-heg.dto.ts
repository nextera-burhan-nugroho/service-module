import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { HegRouting, HegVerifyPriceRequest } from '../heg.interface';
import { EnumHegTripType } from '../heg.enum';

export class VerifyPriceRequestDto implements HegVerifyPriceRequest {
    @ApiProperty({
        description: 'Trip type: 1 = ONE WAY, 2 = ROUND TRIP',
        enum: EnumHegTripType,
        example: EnumHegTripType.ONE_WAY,
    })
    @IsEnum(EnumHegTripType)
    tripType: EnumHegTripType;

    // @ApiProperty({
    //     description: 'Unique session id from verify routing result',
    //     example: 'abcd1234-session-id',
    // })
    // @IsString()
    // sessionId: string;

    @ApiProperty({
        description: 'Routing object returned from flight search',
        type: Object,
    })
    @IsObject()
    routing: HegRouting;

    @ApiProperty({
        description: 'Routing data string returned from verify routing',
        example: 'encrypted-data-string',
    })
    @IsString()
    data: string;

    @ApiProperty({
        description: 'Number of adult passengers',
        minimum: 1,
        maximum: 9,
        example: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(9)
    adultNum: number;

    @ApiPropertyOptional({
        description: 'Number of child passengers',
        minimum: 0,
        maximum: 9,
        example: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9)
    childNum: number;

    @ApiPropertyOptional({
        description: 'Number of infant passengers',
        minimum: 0,
        maximum: 9,
        example: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9)
    infantNum: number;
}
