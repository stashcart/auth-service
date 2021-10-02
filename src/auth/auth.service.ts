import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { classToPlain } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/users/dto/user.dto';
import { RegisterRequestDto } from './dto/register.request.dto';
import { JwtTokenPayload } from './utils/jwt-token-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async registerUser({ email, password }: RegisterRequestDto): Promise<User> {
    const user = new User();

    user.email = email;
    user.password = await hash(password, 10);

    return this.usersService.create(user);
  }

  async validateAndGetUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async generateAccessToken(user: User | UserDto): Promise<string> {
    const payload = new JwtTokenPayload(user);

    return this.jwtService.sign(classToPlain(payload));
  }
}
