import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ArrayNotEmpty, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseStatus } from '@tribyte/common';

export class BillItemDto {
  @IsString() @IsNotEmpty() description: string;
  @IsNumber() quantity: number;
  @IsNumber() unitPrice: number;
}

export class CreateSupplierBillDto {
  @IsString() @IsNotEmpty() vendorName: string;
  @IsOptional() @IsString() vendorEmail?: string;
  @IsOptional() @IsString() billNumber?: string;
  @IsOptional() @IsString() billDate?: string;
  @IsOptional() @IsString() dueDate?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];
}

export class CreateExpenseClaimDto {
  @IsString() @IsNotEmpty() category: string;
  @IsNumber() @IsNotEmpty() amount: number;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsString() receiptUrl?: string;
}

export class ApproveExpenseClaimDto {
  @IsEnum(ExpenseStatus) @IsNotEmpty() status: ExpenseStatus;
  @IsOptional() @IsString() rejectionReason?: string;
}
