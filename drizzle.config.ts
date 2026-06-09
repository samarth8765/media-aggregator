import { defineConfig } from "drizzle-kit";
import { exitCode } from "node:process";

if (!process.env.DATABASE_URL) {
  process.exit(1);
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
