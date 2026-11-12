import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateBookDto } from "./dto/create-book.dto.js";
import { UpdateBookDto } from "./dto/update-book.dto.js";
import { FindBooksQueryDto } from "./dto/find-books-query.dto.js";

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({ genreId, search, page = 1, limit = 20 }: FindBooksQueryDto) {
    return this.prisma.book.findMany({
      where: {
        ...(genreId ? { genreId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { author: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { genre: true },
      orderBy: { title: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }
    return book;
  }

  create(dto: CreateBookDto) {
    const { publishedAt, ...data } = dto;
    return this.prisma.book.create({
      data: {
        ...data,
        ...(publishedAt !== undefined
          ? { publishedAt: publishedAt === null ? null : new Date(publishedAt) }
          : {}),
      },
      include: { genre: true },
    });
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.findOne(id);
    const { publishedAt, ...data } = dto;
    return this.prisma.book.update({
      where: { id },
      data: {
        ...data,
        ...(publishedAt !== undefined
          ? { publishedAt: publishedAt === null ? null : new Date(publishedAt) }
          : {}),
      },
      include: { genre: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}
