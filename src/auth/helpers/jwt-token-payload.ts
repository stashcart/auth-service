import { UserDto } from 'src/users/dto/user.dto';

export class JwtTokenPayload {
  sub: string;

  constructor(user: UserDto) {
    this.sub = user.id;
  }
}
