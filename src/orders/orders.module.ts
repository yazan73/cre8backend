import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AiModule } from '../ai/ai.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [AiModule, UploadModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
