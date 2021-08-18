import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from '../_common/dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly amqpConnection: AmqpConnection
  ) {}

  async create(user: User): Promise<User> {
    const savedUser = await this.usersRepository.save(user);

    await this.amqpConnection.publish(
      'user',
      'user.created.*',
      new UserDto(savedUser)
    );

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ email });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne(id);
  }
}
