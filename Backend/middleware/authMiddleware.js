// Backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const token = h.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token version
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if token version matches
    if (decoded.tokenVersion !== user.token_version) {
      return res.status(401).json({
        message: "Session expired. Please login again.",
        code: "TOKEN_VERSION_MISMATCH",
      });
    }

    req.user = { id: decoded.id, role: decoded.role };
    req.token = token;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (e.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
