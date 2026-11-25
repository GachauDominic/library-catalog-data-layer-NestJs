import "dotenv/config";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";

declare const process: { env: { DATABASE_URL?: string; DIRECT_URL?: string } };

const migrationConnection = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!migrationConnection) {
  throw new Error("Set DIRECT_URL (preferred) or DATABASE_URL before running Prisma commands.");
}

export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: "prisma/contract.prisma",
    output: "src/prisma",
    db: {
      // Neon poolers reject session startup settings required by the Prisma Postgres runtime.
      connection: migrationConnection,
    },
  }),
});
