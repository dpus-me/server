import {
  Column,
  Entity,
  Generated,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityPost } from '../Community/post.entity';
import { CommunityCommentsLike } from '../Community/comments-like.entity';
import { BambooPost } from '../bamboo/post.entity';
import { CommunityLike } from '../Community/like.entity';
import { CommunityComments } from '../Community/comments.entity';
import { BambooComments } from '../bamboo/comments.entity';
import { BambooLike } from '../bamboo/like.entity';
import { BambooCommentsLike } from '../bamboo/comments-like.entity';
import { LostPost } from '../lost/post.entity';
import { LostComments } from '../lost/comments.entity';
import { Roles } from './roles.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  username: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ default: 0 })
  grade: number;

  @Column({ default: 0 })
  classroom: number;

  @Column()
  password: string;

  @Column({
    default: '/ui/profile/default.png',
  })
  profile: string;

  @Column({ default: '' })
  description: string;

  @Column({ nullable: true })
  currentRefreshToken: string;

  @Column({ nullable: true })
  currentRefreshTokenExp: Date;

  @ManyToOne(() => Roles, (role) => role.users)
  role: Roles;

  @OneToMany(() => CommunityPost, (post) => post.author)
  writtenCommunityPost: CommunityPost[];

  @OneToMany(() => BambooPost, (post) => post.author)
  writtenBambooPost: BambooPost[];

  @OneToMany(() => CommunityLike, (like) => like.author)
  communityLike: CommunityLike[];

  @OneToMany(() => BambooLike, (like) => like.author)
  bambooLike: BambooLike[];

  @OneToMany(() => CommunityCommentsLike, (like) => like.author)
  likedCommunityComments: CommunityCommentsLike[];

  @OneToMany(() => BambooCommentsLike, (like) => like.author)
  likedBambooComments: BambooCommentsLike[];

  @OneToMany(() => CommunityComments, (comment) => comment.author)
  writtenCommunityComments: CommunityComments;

  @OneToMany(() => BambooComments, (comment) => comment.author)
  writtenBambooComments: BambooComments;

  @OneToMany(() => LostPost, (post) => post.author)
  writenLost: LostPost[];

  @OneToMany(() => LostComments, (comment) => comment.author)
  writtenLostComments: LostComments[];
}
