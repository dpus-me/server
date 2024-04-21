import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityComments } from './comments.entity';
import { CommunityCategory } from './category.entity';
import { User } from '../User/user.entity';
import { CommunityLike } from './like.entity';

@Entity()
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  contents: string;

  @Column()
  createdAt: Date;

  @Column({ default: 0 })
  viewed: number;

  @ManyToOne(() => User, (user) => user.writtenCommunityPost)
  author: User;

  @ManyToOne(() => CommunityCategory, (category) => category.posts)
  category: CommunityCategory;

  @OneToMany(() => CommunityLike, (like) => like.post)
  like: CommunityLike[];

  @OneToMany(() => CommunityComments, (comments) => comments.post)
  comments: CommunityComments[];
}
