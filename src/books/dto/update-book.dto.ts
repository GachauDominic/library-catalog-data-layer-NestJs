import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateBookDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  author?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  totalCopies?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsUUID()
  genreId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;
}
