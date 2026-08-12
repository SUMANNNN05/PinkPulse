import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// A naive `new PrismaClient()` in every file that needs the DB would open a
// new connection pool each time (and multiply on hot-reload in dev). This
// singleton pattern guarantees exactly one client for the whole app.
export const prisma = new PrismaClient({
  log: env.isProduction ? ["error"] : ["query", "error", "warn"],
});
