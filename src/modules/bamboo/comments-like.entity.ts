import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BambooComments } from './comments.entity';
import { User } from '../User/user.entity';

@Entity()
export class BambooCommentsLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BambooComments, (comment) => comment.likes)
  comment: BambooComments;

  @ManyToOne(() => User, (user) => user.likedBambooComments)
  author: User;
}
