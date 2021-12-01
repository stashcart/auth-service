import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorators';
import { GoogleAuthRequestDto } from './dto/google-auth.request.dto';
import { LoginRequestDto } from './dto/login.request.dto';
import { RefreshTokenPairRequestDto } from './dto/refresh-token-pair.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { VerifyAccessTokenRequestDto } from './dto/verify-access-token.request.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  async register(
    @Body() registerRequestDto: RegisterRequestDto
  ): Promise<TokenPairDto> {
    const user = await this.authService.registerUser(registerRequestDto);
    return this.authService.generateTokenPairFromUser(user);
  }

  @ApiBody({ type: LoginRequestDto })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@User() user: UserDto): Promise<TokenPairDto> {
    return this.authService.generateTokenPairFromUserId(user.id);
  }

  @Post('verify')
  verifyAccessToken(
    @Body() verifyAccessTokenRequestDto: VerifyAccessTokenRequestDto
  ): Promise<string> {
    const payload = this.jwtService.verify(
      verifyAccessTokenRequestDto.accessToken
    );
    return payload.sub;
  }

  @Post('refresh')
  refreshTokenPair(
    @Body() { refreshToken }: RefreshTokenPairRequestDto
  ): Promise<TokenPairDto> {
    return this.authService.refreshTokenPair(refreshToken);
  }

  @Post('google')
  async authWithGoogle(
    @Body() { idToken }: GoogleAuthRequestDto
  ): Promise<TokenPairDto> {
    const user = await this.authService.findOrCreateGoogleUser(idToken);
    return this.authService.generateTokenPairFromUser(user);
  }
}
