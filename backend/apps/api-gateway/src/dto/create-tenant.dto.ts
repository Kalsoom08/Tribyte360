import { IsEmail, IsNotEmpty, IsString, IsOptional, ArrayNotEmpty, IsArray, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Subdomain slug is required' })
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must contain only lowercase letters, numbers, and hyphens' })
  slug: string;

  @IsEmail({}, { message: 'Valid owner email is required' })
  @IsNotEmpty()
  ownerEmail: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsArray()
  installedApps?: string[];
}
