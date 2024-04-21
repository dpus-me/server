import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BambooPost } from './post.entity';
import { User } from '../User/user.entity';

@Entity()
export class BambooLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BambooPost, (post) => post.like)
  post: BambooPost;

  @ManyToOne(() => User, (user) => user.bambooLike)
  author: User;
}
