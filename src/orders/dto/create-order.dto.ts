import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageSize } from '../../ai/image-size.enum';

export class CreateOrderDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(ImageSize)
  size?: ImageSize;
}
