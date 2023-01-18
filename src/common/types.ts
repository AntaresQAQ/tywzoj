export type HttpPatch<T extends { id: number }> = Partial<Omit<T, "id">>;
