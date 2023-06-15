import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileEntity } from "./file.entity";
import { FileService } from "./file.service";

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  exports: [FileService],
  providers: [FileService],
})
export class FileModule {}
