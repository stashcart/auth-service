import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: `user-${Math.floor(Math.random() * 10000)}@gmail.com`,
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'user' })
  password: string;
}
