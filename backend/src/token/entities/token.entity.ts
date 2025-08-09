import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
