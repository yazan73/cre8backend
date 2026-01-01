import { IsOptional, IsString } from 'class-validator';

export class ConfirmOrderDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  frontSnapshotUrl?: string;

  @IsOptional()
  @IsString()
  backSnapshotUrl?: string;
}
