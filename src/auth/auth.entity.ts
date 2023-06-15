import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { UserEntity } from "@/user/user.entity";

@Entity("auth")
export class AuthEntity {
  @OneToOne(() => UserEntity, user => user.auth)
  @JoinColumn()
  user: Promise<UserEntity>;

  @PrimaryColumn()
  userId: number;

  @Column({ type: "char", length: 60 })
  password: string;
}
