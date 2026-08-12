import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import routes from "./routes";

// app.ts builds the Express app but never calls .listen(). That's on
// purpose: server.ts owns starting the actual server, which means this
// file can be imported directly into a test file (e.g. with Supertest)
// without opening a real network port.
const app = express();

// --- Global middleware, order matters ---
app.use(helmet()); // security headers, first
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true, // required so the refresh-token cookie is sent/received
  })
);
app.use(express.json()); // parse JSON bodies
app.use(cookieParser()); // parse cookies (refresh token lives here)
app.use(pinoHttp({ logger })); // structured request logging
app.use(apiLimiter); // baseline rate limiting on everything

// --- Routes ---
app.use("/api/v1", routes);

// 404 for anything not matched above
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// --- Error handler — MUST be registered last ---
app.use(errorHandler);

export default app;
