import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ContractType, EmploymentStatus } from '@tribyte/common';

export class CreateEmployeeDto {
  @IsEmail() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() fullName: string;
  @IsOptional() @IsString() employeeCode?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() designationId?: string;
  @IsOptional() @IsString() branchId?: string;
  @IsOptional() @IsString() costCenterId?: string;
  @IsOptional() @IsString() phone?: string;

  // Contract Details
  @IsOptional() @IsEnum(ContractType) contractType?: ContractType;
  @IsOptional() @IsNumber() baseSalary?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() probationDays?: number;
  @IsOptional() @IsNumber() noticePeriodDays?: number;

  // Personal Info & Documents
  @IsOptional() @IsString() dateOfBirth?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() maritalStatus?: string;
  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsString() joiningDate?: string;
  @IsOptional() @IsArray() documents?: any[];
  @IsOptional() @IsString() emergencyContactName?: string;
  @IsOptional() @IsString() emergencyContactPhone?: string;
  @IsOptional() @IsString() emergencyContactRelation?: string;
}

export class UpdateEmployeeStatusDto {
  @IsEnum(EmploymentStatus) @IsNotEmpty() status: EmploymentStatus;
  @IsOptional() @IsString() exitReason?: string;
}
