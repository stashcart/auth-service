import { User } from 'src/users/entities/user.entity';
import { UserDto } from 'src/_common/dto/user.dto';

export class JwtTokenPayload {
  sub: number;

  constructor(user: User | UserDto) {
    this.sub = user.id;
  }
}
