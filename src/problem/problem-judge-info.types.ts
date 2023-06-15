export interface IProblemJudgeInfoEntity {
  problemId: number;
  timeLimit: number;
  memoryLimit: number;
  fileIO: boolean;
  inputFile: string;
  outputFile: string;
}
