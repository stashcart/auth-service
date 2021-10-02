import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: `user-${Math.floor(Math.random() * 10000)}@gmail.com`,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
