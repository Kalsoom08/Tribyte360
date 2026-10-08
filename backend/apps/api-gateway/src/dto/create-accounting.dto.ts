import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountCategory, JournalSource } from '@tribyte/common';

export class CreateGlAccountDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEnum(AccountCategory) @IsNotEmpty() category: AccountCategory;
  @IsOptional() @IsNumber() initialBalance?: number;
  @IsOptional() @IsString() costCenterId?: string;
}

export class JournalLineDto {
  @IsString() @IsNotEmpty() glAccountId: string;
  @IsNumber() debit: number;
  @IsNumber() credit: number;
  @IsOptional() @IsString() description?: string;
}

export class CreateJournalEntryDto {
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsString() entryNumber?: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsEnum(JournalSource) source?: JournalSource;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];
}
