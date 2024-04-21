import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../User/user.entity';
import { LostPost } from './post.entity';

@Entity()
export class LostComments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contents: string;

  @Column({ nullable: true })
  parents: number;

  @ManyToOne(() => LostPost, (post) => post.comments)
  post: LostPost;

  @ManyToOne(() => User, (user) => user.writtenLostComments)
  author: User;
}
