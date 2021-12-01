import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileDto } from './dto/profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  create(user: { email: string; password?: string }): Promise<User> {
    return this.usersRepository.save(user);
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
