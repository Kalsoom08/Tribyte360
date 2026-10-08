import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { LeaveRequestStatus } from '@tribyte/common';

export class CreateLeaveTypeDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsOptional() @IsNumber() defaultDaysPerYear?: number;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsBoolean() allowCarryForward?: boolean;
  @IsOptional() @IsNumber() maxCarryForwardDays?: number;
}

export class CreateLeaveRequestDto {
  @IsString() @IsNotEmpty() leaveTypeId: string;
  @IsString() @IsNotEmpty() startDate: string;
  @IsString() @IsNotEmpty() endDate: string;
  @IsString() @IsNotEmpty() reason: string;
}

export class UpdateLeaveRequestStatusDto {
  @IsEnum(LeaveRequestStatus) @IsNotEmpty() status: LeaveRequestStatus;
  @IsOptional() @IsString() rejectionReason?: string;
}
