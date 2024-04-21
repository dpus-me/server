import { IsNotEmpty } from 'class-validator';

export class CommentBambooDto {
  @IsNotEmpty()
  postId: number;

  @IsNotEmpty()
  contents: string;

  parents: number;
}
