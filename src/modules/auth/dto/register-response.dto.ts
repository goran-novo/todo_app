import { ApiProperty } from "@nestjs/swagger";

export class RegisterResponseDto {
  @ApiProperty({
    example: "uuid",
    description: "The unique identifier of the user",
  })
  uuid: string;

  @ApiProperty({
    example: "user@example.com",
    description: "The email of the user",
  })
  email: string;
}
