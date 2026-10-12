import { defineConfig } from "drizzle-kit";
import "dotenv";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/drizzle/schemas/index.ts",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      (() => {
        throw new Error("DATABASE_URL is required");
      })(),
  },
  verbose: true,
  migrations: {
    table: "journal",
    schema: "drizzle",
  },
});
