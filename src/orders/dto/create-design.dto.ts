import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageSize } from '../../ai/image-size.enum';

export class CreateDesignDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsEnum(ImageSize)
  size?: ImageSize;
}
