import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateAppraisalDto {
  @IsString() @IsNotEmpty() userId: string;
  @IsString() @IsNotEmpty() cycleName: string;
  @IsOptional() @IsNumber() overallRating?: number;
  @IsOptional() @IsString() feedback?: string;
  @IsOptional() @IsBoolean() promotionRecommended?: boolean;
  @IsOptional() @IsNumber() salaryIncrementAmount?: number;
  @IsOptional() @IsArray() kpis?: any[];
}
