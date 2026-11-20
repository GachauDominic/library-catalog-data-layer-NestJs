import { Injectable, NotFoundException } from "@nestjs/common";
import { all, and, or } from "@prisma/orm-postgres/orm-client";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateBookDto } from "./dto/create-book.dto.js";
import { UpdateBookDto } from "./dto/update-book.dto.js";
import { FindBooksQueryDto } from "./dto/find-books-query.dto.js";

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ genreId, search, page = 1, limit = 20 }: FindBooksQueryDto) {
    return await this.prisma.client.orm.public.Book
      .where((book) =>
        and(
          genreId ? book.genreId.eq(genreId) : all(),
          search
            ? or(
                book.title.ilike(`%${escapeLikePattern(search)}%`),
                book.author.ilike(`%${escapeLikePattern(search)}%`),
              )
            : all(),
        ),
      )
      .include("genre")
      .orderBy((book) => book.title.asc())
      .offset((page - 1) * limit)
      .limit(limit)
      .all();
  }

  async findOne(id: string) {
    const book = await this.prisma.client.orm.public.Book
      .whereUnique({ id })
      .include("genre")
      .first();
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }
    return book;
  }

  async create(dto: CreateBookDto) {
    const { publishedAt, ...data } = dto;
    const book = await this.prisma.client.orm.public.Book.create({
      ...data,
      ...(publishedAt !== undefined
        ? { publishedAt: publishedAt === null ? null : new Date(publishedAt) }
        : {}),
    });
    return this.findOne(book.id);
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.findOne(id);
    const { publishedAt, ...data } = dto;
    const updated = await this.prisma.client.orm.public.Book
      .whereUnique({ id })
      .update({
        ...data,
        ...(publishedAt !== undefined
          ? { publishedAt: publishedAt === null ? null : new Date(publishedAt) }
          : {}),
      });
    if (!updated) {
      throw new NotFoundException(`Book ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    const book = await this.prisma.client.orm.public.Book
      .whereUnique({ id })
      .delete();
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }
    return book;
  }
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
