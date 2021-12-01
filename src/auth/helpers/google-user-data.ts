import { User } from 'src/users/entities/user.entity';
import { GoogleProfileDto } from '../dto/google-profile.dto';

export class GoogleUserData {
  user!: User;

  googleProfile!: GoogleProfileDto;

  isNew!: boolean;

  constructor(user: User, googleProfile: GoogleProfileDto, isNew: boolean) {
    this.user = user;
    this.googleProfile = googleProfile;
    this.isNew = isNew;
  }
}
