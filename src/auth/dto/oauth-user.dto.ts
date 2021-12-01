import { UserDto } from 'src/users/dto/user.dto';
import { User } from 'src/users/entities/user.entity';
import { GoogleProfileDto } from './google-profile.dto';

export class OauthUserDto extends UserDto {
  name?: string;

  constructor({
    user,
    googleProfile,
  }: {
    user: User;
    googleProfile?: GoogleProfileDto;
  }) {
    super(user);

    if (googleProfile) {
      this.name = googleProfile.name;
    }
  }
}
