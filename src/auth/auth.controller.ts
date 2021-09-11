import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorators';
import { AuthRequestDto } from './dto/auth.request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() authRequestDto: AuthRequestDto
  ): Promise<AuthResponseDto> {
    const user = await this.authService.registerUser(authRequestDto);
    const token = await this.authService.generateAccessToken(user);
    return new AuthResponseDto(token);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@User() user: UserDto) {
    const token = await this.authService.generateAccessToken(user);
    return new AuthResponseDto(token);
  }
}
