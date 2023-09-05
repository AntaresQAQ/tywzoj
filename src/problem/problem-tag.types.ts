import { IProblemTagTypeBaseEntityWithExtra } from "./problem-tag-type.types";

export interface IProblemTagBaseEntity {
    id: number;
    name: string;
    typeId: number;
    order: number;
}

export interface IProblemTagEntity extends IProblemTagBaseEntity {}

export interface IProblemTagBaseExtra {}

export interface IProblemTagExtra extends IProblemTagBaseExtra {
    type?: IProblemTagTypeBaseEntityWithExtra;
}

export type IProblemTagBaseEntityWithExtra = IProblemTagBaseEntity & IProblemTagBaseExtra;
export type IProblemTagEntityWithExtra = IProblemTagEntity & IProblemTagExtra;
