# Library catalog data layer

This starter scaffolds a NestJS API and Prisma data layer for a library catalog using PostgreSQL. It includes authentication, role-protected catalog writes, book search/filter/pagination, genres, books, users, and an optional review relationship. The app entry point is `api/src/main.ts`; feature modules are in `api/src/auth`, `api/src/books`, and `api/src/genres`.

## Requirements

- Node.js version supported by Prisma ORM 7
- pnpm
- A hosted PostgreSQL database, for example a Neon project

## Configure and run

From Git Bash, enter the API directory:

```bash
cd api
pnpm install
cp .env.example .env
```

Edit `api/.env` and replace the placeholder with your hosted PostgreSQL connection string. Keep `.env` private and out of Git.

Generate Prisma Client and create/apply the development migration:

```bash
pnpm db:generate
pnpm db:migrate --name catalog-core
```

The migration command is included for you to run against your hosted PostgreSQL database. It has not been run as part of this scaffold. Before seeding, set `JWT_SECRET` in `.env` to a random secret of at least 32 bytes. To create a librarian account during seeding, set both `SEED_LIBRARIAN_EMAIL` and `SEED_LIBRARIAN_PASSWORD` (12–72 UTF-8 bytes). Leave both blank to skip creating one. Registration always creates `PATRON` accounts; it never accepts a role from the request body. After the migration succeeds, seed the catalog and start the NestJS API:

```bash
pnpm db:seed
pnpm start:dev
```

The API listens on port `3000` by default. Set `PORT` in `.env` to change it. Import `docs/postman_collection.json` into Postman. Use the seeded librarian credentials with the collection's `loginEmail` and `loginPassword` variables to exercise protected catalog write endpoints. Supply real IDs for the `genreId` and `bookId` collection variables.

## API routes

| Method | Route | Purpose / access |
|---|---|---|
| `POST` | `/auth/register` | Register a patron and receive a JWT |
| `POST` | `/auth/login` | Log in and receive a JWT |
| `GET` | `/users/profile` | Current user profile; bearer token required |
| `GET` | `/genres` | List genres |
| `GET` | `/genres/:id` | Read one genre |
| `POST`, `PATCH`, `DELETE` | `/genres` or `/genres/:id` | Genre CRUD writes; librarian bearer token required |
| `GET` | `/books?genreId=&search=&page=&limit=` | Filter by genre, search title/author, paginate |
| `GET` | `/books/:id` | Read one book |
| `POST`, `PATCH`, `DELETE` | `/books` or `/books/:id` | Book CRUD writes; librarian bearer token required |

Login throttling is not enabled in this starter. Add `@nestjs/throttler` before exposing the API publicly.

Seed the database with four genres and sixteen books:

```bash
pnpm db:seed
```

The seed script uses `upsert`, so it can be run repeatedly without duplicating the genre or book rows. It uses deterministic placeholder ISBN values for this sample catalog; replace them with real ISBNs before using the data in a real library.

The Prisma Client generator writes generated code to `api/generated/prisma`; that folder is build output and should not be committed. Commit migration files created under `api/prisma/migrations/`.

## Schema Decisions

`Book` references `Genre` through the required `genreId` foreign key and Prisma relation. A genre is shared data: many books can belong to one genre, and storing it once avoids repeating names across book rows. The relation lets PostgreSQL enforce referential integrity, and the `Genre.books` collection makes the reverse relationship available in Prisma queries. `onDelete: Restrict` prevents deleting a genre while books still use it; reassign those books first.

`User.role` is a `Role` enum with `PATRON` as the default and `LIBRARIAN` for catalog staff. `Review` is the optional stretch relation: each review belongs to one book and one user, ratings are represented as integers, and the compound unique constraint allows at most one review per user per book.

One difference from a document database is that related genres are modeled as normalized rows joined by a foreign key, rather than embedding a genre object in every book document. This reduces duplicated genre data and gives PostgreSQL explicit referential integrity.

## Hosted database migration note

This workspace does not contain your database credentials, so add the connection string and run the migration and seed commands yourself. Prisma ORM 7 uses the datasource URL in `prisma.config.ts`, requires a generated output path, and uses a PostgreSQL driver adapter for Prisma Client. See the official [Prisma schema and Client generation docs](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client), [Prisma PostgreSQL connector](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql), and [seeding guide](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding).
