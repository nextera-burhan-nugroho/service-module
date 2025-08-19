import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '12345', description: 'Your internal user ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
