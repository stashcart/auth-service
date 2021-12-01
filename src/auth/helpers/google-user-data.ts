import { User } from 'src/users/entities/user.entity';
import { GoogleProfile } from './google-profile';

export class GoogleUserData {
  user!: User;

  googleProfile!: GoogleProfile;

  isNew!: boolean;

  constructor(user: User, googleProfile: GoogleProfile, isNew: boolean) {
    this.user = user;
    this.googleProfile = googleProfile;
    this.isNew = isNew;
  }
}
