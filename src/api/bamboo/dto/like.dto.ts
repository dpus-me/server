import { IsNotEmpty } from 'class-validator';

export class LikeBambooDto {
  @IsNotEmpty()
  postId: number;
}
