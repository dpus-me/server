import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailCert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  certNumb: string;

  @Column({ default: false })
  verified: boolean;
}
