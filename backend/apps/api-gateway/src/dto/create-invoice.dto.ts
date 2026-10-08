import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceLineItemDto {
  @IsString() @IsNotEmpty() description: string;
  @IsNumber() quantity: number;
  @IsNumber() unitPrice: number;
}

export class CreateCustomerInvoiceDto {
  @IsString() @IsNotEmpty() customerName: string;
  @IsString() @IsNotEmpty() customerEmail: string;
  @IsOptional() @IsString() invoiceNumber?: string;
  @IsOptional() @IsString() invoiceDate?: string;
  @IsOptional() @IsString() dueDate?: string;
  @IsOptional() @IsNumber() taxAmount?: number;
  @IsOptional() @IsString() notes?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  items: InvoiceLineItemDto[];
}

export class RecordInvoicePaymentDto {
  @IsNumber() @IsNotEmpty() amount: number;
}
