import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityPost } from './post.entity';

@Entity()
export class CommunityCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @OneToMany(() => CommunityPost, (post) => post.category)
  posts: CommunityPost[];
}
