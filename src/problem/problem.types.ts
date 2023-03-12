import { CE_UserLevel } from "@/common/user-level";
import { IProblemSampleEntity } from "@/problem/problem-sample.types";
import { IProblemTagEntity } from "@/problem/problem-tag.types";
import { IUserAtomicEntityWithExtra } from "@/user/user.types";

export enum E_ProblemType {
  Traditional = "Traditional",
  Interaction = "Interaction",
  SubmitAnswer = "SubmitAnswer",
}

export enum E_ProblemScope {
  Global = "Global",
  Group = "Group",
  Personal = "Personal",
}

// Problem level just effects on "Global" scope
export const enum CE_ProblemLevel {
  All = CE_UserLevel.General,
  Paid = CE_UserLevel.Paid,
  Internal = CE_UserLevel.Internal,
}

export interface IProblemAtomicEntity {
  id: number;
  displayId: number;
  title: string;
}

export interface IProblemBaseEntity extends IProblemAtomicEntity {
  subtitle: string;

  // isPublic just effects on "Global" scope
  isPublic: boolean;
  scope: E_ProblemScope;
  submissionCount: number;
  acceptedSubmissionCount: number;
}

export interface IProblemEntity extends IProblemBaseEntity {
  description: string;
  inputFormat: string;
  outputFormat: string;
  limitAndHint: string;
  type: E_ProblemType;
  level: CE_ProblemLevel;
}

export interface IProblemAtomicExtra {}

export interface IProblemBaseExtra extends IProblemAtomicExtra {
  tags?: IProblemTagEntity[];
}

export interface IProblemExtra extends IProblemBaseExtra {
  owner: IUserAtomicEntityWithExtra;
  samples: IProblemSampleEntity[];
}

export type IProblemAtomicEntityWithExtra = IProblemAtomicEntity & IProblemAtomicExtra;
export type IProblemBaseEntityWithExtra = IProblemBaseEntity & IProblemBaseExtra;
export type IProblemEntityWithExtra = IProblemEntity & IProblemExtra;
