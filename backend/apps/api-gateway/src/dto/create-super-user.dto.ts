import { IsEmail, IsNotEmpty, IsString, IsArray, ArrayNotEmpty, MinLength } from 'class-validator';

export class CreateSuperUserDto {
  @IsEmail({}, { message: 'Valid email address is required' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one role name is required' })
  @IsString({ each: true })
  roles: string[]; // e.g. ["SUPER_ADMIN"] or ["MODERATOR"]
}
