import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from "class-validator";

export class TableContentDto {
    @ApiProperty({ example: 'Employee Directory' })
    @IsString()
    tableName: string;

    @ApiProperty({ type: [Object] })
    @IsArray()
    data: Record<string, any>[]; // You can also use TableRowDto[] if you want strict typing

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsOptional()
    ignoreFields?: string[];

    @ApiProperty({ required: false, default: false })
    @IsBoolean()
    @IsOptional()
    addToIndex?: boolean;

    @ApiProperty({ required: false, enum: ['striped', 'plain', 'grid'], default: 'striped' })
    @IsString()
    @IsIn(['striped', 'plain', 'grid'])
    @IsOptional()
    theme?: 'striped' | 'plain' | 'grid';
}