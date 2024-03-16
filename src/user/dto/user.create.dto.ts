import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserCreateDTO {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
  @IsOptional()
  @IsDateString()
  birthAt: string;
  @IsOptional()
  role: number;
}
