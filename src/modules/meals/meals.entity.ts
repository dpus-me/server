import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Meals {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column('text', { array: true })
  data: string[];
}
