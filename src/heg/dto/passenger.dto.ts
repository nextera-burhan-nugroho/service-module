import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { HegGender, HegPassenger, HegPassengerType } from '../heg.interface';

export class HegPassengerDto implements HegPassenger {
    @ApiProperty({ enum: HegPassengerType })
    @IsEnum(HegPassengerType)
    passengerType: HegPassengerType;

    @ApiProperty({ enum: HegGender })
    @IsEnum(HegGender)
    gender: HegGender;

    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;

    @ApiProperty()
    @IsDateString()
    dateOfBirth: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    passportNo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dateOfExpiry?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nationality?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cardIssuePlace?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mobile?: string;
}
