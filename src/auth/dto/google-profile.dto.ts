import { TokenPayload } from 'google-auth-library';

export class GoogleProfileDto {
  name?: string;

  constructor(googleTokenPayload: TokenPayload) {
    this.name = googleTokenPayload.name;
  }
}
