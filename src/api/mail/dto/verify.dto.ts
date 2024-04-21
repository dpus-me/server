import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: string;
}
