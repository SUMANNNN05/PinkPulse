import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/db";
import { logger } from "./utils/logger";

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    app.listen(env.port, () => {
      logger.info(`PinkPulse backend running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

startServer();

// Graceful shutdown — closes the DB connection pool cleanly instead of
// leaving dangling connections when the process is killed (e.g. by Docker,
// or a deploy restart on M4's infra).
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});
