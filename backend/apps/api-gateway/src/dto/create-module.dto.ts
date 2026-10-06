import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty({ message: 'Module name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Module code is required' })
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
