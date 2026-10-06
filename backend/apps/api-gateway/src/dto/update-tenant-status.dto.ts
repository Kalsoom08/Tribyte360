import { IsEnum, IsNotEmpty } from 'class-validator';
import { TenantStatus } from '@tribyte/common';

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatus, { message: 'Invalid tenant status' })
  @IsNotEmpty()
  status: TenantStatus;
}
