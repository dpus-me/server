import { IsEmail, IsNotEmpty } from 'class-validator';

export class GetCodeDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
