import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract.d.js";
import contractJson from "./contract.json" with { type: "json" };

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set before starting the API.");
}

export const contract = contractFromJson<Contract>(contractJson);

export function createPrismaClient(url = connectionString) {
  if (!url) {
    throw new Error("A PostgreSQL connection URL must be set before creating the Prisma client.");
  }
  return postgres({ contract, url });
}

export const prisma = createPrismaClient();
