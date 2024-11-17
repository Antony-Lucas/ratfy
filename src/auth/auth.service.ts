import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto, LoginTokenDto } from './dto/login.dto';
import { UserResponseDTO } from './dto/login.response.dto';
import { RefreshTokenDto } from './dto/refresh.token.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async checkAuth(userId: number) {
    return this.userService.findOne(userId);
  }

  async register(user: CreateUserDto): Promise<{ refresh_token: string }> {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('Este Email já esta associado a uma conta');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = {
      ...user,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.userService.create(newUser);
    return this.login({ email: user.email, password: user.password });
  }

  async login(loginDto: LoginDto): Promise<LoginTokenDto> {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user.id };
    const acessToken = this.jwtService.sign(payload, { expiresIn: '10m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const userResponse: UserResponseDTO = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    await this.storeRefreshToken(refreshToken, user.id);
    return {
      access_token: acessToken,
      refresh_token: refreshToken,
      userData: userResponse,
    };
  }

  async logout(refreshToken: RefreshTokenDto) {
    await this.prisma.refreshToken.delete({
      where: { token: refreshToken.refresh_token },
    });
  }

  async storeRefreshToken(token: string, userId: number) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    await this.prisma.refreshToken.upsert({
      where: { userId },
      update: {
        token,
        expiresAt: expirationDate,
      },
      create: {
        token,
        userId,
        expiresAt: expirationDate,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(
        'Não encontramos uma conta associada a esse endereço de email',
      );
    }
    const isAuth: boolean = bcrypt.compareSync(password, user.password);
    if (!isAuth) {
      throw new BadRequestException('Senha incorreta');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou senha inválido(s)');
    }
    return user;
  }

  async refreshToken(
    oldRefreshToken: RefreshTokenDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const refresToken = await this.prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken.refresh_token },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: refresToken.userId },
    });
    const payload = { email: user.email, sub: user.id };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    if (!refresToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    if (refresToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirou');
    }
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    await this.prisma.refreshToken.update({
      where: { token: oldRefreshToken.refresh_token },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token: newAccessToken, refresh_token: newAccessToken };
  }
}
