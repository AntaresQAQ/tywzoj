import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AuthEntity } from '@/auth/auth.entity';

export enum UserType {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SCHOOL = 'SCHOOL',
  PAYING = 'PAYING',
  GENERAL = 'GENERAL',
  BLOCKED = 'BLOCKED',
}

export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 24 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 24, nullable: true })
  nickname: string;

  @Column({ type: 'enum', enum: UserGender, nullable: true })
  gender: UserGender;

  @Column({ type: 'text', nullable: true })
  information: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.GENERAL })
  type: UserType;

  @Column({ type: 'datetime', nullable: true })
  registrationTime: Date;

  @OneToOne(() => AuthEntity, auth => auth.user)
  auth: AuthEntity;
}
