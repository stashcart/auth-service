import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { OAuth2Client } from 'google-auth-library';
import { RegisterRequestDto } from './dto/register.request.dto';
import { JwtTokenPayload } from './helpers/jwt-token-payload';
import { RefreshToken } from './entities/refresh-token.entity';
import { TokenPair } from './helpers/token-pair';
import { GoogleUserData } from './helpers/google-user-data';
import { GoogleProfile } from './helpers/google-profile';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly googleOauthClient: OAuth2Client
  ) {}

  async registerUser({ email, password }: RegisterRequestDto): Promise<User> {
    const user = new User();

    user.email = email;
    user.password = await hash(password, 10);

    return this.usersService.createAndPublish(user);
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

  async generateTokenPairFromUserId(userId: string): Promise<TokenPair> {
    const user = await this.usersService.findById(userId);
    return this.generateTokenPairFromUser(user);
  }

  async generateTokenPairFromUser(user: User): Promise<TokenPair> {
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

  async findOrCreateGoogleUser(idToken: string): Promise<GoogleUserData> {
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
    const googleProfile = new GoogleProfile(googleTokenPayload);

    if (user) {
      return new GoogleUserData(user, googleProfile, false);
    }

    const createdUser = await this.usersService.create({ email });

    return new GoogleUserData(createdUser, googleProfile, true);
  }
}
