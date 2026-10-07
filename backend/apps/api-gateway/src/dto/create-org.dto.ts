import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateDepartmentDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsOptional() @IsString() parentDepartmentId?: string;
  @IsOptional() @IsString() description?: string;
}

export class CreateDesignationDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() code: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsNumber() level?: number;
}

export class CreateBranchDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsBoolean() isHeadquarters?: boolean;
}

export class CreateCostCenterDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsOptional() @IsNumber() budgetAllocation?: number;
}
