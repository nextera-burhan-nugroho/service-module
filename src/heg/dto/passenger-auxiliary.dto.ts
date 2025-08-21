import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { HegAuxiliaryCode, HegPassengerAuxiliary } from '../heg.interface';

export class HegAuxiliaryCodeDto implements HegAuxiliaryCode {
    @ApiProperty()
    @IsString()
    ssrCode: string;
}

export class HegPassengerAuxiliaryDto implements HegPassengerAuxiliary {
    @ApiProperty()
    @IsNumber()
    segmentNo: number;

    @ApiProperty()
    @IsNumber()
    passengerNo: number;

    @ApiProperty({ type: [HegAuxiliaryCodeDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HegAuxiliaryCodeDto)
    ssrCodes: HegAuxiliaryCodeDto[];
}
