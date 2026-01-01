import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.product.findMany({
      select: {
        id: true,
        type: true,
        basePrice: true,
        frontImageUrl: true,
        backImageUrl: true,
      },
      orderBy: { type: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        basePrice: true,
        frontImageUrl: true,
        backImageUrl: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findDesignsByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.design.findMany({
      where: { order: { productId } },
      select: {
        id: true,
        source: true,
        prompt: true,
        imageUrl: true,
        elements: true,
        orderId: true,
      },
    });
  }
}
