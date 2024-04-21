import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../User/user.entity';
import { BambooComments } from './comments.entity';
import { BambooLike } from './like.entity';

@Entity()
export class BambooPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  contents: string;

  @Column()
  createdAt: Date;

  @Column({ default: 0 })
  viewd: number;

  @Column({ default: true })
  anonymity: boolean;

  @ManyToOne(() => User, (user) => user.writtenBambooPost)
  author: User;

  @OneToMany(() => BambooLike, (like) => like.post)
  like: BambooLike[];

  @OneToMany(() => BambooComments, (comments) => comments.post)
  comments: BambooComments[];
}
