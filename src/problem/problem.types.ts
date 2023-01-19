import { CE_UserLevel } from "@/common/user-level";
import { IProblemSampleEntity } from "@/problem/problem-sample.types";
import { IProblemTagEntity } from "@/problem/problem-tag.types";
import { IUserBaseEntityWithExtra } from "@/user/user.types";

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

export interface IProblemBaseEntity {
  id: number;
  displayId: number;
  title: string;
  subtitle: string;
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

export interface IProblemExtra {
  owner?: IUserBaseEntityWithExtra;
  samples?: IProblemSampleEntity[];
  tags?: IProblemTagEntity[];
}

export type IProblemBaseEntityWithExtra = IProblemBaseEntity & IProblemExtra;
export type IProblemEntityWithExtra = IProblemEntity & IProblemExtra;
