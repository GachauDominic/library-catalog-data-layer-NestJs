import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  author!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string | null;

  @IsInt()
  @Min(1)
  totalCopies!: number;

  @IsUUID()
  genreId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;
}
