import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema/index.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is required but not set. " +
    "Add it to your .env file or Vercel project settings."
  );
}

export const db = drizzle(databaseUrl, { schema });
