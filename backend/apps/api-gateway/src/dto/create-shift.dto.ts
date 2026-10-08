import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateShiftDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() endTime?: string;
  @IsOptional() @IsNumber() breakDurationMinutes?: number;
  @IsOptional() @IsNumber() gracePeriodMinutes?: number;
}
