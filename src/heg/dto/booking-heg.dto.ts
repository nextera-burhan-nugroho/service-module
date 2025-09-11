import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HegPassengerDto } from './passenger.dto';
import { HegContactDto } from './contact.dto';
import { HegPassengerAuxiliaryDto } from './passenger-auxiliary.dto';
import { EnumHegTripType } from '../heg.enum';
import { HegBookingRequest } from '../heg.interface';

export class BookingRequestDto implements HegBookingRequest {
    @IsEnum(EnumHegTripType)
    tripType: EnumHegTripType;

    @IsString()
    sessionId: string;

    @IsString()
    data: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HegPassengerDto)
    passengers: HegPassengerDto[];

    @ValidateNested()
    @Type(() => HegContactDto)
    contact: HegContactDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HegPassengerAuxiliaryDto)
    passengerAuxiliaries?: HegPassengerAuxiliaryDto[];
}
