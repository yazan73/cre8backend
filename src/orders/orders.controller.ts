import {
  Body,
  Controller,
  Post,
  Param,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import type { Express } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { OrdersService } from './orders.service';

const allowedExt = /jpeg|jpg|png|webp|svg/;
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const extOk = allowedExt.test(extname(file.originalname || '').toLowerCase());
  const mimeOk = allowedExt.test((file.mimetype || '').toLowerCase());
  if (extOk && mimeOk) return cb(null, true);
  return cb(new BadRequestException('Invalid file type'), false);
};

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create-order')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createOrder(
    @Req() req: any,
    @Body() dto: CreateOrderDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.ordersService.create(req.user.id, dto, file);
  }

  @Get(':id/designs')
  async getDesigns(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.findDesignsByOrder(req.user.id, id);
  }

  @Post(':id/confirm')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontSnapshot', maxCount: 1 },
        { name: 'backSnapshot', maxCount: 1 },
        { name: 'designFiles', maxCount: 10 },
        { name: 'textFiles', maxCount: 20 },
      ],
      {
        storage: multer.memoryStorage(),
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 },
      },
    ),
  )
  async confirmOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ConfirmOrderDto,
  ) {
    const files = (req as any).files as
      | {
          frontSnapshot?: Express.Multer.File[];
          backSnapshot?: Express.Multer.File[];
          designFiles?: Express.Multer.File[];
          textFiles?: Express.Multer.File[];
        }
      | undefined;
    return this.ordersService.confirm(req.user.id, id, dto, files);
  }
}
