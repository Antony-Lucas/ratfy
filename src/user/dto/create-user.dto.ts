import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  id: number;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  fullname: string;
  @ApiProperty()
  position: string;
  @ApiProperty()
  department: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
