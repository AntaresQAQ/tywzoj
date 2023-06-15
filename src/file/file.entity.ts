import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

import { IFileEntity } from "./file.types";

@Entity("file")
export class FileEntity implements IFileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "char", length: 36 })
  @Index({ unique: true })
  uuid: string;

  @Column({ type: "integer" })
  size: number;

  @Column({ type: "datetime" })
  uploadTime: Date;
}
