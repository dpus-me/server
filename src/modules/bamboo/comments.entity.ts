import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BambooPost } from './post.entity';
import { User } from '../User/user.entity';
import { BambooLike } from './like.entity';

@Entity()
export class BambooComments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdAt: Date;

  @Column()
  contents: string;

  @Column({ nullable: true })
  parents: number;

  @ManyToOne(() => BambooPost, (post) => post.comments)
  post: BambooPost;

  @ManyToOne(() => User, (user) => user.writtenBambooComments)
  author: User;

  @OneToMany(() => BambooLike, (like) => like.post)
  likes: BambooLike;
}
