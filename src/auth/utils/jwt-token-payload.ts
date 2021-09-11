import { User } from 'src/users/entities/user.entity';
import { UserDto } from 'src/users/dto/user.dto';

export class JwtTokenPayload {
  sub: string;

  constructor(user: User | UserDto) {
    this.sub = user.id;
  }
}
