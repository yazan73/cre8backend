import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        gender: dto.gender,
        phone: dto.phone,
      },
      select: { id: true, email: true, name: true, gender: true, phone: true },
    });

    const tokens = await this.generateTokens(user.id);
    return { user, ...tokens };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = await this.generateTokens(user.id);
    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  private async generateTokens(userId: string) {
    const accessToken = await this.jwtService.signAsync({ sub: userId });
    const refreshToken = await this.jwtService.signAsync({ sub: userId, type: 'refresh' });
    return { accessToken, refreshToken };
  }
}
