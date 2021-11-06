import { IsJWT } from 'class-validator';

export class VerifyRequestDto {
  @IsJWT()
  authToken!: string;
}
