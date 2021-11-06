import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorators';
import { RegisterRequestDto } from './dto/register.request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginRequestDto } from './dto/login.request.dto';
import { VerifyRequestDto } from './dto/verify.request.dto';

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
  ): Promise<AuthResponseDto> {
    const user = await this.authService.registerUser(registerRequestDto);
    const token = await this.authService.generateAccessToken(user);
    return new AuthResponseDto(token);
  }

  @ApiBody({ type: LoginRequestDto })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@User() user: UserDto) {
    const token = await this.authService.generateAccessToken(user);
    return new AuthResponseDto(token);
  }

  @Post('verify')
  verify(@Body() verifyRequestDto: VerifyRequestDto) {
    const payload = this.jwtService.verify(verifyRequestDto.authToken);
    return payload.sub;
  }
}
