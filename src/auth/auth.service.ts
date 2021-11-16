import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { classToPlain } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/users/dto/user.dto';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { addSeconds, differenceInSeconds } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterRequestDto } from './dto/register.request.dto';
import { JwtTokenPayload } from './utils/jwt-token-payload';
import { RefreshToken } from './entities/refresh-token.entity';
import { TokenPair } from './utils/token-pair';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>
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

  async generateTokenPair(userId: string): Promise<TokenPair> {
    const user = await this.usersService.findById(userId);

    const accessToken = this.generateAccessToken(new UserDto(user));
    const refreshToken = await this.generateRefreshToken(user);

    return new TokenPair(accessToken, refreshToken);
  }

  private generateAccessToken(user: UserDto): string {
    const payload = new JwtTokenPayload(user);
    return this.jwtService.sign(classToPlain(payload));
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = new RefreshToken();

    refreshToken.user = user;
    refreshToken.token = randomUUID();
    refreshToken.expiresAt = addSeconds(
      new Date(),
      +this.configService.get('REFRESH_TOKEN_EXPIRES_IN')
    );

    await this.refreshTokensRepository.save(refreshToken);

    return refreshToken.token;
  }

  async refreshTokenPair(refreshToken: string): Promise<TokenPair> {
    const oldRefreshToken = await this.refreshTokensRepository.findOne({
      token: refreshToken,
    });

    if (!oldRefreshToken) {
      throw new UnauthorizedException();
    }

    await this.refreshTokensRepository.remove(oldRefreshToken);

    if (this.isRefreshTokenExpired(oldRefreshToken.expiresAt)) {
      throw new UnauthorizedException();
    }

    return this.generateTokenPair(oldRefreshToken.userId);
  }

  private isRefreshTokenExpired(expiresAt: Date): boolean {
    return differenceInSeconds(expiresAt, new Date()) <= 0;
  }
}
