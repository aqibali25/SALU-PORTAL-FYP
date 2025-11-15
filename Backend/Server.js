import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import admissionsRoutes from "./routes/admissions.js";
import subjectAllocationRoutes from "./routes/subjectAllocation.js";
import subjectsRoutes from "./routes/subjects.js";
import feesRoutes from "./routes/fees.js";
import attendanceRoutes from "./routes/attendance.js";
import departmentsRoutes from "./routes/departments.js";
import studentMarksRoutes from "./routes/studentMarks.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// CORS configuration
const corsOpts = {
  origin: ["http://localhost:5173"], // your Vite dev URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOpts));
app.options("*", cors(corsOpts));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admissions", admissionsRoutes);
app.use("/api/subject-allocations", subjectAllocationRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/departments", departmentsRoutes); // Add this line
app.use("/api/fees", feesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/student-marks", studentMarksRoutes);
// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

// Connect & start
await connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));