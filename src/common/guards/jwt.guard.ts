import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UNAUTHORIZED_KEY } from '../decorators/unauthorized.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUnauthorized = this.reflector.getAllAndOverride<boolean>(UNAUTHORIZED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isUnauthorized) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Missing token');
    }

    const token = authHeader.substring(7);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'change-me-access',
        ignoreExpiration: true,
      });
      const userId = payload?.sub as string | undefined;
      if (!userId) throw new ForbiddenException('Invalid token payload');

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ForbiddenException('User not found');

      request.user = { id: user.id, email: user.email };
      return true;
    } catch (err) {
      throw new ForbiddenException('Invalid token');
    }
  }
}
