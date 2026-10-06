import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class AssignTenantModulesDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one module code is required' })
  @IsString({ each: true })
  installedApps: string[];
}
