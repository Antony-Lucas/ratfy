import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return user;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findByEmail(email: string): Promise<CreateUserDto> | null {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const updateUser: UpdateUserDto = { ...updateUserDto };

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, NOT: { id } },
      });

      if (existingUser) {
        throw new BadRequestException('Este endereço de email já está em uso');
      }
    }

    if (updateUserDto.password) {
      updateUser.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete updateUser.password;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUser,
    });

    return user;
  }

  async remove(id: number) {
    const user = this.prisma.user.delete({
      where: { id },
    });
    return user;
  }
}
