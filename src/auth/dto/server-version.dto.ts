import { ApiProperty } from "@nestjs/swagger";

export abstract class ServerVersionDto {
  @ApiProperty()
  hash: string;

  @ApiProperty()
  date: string;
}
