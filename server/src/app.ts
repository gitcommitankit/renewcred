import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app: express.Application = express();

// ---- Security ----
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ---- Parsing ----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- Compression ----
app.use(compression());

// ---- Logging — combined format in production, verbose dev format locally ----
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ---- Rate Limiting ----
app.use("/api/", apiLimiter);

// ---- Base Routes ----
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Hello from RenewCred CMS server", timestamp: new Date().toISOString() });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---- Routes ----
app.use("/api/v1", routes);

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
});

// ---- Global Error Handler ----
app.use(errorHandler);

export default app;
