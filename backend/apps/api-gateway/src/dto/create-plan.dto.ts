import { IsNotEmpty, IsString, IsNumber, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Plan name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Plan code is required' })
  code: string;

  @IsNumber()
  maxUsers: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one allowed module is required' })
  allowedModules: string[];

  @IsOptional()
  @IsNumber()
  priceMonthly?: number;

  @IsOptional()
  @IsNumber()
  trialDays?: number;
}
