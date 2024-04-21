import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityPost } from './post.entity';
import { CommunityCommentsLike } from './comments-like.entity';
import { User } from '../User/user.entity';

@Entity()
export class CommunityComments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contents: string;

  @Column({ nullable: true })
  parents: number;

  @ManyToOne(() => CommunityPost, (post) => post.comments)
  post: CommunityPost;

  @ManyToOne(() => User, (user) => user.writtenCommunityComments)
  author: User;

  @OneToMany(() => CommunityCommentsLike, (like) => like.comment)
  likes: CommunityCommentsLike[];
}
