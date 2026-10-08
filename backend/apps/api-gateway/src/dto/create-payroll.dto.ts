import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ComponentType } from '@tribyte/common';

export class CreateSalaryComponentDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsEnum(ComponentType) @IsNotEmpty() type: ComponentType;
  @IsOptional() @IsNumber() defaultAmount?: number;
}

export class GeneratePayrollDto {
  @IsNumber() @IsNotEmpty() month: number;
  @IsNumber() @IsNotEmpty() year: number;
}
