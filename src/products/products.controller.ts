import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Unauthorized } from '../common/decorators/unauthorized.decorator';

@Unauthorized()
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/designs')
  findDesignsForProduct(@Param('id') productId: string) {
    return this.productsService.findDesignsByProduct(productId);
  }
}
