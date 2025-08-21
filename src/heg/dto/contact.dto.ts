import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { HegContact } from '../heg.interface';

export class HegContactDto implements HegContact {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsString()
    mobile: string;
}
