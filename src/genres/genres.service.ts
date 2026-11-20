import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateGenreDto } from "./dto/create-genre.dto.js";
import { UpdateGenreDto } from "./dto/update-genre.dto.js";

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.client.orm.public.Genre
      .orderBy((genre) => genre.name.asc())
      .all();
  }

  async findOne(id: string) {
    const genre = await this.prisma.client.orm.public.Genre
      .whereUnique({ id })
      .first();
    if (!genre) {
      throw new NotFoundException(`Genre ${id} not found`);
    }
    return genre;
  }

  create(dto: CreateGenreDto) {
    return this.prisma.client.orm.public.Genre.create({ name: dto.name });
  }

  async update(id: string, dto: UpdateGenreDto) {
    const genre = await this.prisma.client.orm.public.Genre
      .whereUnique({ id })
      .update({ name: dto.name });
    if (!genre) {
      throw new NotFoundException(`Genre ${id} not found`);
    }
    return genre;
  }

  async remove(id: string) {
    const genre = await this.prisma.client.orm.public.Genre
      .whereUnique({ id })
      .delete();
    if (!genre) {
      throw new NotFoundException(`Genre ${id} not found`);
    }
    return genre;
  }
}
