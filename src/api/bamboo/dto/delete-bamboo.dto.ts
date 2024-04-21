import { IsNotEmpty } from 'class-validator';

export class DeleteBambooDto {
  @IsNotEmpty()
  postId: number;
}
