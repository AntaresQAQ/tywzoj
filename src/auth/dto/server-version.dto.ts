import { ApiProperty } from "@nestjs/swagger";

export class ServerVersionDto {
  @ApiProperty()
  hash: string;

  @ApiProperty()
  date: string;
}
