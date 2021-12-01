import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AmqpService } from 'src/amqp/amqp.service';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { ProfileDto } from './dto/profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly amqpService: AmqpService
  ) {}

  async create(user: { email: string; password?: string }): Promise<User> {
    const savedUser = await this.usersRepository.save(user);

    await this.amqpService.publish(
      'user.write',
      'user.created',
      new UserDto(savedUser)
    );

    return savedUser;
  }

  async patchUserByProfile(profileDto: ProfileDto): Promise<User> {
    const user = await this.usersRepository.findOne(profileDto.id);

    if (!user) {
      throw new NotFoundException(`User: ${profileDto.id}`);
    }

    user.email = profileDto.email;

    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ email });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User: ${id}`);
    }

    return user;
  }
}
