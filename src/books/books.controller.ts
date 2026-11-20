import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Role } from "../auth/role.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { BooksService } from "./books.service.js";
import { CreateBookDto } from "./dto/create-book.dto.js";
import { FindBooksQueryDto } from "./dto/find-books-query.dto.js";
import { UpdateBookDto } from "./dto/update-book.dto.js";

@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() query: FindBooksQueryDto) {
    return await this.booksService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.booksService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }
}
