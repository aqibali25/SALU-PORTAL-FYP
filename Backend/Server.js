import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
//import userRoutesGet from "./routes/userRoutesGet.js";
import admissionsRoutes from "./routes/admissions.js";
import subjectAllocationRoutes from "./routes/subjectAllocation.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admissions", admissionsRoutes);
app.use("/api/subject-allocations", subjectAllocationRoutes);
// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

// Connect & start
await connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// server.js (backend)

const corsOpts = {
  origin: ["http://localhost:5173"], // your Vite dev URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOpts));
app.options("*", cors(corsOpts));
