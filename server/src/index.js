import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  console.error("JWT_SECRET must be set in .env and be at least 24 characters long.");
  process.exit(1);
}

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "20kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "TaskFlow API" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ message: status === 500 ? "Something went wrong on the server." : err.message });
});

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow")
  .then(() => {
    app.listen(port, () => console.log(`TaskFlow API running at http://localhost:${port}`));
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  });
