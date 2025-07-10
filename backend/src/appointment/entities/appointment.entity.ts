import { AppointmentStatus, AppointmentType } from 'src/common/enums/enum';
import { Item } from 'src/item/entities/item.entity';
import { Modules } from 'src/modules/entities/module.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { Room } from 'src/room/entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'text' })
  note?: string;

  @Column({ nullable: true })
  startAt?: Date;

  @Column({ nullable: true })
  endAt?: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'enum', enum: AppointmentType })
  type: AppointmentType;

  @Column()
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.appointments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'healerId' })
  healer: User;

  @ManyToOne(() => Item, (item) => item.appointments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @ManyToOne(() => Room, (room) => room.appointments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @ManyToOne(() => Partner, (partner) => partner.appointments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Partner;

  @ManyToMany(() => Modules, (module) => module.appointments)
  @JoinTable({
    name: 'appointment_module',
    joinColumn: {
      name: 'appointmentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'moduleId',
      referencedColumnName: 'id',
    },
  })
  modules: Modules[];
}
