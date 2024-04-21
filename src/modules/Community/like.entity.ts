import {
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityPost } from './post.entity';
import { User } from '../User/user.entity';

@Entity()
export class CommunityLike {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => CommunityPost, (post) => post.like)
  post: CommunityPost;

  @OneToMany(() => User, (user) => user.communityLike)
  author: User;
}
