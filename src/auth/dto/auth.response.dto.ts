export class AuthResponseDto {
  authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }
}
