import { IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { HegAuxiliaryCode, HegPassengerAuxiliary } from '../heg.interface';
import { EnumSsrCode } from '../heg.enum';

export class HegAuxiliaryCodeDto implements HegAuxiliaryCode {
    @IsString()
    ssrCode: EnumSsrCode;
}

export class HegPassengerAuxiliaryDto implements HegPassengerAuxiliary {
    @IsNumber()
    segmentNo: number;

    @IsNumber()
    passengerNo: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HegAuxiliaryCodeDto)
    ssrCodes: HegAuxiliaryCodeDto[];
}
