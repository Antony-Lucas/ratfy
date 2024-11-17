import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService, PrismaService, UserService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const loginResult = await service.login({
        email: 'antony',
        password: 'antony',
      });

      expect(loginResult).toHaveProperty('acces_token');
    });
  });

  describe('register', () => {
    it.only('should create a new user in database with authentication and return access a refresh token', async () => {});
  });
});
