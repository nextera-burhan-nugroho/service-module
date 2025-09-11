import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { HegPassenger } from '../heg.interface';
import { EnumHegGender, EnumHegPassengerType } from '../heg.enum';

export class HegPassengerDto implements HegPassenger {
    @ApiProperty({ enum: EnumHegPassengerType })
    @IsEnum(EnumHegPassengerType)
    passengerType: EnumHegPassengerType;

    @ApiProperty({ enum: EnumHegGender })
    @IsEnum(EnumHegGender)
    gender: EnumHegGender;

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
