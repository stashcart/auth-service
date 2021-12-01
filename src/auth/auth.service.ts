import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { classToPlain } from 'class-transformer';
import { randomUUID } from 'crypto';
import { addSeconds, differenceInSeconds } from 'date-fns';
import { OAuth2Client } from 'google-auth-library';
import { AmqpService } from 'src/amqp/amqp.service';
import { UserDto } from 'src/users/dto/user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { GoogleProfileDto } from './dto/google-profile.dto';
import { OauthUserDto } from './dto/oauth-user.dto';
import { RegisterRequestDto } from './dto/register.request.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtTokenPayload } from './helpers/jwt-token-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly googleOauthClient: OAuth2Client,
    private readonly amqpService: AmqpService
  ) {}

  async registerUser({ email, password }: RegisterRequestDto): Promise<User> {
    const user = new User();

    user.email = email;
    user.password = await hash(password, 10);

    const createdUser = await this.usersService.create(user);

    await this.amqpService.publish(
      'user',
      'user.created',
      new OauthUserDto({ user: createdUser })
    );

    return createdUser;
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

  async generateTokenPairFromUserId(userId: string): Promise<TokenPairDto> {
    const user = await this.usersService.findById(userId);
    return this.generateTokenPairFromUser(user);
  }

  async generateTokenPairFromUser(user: User): Promise<TokenPairDto> {
    const accessToken = this.generateAccessToken(new UserDto(user));
    const refreshToken = await this.generateRefreshToken(user);

    return new TokenPairDto(accessToken, refreshToken);
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

  async refreshTokenPair(refreshToken: string): Promise<TokenPairDto> {
    const oldRefreshToken = await this.refreshTokensRepository.findOne(
      {
        token: refreshToken,
      },
      { relations: ['user'] }
    );

    if (!oldRefreshToken) {
      throw new UnauthorizedException();
    }

    await this.refreshTokensRepository.remove(oldRefreshToken);

    if (this.isRefreshTokenExpired(oldRefreshToken.expiresAt)) {
      throw new UnauthorizedException();
    }

    return this.generateTokenPairFromUser(oldRefreshToken.user);
  }

  private isRefreshTokenExpired(expiresAt: Date): boolean {
    return differenceInSeconds(expiresAt, new Date()) <= 0;
  }

  async findOrCreateGoogleUser(idToken: string): Promise<User> {
    const googleLoginTicket = await this.googleOauthClient
      .verifyIdToken({
        idToken,
      })
      .catch(() => {
        throw new BadRequestException('Error during verification of idToken');
      });

    const googleTokenPayload = googleLoginTicket?.getPayload();
    if (!googleTokenPayload) {
      throw new BadRequestException('Error during reading google payload');
    }

    const email = googleTokenPayload?.email;
    if (!email) {
      throw new BadRequestException("User doesn't have an email");
    }

    const user = await this.usersService.findOneByEmail(email);
    const googleProfile = new GoogleProfileDto(googleTokenPayload);

    if (user) {
      return user;
    }

    const createdUser = await this.usersService.create({ email });

    await this.amqpService.publish(
      'user',
      'user.created',
      new OauthUserDto({ user: createdUser, googleProfile })
    );

    return createdUser;
  }
}
