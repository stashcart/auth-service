import { UserDto } from 'src/users/dto/user.dto';
import { GoogleProfile } from '../helpers/google-profile';
import { GoogleUserData } from '../helpers/google-user-data';
import { TokenPair } from '../helpers/token-pair';

export class GoogleAuthResponseDto {
  user!: UserDto;

  googleProfile!: GoogleProfile;

  isNew!: boolean;

  tokenPair!: TokenPair;

  constructor(googleUserData: GoogleUserData, tokenPair: TokenPair) {
    this.user = new UserDto(googleUserData.user);
    this.googleProfile = googleUserData.googleProfile;
    this.isNew = googleUserData.isNew;
    this.tokenPair = tokenPair;
  }
}
