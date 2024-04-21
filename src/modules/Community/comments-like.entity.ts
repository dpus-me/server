import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityComments } from './comments.entity';
import { User } from '../User/user.entity';

@Entity()
export class CommunityCommentsLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityComments, (comment) => comment.likes)
  comment: CommunityComments;

  @ManyToOne(() => User, (user) => user.likedCommunityComments)
  author: User;
}
