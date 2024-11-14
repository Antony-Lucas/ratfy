import { ApiProperty } from '@nestjs/swagger';

export class UpdatePassword {
  @ApiProperty()
  new_password: string;
  @ApiProperty()
  old_password: string;
}
