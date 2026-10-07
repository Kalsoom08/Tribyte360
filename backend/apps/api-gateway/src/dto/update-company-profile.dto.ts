import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() country?: string;
}

export class UpdateCompanyProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @IsOptional() @IsString() taxId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) workingDays?: string[];
  @IsOptional() @IsString() workStartTime?: string;
  @IsOptional() @IsString() workEndTime?: string;
  @IsOptional() @IsString() fiscalYearStartMonth?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() defaultLanguage?: string;
}
