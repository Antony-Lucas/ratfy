import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDTO } from './login.response.dto';

export class LoginDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}

export class LoginTokenDto {
  access_token: string;
  refresh_token: string;
  userData: UserResponseDTO;
}
