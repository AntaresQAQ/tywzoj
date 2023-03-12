import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { CE_Language, languages } from "@/common/locales";
import { UserEntity } from "@/user/user.entity";
import { CE_Theme, IUserPreferenceEntity } from "@/user/user-preference.types";

@Entity("user_preference")
export class UserPreferenceEntity implements IUserPreferenceEntity {
  @OneToOne(() => UserEntity, user => user.auth)
  @JoinColumn()
  user: Promise<UserEntity>;

  @PrimaryColumn()
  userId: number;

  @Column({ type: "enum", nullable: true, enum: [CE_Theme.Light, CE_Theme.Dark, CE_Theme.HighContrast] })
  userPreferTheme: CE_Theme;

  @Column({ type: "enum", nullable: true, enum: languages })
  userPreferLanguage: CE_Language;

  @Column({ type: "boolean", default: false })
  showTagsOnProblemList: boolean;

  @Column({ type: "boolean", default: false })
  showTagsOnProblemDetail: boolean;
}
