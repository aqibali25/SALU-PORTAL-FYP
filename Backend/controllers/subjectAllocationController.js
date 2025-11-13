// Backend/controllers/subjectAllocationController.js
import { sequelize } from "../db.js";
const DB = process.env.DB_NAME || "u291434058_SALU_GC";
const TABLE = `\`${DB}\`.subject_allocation`;

// ---- Helpers ----
const ALLOWED_SORTS = new Set([
  "sa_id",
  "subject_name",
  "teacher_name",
  "department",
  "semester",
  "credit_hours",
  "year",
  "created_at",
  "updated_at",
]);

const toSnake = (k) =>
  ({
    saId: "sa_id",
    subName: "subject_name",
    teacherName: "teacher_name",
    creditHours: "credit_hours",
  }[k] || k);

// ----------------- LIST (ALL ENTRIES) -----------------
export const listSubjectAllocations = async (req, res) => {
  try {
    const { search = "", sortBy = "created_at", sortDir = "DESC" } = req.query;

    const sortCol = ALLOWED_SORTS.has(sortBy) ? sortBy : "created_at";
    const dir = String(sortDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const where = search
      ? `WHERE (subject_name LIKE ? OR teacher_name LIKE ? OR department LIKE ? OR semester LIKE ? OR CAST(year AS CHAR) LIKE ?)`
      : "";
    const params = search ? Array(5).fill(`%${search}%`) : [];

    const [rows] = await sequelize.query(
      `SELECT
         sa_id        AS saId,
         subject_name AS subName,
         teacher_name AS teacherName,
         department,
         semester,
         credit_hours AS creditHours,
         year,
         created_at   AS createdAt,
         updated_at   AS updatedAt
       FROM ${TABLE}
       ${where}
       ORDER BY ${sortCol} ${dir}`,
      { replacements: params }
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("listSubjectAllocations error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- GET ONE -----------------
export const getSubjectAllocation = async (req, res) => {
  try {
    const { saId } = req.params;
    if (!saId)
      return res
        .status(400)
        .json({ success: false, message: "saId is required" });

    const [rows] = await sequelize.query(
      `SELECT
         sa_id        AS saId,
         subject_name AS subName,
         teacher_name AS teacherName,
         department,
         semester,
         credit_hours AS creditHours,
         year,
         created_at   AS createdAt,
         updated_at   AS updatedAt
       FROM ${TABLE}
       WHERE sa_id = ?
       LIMIT 1`,
      { replacements: [saId] }
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getSubjectAllocation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- CREATE -----------------
export const createSubjectAllocation = async (req, res) => {
  try {
    const { subName, teacherName, department, semester, creditHours, year } =
      req.body;

    if (!subName || !department || !semester || !creditHours || !year) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const creditHoursNum = Number(creditHours);
    const yearNum = Number(year);

    if (isNaN(creditHoursNum) || creditHoursNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Credit Hours must be a valid number.",
      });
    }
    if (isNaN(yearNum) || yearNum <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Year must be a valid number." });
    }

    const [result] = await sequelize.query(
      `INSERT INTO ${TABLE} 
       (subject_name, teacher_name, department, semester, credit_hours, year, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          subName,
          teacherName || "",
          department,
          semester,
          creditHoursNum,
          yearNum,
        ],
      }
    );

    const saId = result?.insertId || null;

    res.status(200).json({
      success: true,
      message: "Subject allocated successfully.",
      data: {
        saId,
        subName,
        teacherName: teacherName || "",
        department,
        semester,
        creditHours: creditHoursNum,
        year: yearNum,
      },
    });
  } catch (err) {
    console.error("❌ Error in createSubjectAllocation:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while allocating subject.",
      error: err.message,
    });
  }
};

// ----------------- UPDATE -----------------
export const updateSubjectAllocation = async (req, res) => {
  try {
    const { saId } = req.params;
    if (!saId)
      return res
        .status(400)
        .json({ success: false, message: "saId is required" });

    const fields = [
      "subName",
      "teacherName",
      "department",
      "semester",
      "creditHours",
      "year",
    ];
    const updates = [];
    const params = [];

    fields.forEach((k) => {
      if (req.body[k] !== undefined) {
        if (k === "creditHours" || k === "year")
          params.push(Number(req.body[k]));
        else params.push(req.body[k]);
        updates.push(`${toSnake(k)} = ?`);
      }
    });

    if (!updates.length)
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });

    params.push(saId);

    await sequelize.query(
      `UPDATE ${TABLE} SET ${updates.join(
        ", "
      )}, updated_at = NOW() WHERE sa_id = ?`,
      { replacements: params }
    );

    const [rows] = await sequelize.query(
      `SELECT
         sa_id        AS saId,
         subject_name AS subName,
         teacher_name AS teacherName,
         department,
         semester,
         credit_hours AS creditHours,
         year,
         created_at   AS createdAt,
         updated_at   AS updatedAt
       FROM ${TABLE}
       WHERE sa_id = ?
       LIMIT 1`,
      { replacements: [saId] }
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("updateSubjectAllocation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- DELETE -----------------
export const deleteSubjectAllocation = async (req, res) => {
  try {
    const { saId } = req.params;
    await sequelize.query(`DELETE FROM ${TABLE} WHERE sa_id = ?`, {
      replacements: [saId],
    });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteSubjectAllocation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
