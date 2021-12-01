import { TokenPayload } from 'google-auth-library';

export class GoogleProfile {
  name?: string;

  constructor(googleTokenPayload: TokenPayload) {
    this.name = googleTokenPayload.name;
  }
}
