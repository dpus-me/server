import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../User/user.entity';
import { LostComments } from './comments.entity';

@Entity()
export class LostPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  thumbnail: string;

  @Column()
  location: string;

  @Column()
  contents: string;

  @Column()
  isFound: boolean;

  @ManyToOne(() => User, (user) => user.writenLost)
  author: User;

  @OneToMany(() => LostComments, (comment) => comment.post)
  comments: LostComments[];
}
