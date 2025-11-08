// Backend/models/User.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    cnic: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM(
        "superadmin",
        "admin",
        "examination officer",
        "hod",
        "focal person admin",
        "focal person teacher",
        "teacher",
        "transport incharge",
        "librarian",
        "clerk",
        "peon"
      ),
      defaultValue: "user",
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);
