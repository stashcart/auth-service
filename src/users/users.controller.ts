import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/_common/dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserDto[]> {
    const users = await this.usersService.findAll();

    return users.map((user) => new UserDto(user));
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<UserDto> {
    const user = await this.usersService.findById(id);

    return new UserDto(user);
  }
}
