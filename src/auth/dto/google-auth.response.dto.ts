import { UserDto } from 'src/users/dto/user.dto';
import { GoogleProfileDto } from './google-profile.dto';
import { GoogleUserData } from '../helpers/google-user-data';
import { TokenPairDto } from './token-pair.dto';

export class GoogleAuthResponseDto {
  user!: UserDto;

  googleProfile!: GoogleProfileDto;

  isNew!: boolean;

  tokenPair!: TokenPairDto;

  constructor(googleUserData: GoogleUserData, tokenPair: TokenPairDto) {
    this.user = new UserDto(googleUserData.user);
    this.googleProfile = googleUserData.googleProfile;
    this.isNew = googleUserData.isNew;
    this.tokenPair = tokenPair;
  }
}
