import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaxDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsNumber() @IsNotEmpty() ratePercentage: number;
  @IsOptional() @IsBoolean() isWithholding?: boolean;
}
