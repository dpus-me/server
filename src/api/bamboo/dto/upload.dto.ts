import { IsNotEmpty } from 'class-validator';

export class PostBambooDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  contents: string;

  @IsNotEmpty()
  anonymity: boolean;
}
