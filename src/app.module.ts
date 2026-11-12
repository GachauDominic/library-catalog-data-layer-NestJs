import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { BooksModule } from "./books/books.module.js";
import { GenresModule } from "./genres/genres.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, AuthModule, GenresModule, BooksModule],
})
export class AppModule {}
