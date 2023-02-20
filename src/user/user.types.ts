import { CE_UserLevel } from "@/common/user-level";

export const enum CE_UserGender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export interface IUserAtomicEntity {
  id: number;
  username: string;
}

export interface IUserBaseEntity extends IUserAtomicEntity {
  email: string;
  nickname?: string;
  information?: string;
  level: CE_UserLevel;
}

export interface IUserEntity extends IUserBaseEntity {
  gender?: CE_UserGender;
  acceptedProblemCount: number;
  submissionCount: number;
  rating: number;
  registrationTime: Date;
}

export interface IUserAtomicExtra {
  avatar: string;
}

export interface IUserBaseExtra extends IUserAtomicExtra {}
export interface IUserExtra extends IUserBaseExtra {}

export type IUserAtomicEntityWithExtra = IUserAtomicEntity & IUserAtomicExtra;
export type IUserBaseEntityWithExtra = IUserBaseEntity & IUserBaseExtra;
export type IUserEntityWithExtra = IUserEntity & IUserExtra;
