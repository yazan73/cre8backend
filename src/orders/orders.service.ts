import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AiService } from '../ai/ai.service';
import { UploadService } from '../upload/upload.service';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { ImageSize } from '../ai/image-size.enum';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private uploadService: UploadService,
  ) {}

  async create(userId: string, dto: CreateOrderDto, file?: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    let imageUrl: string | undefined;
    let source: 'ai' | 'upload';
    let prompt: string | undefined = dto.prompt;

    if (dto.prompt) {
      source = 'ai';
      const generated = await this.aiService.generateImage(dto.prompt, dto?.size ?? ImageSize.S1024);
      imageUrl = await this.uploadService.saveDesign({
        buffer: generated?.buffer as any,
        originalname: generated?.filename,
      });
    } else if (file) {
      source = 'upload';
      imageUrl = await this.uploadService.saveDesign(file);
    } else {
      throw new BadRequestException('Provide a prompt or upload a file');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          productId: product.id,
          totalAmount: product.basePrice,
        },
      });

      await tx.design.create({
        data: {
          source,
          prompt,
          imageUrl: imageUrl || '',
          elements: {},
          orderId: order.id,
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          designs: true,
          product: true,
        },
      });
    });
  }

  async findDesignsByOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { designs: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Not allowed');
    return order.designs;
  }

  async confirm(
    userId: string,
    orderId: string,
    dto: ConfirmOrderDto,
    files?: {
      frontSnapshot?: Express.Multer.File[];
      backSnapshot?: Express.Multer.File[];
      designFiles?: Express.Multer.File[];
      textFiles?: Express.Multer.File[];
    },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Not allowed');

    const frontFile = files?.frontSnapshot?.[0];
    const backFile = files?.backSnapshot?.[0];
    const designFiles = files?.designFiles || [];
    const textFiles = files?.textFiles || [];

    const [frontUrl, backUrl] = await Promise.all([
      frontFile ? this.uploadService.saveDesign(frontFile) : dto.frontSnapshotUrl,
      backFile ? this.uploadService.saveDesign(backFile) : dto.backSnapshotUrl,
    ]);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'pending',
          phoneNumber: dto.phoneNumber ?? order.phoneNumber,
          size: dto.size ?? order.size,
          color: dto.color ?? order.color,
        },
        include: {
          designs: true,
          product: true,
        },
      });

      const finalImagesCreate = [];
      if (frontUrl) {
        finalImagesCreate.push(
          tx.finalOrderImage.create({
            data: { orderId, side: 'front', imageUrl: frontUrl },
          }),
        );
      }
      if (backUrl) {
        finalImagesCreate.push(
          tx.finalOrderImage.create({
            data: { orderId, side: 'back', imageUrl: backUrl },
          }),
        );
      }
      if (finalImagesCreate.length) {
        await Promise.all(finalImagesCreate);
      }

      // Persist additional uploaded designs/text assets as design records
      const extraFiles = [...designFiles, ...textFiles];
      if (extraFiles.length) {
        const urls = await Promise.all(extraFiles.map((file) => this.uploadService.saveDesign(file)));
        await Promise.all(
          urls.map((url) =>
            tx.design.create({
              data: {
                source: 'upload',
                prompt: null,
                imageUrl: url,
                elements: {},
                orderId,
              },
            }),
          ),
        );
      }

      return updated;
    });
  }
}
