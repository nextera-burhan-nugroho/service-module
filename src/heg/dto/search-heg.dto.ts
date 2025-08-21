import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FlightSearch, HegCabinClass, HegTripType } from '../heg.interface';

export class SearchFlightDto implements FlightSearch {
    @ApiProperty({
        enum: HegTripType,
        description: 'Trip type: 1 = ONE WAY, 2 = ROUND TRIP',
        example: HegTripType.ONE_WAY,
    })
    @IsEnum(HegTripType)
    tripType: HegTripType;

    @ApiProperty({
        description: 'Departure date (YYYY-MM-DD)',
        example: '2025-09-01',
    })
    @IsDateString()
    fromDate: string;

    @ApiPropertyOptional({
        description: 'Return date (YYYY-MM-DD) - only required if tripType = ROUND_TRIP',
        example: '2025-09-07',
    })
    @IsOptional()
    @IsDateString()
    retDate?: string;

    @ApiProperty({
        enum: HegCabinClass,
        description: 'Cabin class: Y = Economy, C = Business, F = First',
        example: HegCabinClass.ECONOMY,
    })
    @IsEnum(HegCabinClass)
    cabinClass: HegCabinClass;

    @ApiProperty({
        description: 'Number of adult passengers',
        example: 1,
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    adultNum: number;

    @ApiPropertyOptional({
        description: 'Number of child passengers',
        example: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    childNum?: number;

    @ApiPropertyOptional({
        description: 'Number of infant passengers',
        example: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    infantNum?: number;

    @ApiProperty({
        description: 'Departure city IATA code',
        example: 'CGK',
    })
    @IsString()
    fromCity: string;

    @ApiProperty({
        description: 'Destination city IATA code',
        example: 'DPS',
    })
    @IsString()
    toCity: string;
}
