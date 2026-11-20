import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract.d.js";
import contractJson from "./contract.json" with { type: "json" };

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set before starting the API.");
}

export const contract = contractFromJson<Contract>(contractJson);
export const prisma = postgres({ contract, url: connectionString });
