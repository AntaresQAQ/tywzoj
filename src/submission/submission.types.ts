import { IUserAtomicEntityWithExtra } from "@/user/user.types";

export enum E_SubmissionStatus {
    Pending = "PD",

    SystemError = "SE",
    Canceled = "CCL",

    JudgementFailed = "FLD",

    CompilationError = "CE",
    FileError = "FE",
    RuntimeError = "RE",
    TimeLimitExceeded = "TLE",
    MemoryLimitExceeded = "MLE",
    OutputLimitExceeded = "OLE",
    PartiallyCorrect = "PC",
    WrongAnswer = "WA",
    Accepted = "AC",
}

export interface ISubmissionBaseEntity {
    id: number;
    codeLang: string;
    answerSize: number;
    timeUsed: number;
    memoryUsed: number;
    score: number;
    status: E_SubmissionStatus;
    submitTime: Date;
}

export interface ISubmissionEntity extends ISubmissionBaseEntity {
    code: string;
}

export interface ISubmissionBaseExtra {
    submitter: IUserAtomicEntityWithExtra;
}

export interface ISubmissionExtra {}

export type ISubmissionBaseEntityWithExtra = ISubmissionBaseEntity & ISubmissionBaseExtra;
export type ISubmissionEntityWithExtra = ISubmissionEntity & ISubmissionExtra;
