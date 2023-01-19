export interface IProblemTagEntity {
  id: number;
  name: string;
  typeId: number;
  order: number;
}

export interface IProblemTagTypeEntity {
  id: number;
  name: string;
  color: string;
  order: number;
}
