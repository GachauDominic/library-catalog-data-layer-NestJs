import { IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

export class UpdateGenreDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;
}
