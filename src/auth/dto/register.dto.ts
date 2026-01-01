import { IsEmail, IsOptional, IsString, MinLength, IsIn } from 'class-validator';

export const GenderOptions = ['Female', 'Male'] as const;
export type Gender = (typeof GenderOptions)[number];

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  @IsIn(GenderOptions)
  gender?: Gender;

  @IsOptional()
  @IsString()
  phone?: string;
}
