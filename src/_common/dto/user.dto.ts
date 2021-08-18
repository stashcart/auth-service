import { User } from '../../users/entities/user.entity';

export class UserDto {
  id: number;

  email: string;

  constructor({ id, email }: User) {
    this.id = id;
    this.email = email;
  }
}
