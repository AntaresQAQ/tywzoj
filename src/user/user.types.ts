import { CE_UserLevel } from "@/common/user-level";

export const enum CE_UserGender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export interface IUserBaseEntity {
  id: number;
  username: string;
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

export interface IUserExtra {
  avatar: string;
}

export type IUserBaseEntityWithExtra = IUserBaseEntity & IUserExtra;
export type IUserEntityWithExtra = IUserEntity & IUserExtra;
