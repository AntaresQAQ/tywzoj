/* eslint-disable @typescript-eslint/no-explicit-any */
export type HttpPatch<T extends object, U extends keyof any = "id"> = Partial<Omit<T, U>>;
