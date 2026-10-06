import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BlockTenantAdminDto {
  @IsBoolean()
  @IsNotEmpty()
  isBlocked: boolean;
}
