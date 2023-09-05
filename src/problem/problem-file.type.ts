import { JwtPayload } from "jsonwebtoken";

import { IFileEntity } from "@/file/file.types";

export enum E_ProblemFileType {
    TestData = "T",
    AdditionalFile = "A",
}

export interface IProblemFileEntity {
    filename: string;
    uuid: string;
    type: E_ProblemFileType;
}

export interface IProblemFileExtra {
    file: IFileEntity;
}

export type IProblemFileEntityWithExtra = IProblemFileEntity & IProblemFileExtra;

export interface IProblemFileTokenPayload extends JwtPayload {
    p: number;
    f: string;
    t: E_ProblemFileType;
    s: number;
}

export interface IProblemFileTokenRaw {
    problemId: number;
    filename: string;
    type: E_ProblemFileType;
    size: number;
}
