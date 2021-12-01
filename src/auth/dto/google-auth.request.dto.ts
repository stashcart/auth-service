import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthRequestDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
