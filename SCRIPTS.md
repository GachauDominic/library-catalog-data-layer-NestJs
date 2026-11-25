# Project scripts

Run these commands from the `api` directory with pnpm. The API and Prisma CLI
prefer `DIRECT_URL` from `.env`, then fall back to `DATABASE_URL` if it is unset.

For Neon, set `DIRECT_URL` to the direct endpoint (hostname has no `-pooler`).
The Prisma Postgres runtime sends session settings at connection startup that
Neon's pooled endpoint rejects, so the API must use the direct endpoint. Keep
`DATABASE_URL` as a fallback if needed. Both URLs should use `sslmode=require`.

## Application

| Script | What it does |
| --- | --- |
| `pnpm build` | Compiles the NestJS API into `dist/`. It does not connect to the database. |
| `pnpm start` | Runs the compiled API from `dist/src/main.js`. Build first if the output is missing or outdated. |
| `pnpm start:dev` | Runs NestJS in development watch mode and rebuilds/restarts when source files change. |

## Prisma contract and migrations

| Script | What it does |
| --- | --- |
| `pnpm db:contract:emit` | Reads `prisma/contract.prisma` and regenerates the Prisma 8 contract artifacts in `src/prisma/`. Run after editing the contract. |
| `pnpm db:migration:plan --name <name>` | Plans a migration from the emitted contract and writes it under `migrations/app/`. Planning does not change the database. Review the planned operations before applying them. |
| `pnpm db:migration:list` | Lists the migration packages currently checked in under the Prisma 8 migration directory. |
| `pnpm db:migration:check` | Checks the migration files and graph for integrity. It does not apply migrations. |
| `pnpm db:migration:status` | Compares the checked-in migration graph with the connected database and reports applied or pending migrations. |
| `pnpm db:migration:show <migration-dir>` | Shows the operations and SQL preview for one migration. Pass the directory printed by `db:migration:plan`. |
| `pnpm db:sign [contract]` | Verifies the connected database against a contract and records its Prisma 8 signature. Use when adopting an existing database; signing changes migration metadata, not catalog rows. An optional contract reference can be passed after the script name. |
| `pnpm db:migrate` | Applies pending migrations to the development database and advances the local `db` reference to the resulting contract. |
| `pnpm db:migrate:deploy` | Applies the checked-in migrations without advancing the development `db` reference. Use in reviewed staging/production deployment workflows. |
| `pnpm db:verify` | Checks that the connected database schema and Prisma 8 signature match the emitted contract. It does not change the database. |

Typical development flow after changing the contract:

```powershell
pnpm db:contract:emit
pnpm db:migration:plan --name <change-name>
pnpm db:migration:show <migration-dir>
pnpm db:migrate
pnpm db:verify
```

## Seed data

| Script | What it does |
| --- | --- |
| `pnpm db:seed` | Runs `prisma/seed.ts` with `tsx`. It upserts the sample genres and books, and upserts a librarian when both `SEED_LIBRARIAN_EMAIL` and `SEED_LIBRARIAN_PASSWORD` are set in `.env`. Seeding writes data and can update existing sample records. |

Prisma 8 does not run the seed automatically during migration. Run `pnpm db:seed`
explicitly when you want to populate or refresh the sample catalog.
