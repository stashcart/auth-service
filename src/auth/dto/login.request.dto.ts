import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
