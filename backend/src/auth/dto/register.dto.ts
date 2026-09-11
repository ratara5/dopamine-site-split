import { IsEmail, IsString, MinLength } from "class-validator";

// Mirrors the original app/api/v1/auth/register zod schema exactly:
// name min 1 char, valid email, password min 8 chars.
export class RegisterDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
