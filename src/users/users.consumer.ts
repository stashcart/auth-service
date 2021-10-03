import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { UsersService } from './users.service';

@Injectable()
export class UsersConsumer {
  constructor(private readonly usersService: UsersService) {}

  @RabbitSubscribe({
    exchange: 'profile',
    routingKey: 'profile.updated',
    queue: 'profile.updated.auth-service',
  })
  patchUserByProfile(profileDto: ProfileDto) {
    this.usersService.patchUserByProfile(profileDto);
  }
}
