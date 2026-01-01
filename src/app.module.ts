import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { JwtGuard } from './common/guards/jwt.guard';
import { OrdersModule } from './orders/orders.module';
import { AiModule } from './ai/ai.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, OrdersModule, AiModule, UploadModule],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
