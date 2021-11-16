import { IsJWT } from 'class-validator';

export class VerifyAccessTokenRequestDto {
  @IsJWT()
  accessToken!: string;
}
