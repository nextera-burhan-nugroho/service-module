import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HegBookingRequest, HegTripType } from '../heg.interface';
import { HegPassengerDto } from './passenger.dto';
import { HegContactDto } from './contact.dto';
import { HegPassengerAuxiliaryDto } from './passenger-auxiliary.dto';

export class BookingRequestDto implements HegBookingRequest {
    @ApiProperty({ enum: HegTripType })
    @IsEnum(HegTripType)
    tripType: HegTripType;

    @ApiProperty()
    @IsString()
    sessionId: string;

    @ApiProperty()
    @IsString()
    data: string;

    @ApiProperty({ type: [HegPassengerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HegPassengerDto)
    passengers: HegPassengerDto[];

    @ApiProperty({ type: HegContactDto })
    @ValidateNested()
    @Type(() => HegContactDto)
    contact: HegContactDto;

    @ApiPropertyOptional({ type: [HegPassengerAuxiliaryDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HegPassengerAuxiliaryDto)
    passengerAuxiliaries?: HegPassengerAuxiliaryDto[];
}
