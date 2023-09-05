import { IProblemTagBaseEntityWithExtra } from "./problem-tag.types";

export interface IProblemTagTypeBaseEntity {
    id: number;
    name: string;
    color: string;
    order: number;
}

export interface IProblemTagTypeEntity extends IProblemTagTypeBaseEntity {}

export interface IProblemTagTypeBaseExtra {}

export interface IProblemTagTypeExtra extends IProblemTagTypeBaseExtra {
    tags?: IProblemTagBaseEntityWithExtra[];
}

export type IProblemTagTypeBaseEntityWithExtra = IProblemTagTypeBaseEntity & IProblemTagTypeBaseExtra;
export type IProblemTagTypeEntityWithExtra = IProblemTagTypeEntity & IProblemTagTypeExtra;
