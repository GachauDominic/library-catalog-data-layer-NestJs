# Prisma 8 database workflow

The application, seed script, schema contract, client, and migration tooling
use Prisma 8. The API uses the PostgreSQL client from `@prisma/orm-postgres`.

## Existing databases

The local database was signed against the pre-`sourceUrl` baseline and the
Prisma 8 migration `20261120T1131_add_book_source_url` was applied. Its new
column is nullable, so existing book records remain valid.

For another existing environment with the original catalog schema, sign it
against the baseline contract before applying pending migrations:

```powershell
pnpm exec prisma db sign 399bf91a5970198488a5a3df5f8f1684bcea5718162adc114bc2644290cdaa60
pnpm db:migrate:deploy
pnpm db:verify
```

The baseline records the schema that environment already has. The following
migration adds `Book.sourceUrl`.

## New databases

Apply the checked-in Prisma 8 migration graph to an empty database:

```powershell
pnpm db:migrate:deploy
pnpm db:verify
pnpm db:seed
```

## Future schema changes

Edit `prisma/contract.prisma`, then emit, plan, review, apply, and verify:

```powershell
pnpm db:contract:emit
pnpm db:migration:plan --name <change-name>
pnpm db:migration:show <migration-dir>
pnpm db:migrate
pnpm db:verify
```

`db:migrate` advances the development `db` reference. Use
`db:migrate:deploy` in reviewed deployment workflows; it applies the checked-
in migration graph without moving that development reference. Prisma 8 does
not run seed scripts automatically, so invoke `pnpm db:seed` when needed.
