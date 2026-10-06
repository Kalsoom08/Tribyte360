import { IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;
}
