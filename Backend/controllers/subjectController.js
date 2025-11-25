// Backend/controllers/subjectController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";
const TABLE = `${DB}.subjects`;

// allowed sort columns (DB names)
const ALLOWED_SORTS = new Set([
  "subject_allocation_id",
  "subject_name",
  "credit_hours",
  "subject_type",
]);

/**
 * GET /api/subjects
 * Query:
 *   search   - matches subject_name / credit_hours / type
 *   sortBy   - any of ALLOWED_SORTS (default subject_allocation_id)
 *   sortDir  - ASC|DESC (default DESC)
 *   No pagination - returns all entries
 */
export const listSubjects = async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "subject_allocation_id",
      sortDir = "DESC",
    } = req.query;

    const sort = ALLOWED_SORTS.has(sortBy) ? sortBy : "subject_allocation_id";
    const dir = String(sortDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const where = search
      ? `WHERE (
            subject_name LIKE ?
         OR subject_type LIKE ?
         OR credit_hours LIKE ?
        )`
      : "";

    const params = search ? Array(3).fill(`${search}`) : [];

    const [rows] = await sequelize.query(
      `
      SELECT
        subject_allocation_id AS subjectId,
        subject_name          AS subjectName,
        subject_type          AS subjectType,
        credit_hours          AS creditHours
      FROM ${TABLE}
      ${where}
      ORDER BY ${sort} ${dir}
      `,
      { replacements: params }
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("listSubjects error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/subjects/:id
 */
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await sequelize.query(
      `
      SELECT
        subject_allocation_id AS subjectId,
        subject_name          AS subjectName,
        subject_type          AS subjectType,
        credit_hours          AS creditHours
      FROM ${TABLE}
      WHERE subject_allocation_id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getSubjectById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/subjects/upsert
 * Body (from AddSubject.jsx):
 * {
 *   subjectId, subjectName, subjectType, creditHours
 * }
 * If subjectId exists -> UPDATE, else INSERT
 */
export const upsertSubject = async (req, res) => {
  try {
    const { subjectId, subjectName, subjectType, creditHours } = req.body;

    if (!subjectName || !subjectType || !creditHours) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ UPDATE
    if (subjectId) {
      await sequelize.query(
        `
        UPDATE ${TABLE}
        SET 
          subject_name = ?,
          subject_type = ?,
          credit_hours = ?
        WHERE subject_allocation_id = ?
        `,
        {
          replacements: [subjectName, subjectType, creditHours, subjectId],
        }
      );

      return res.status(200).json({ message: "Subject updated successfully" });
    }

    // ✅ INSERT
    await sequelize.query(
      `
      INSERT INTO ${TABLE} (subject_name, subject_type, credit_hours)
      VALUES (?, ?, ?)
      `,
      {
        replacements: [subjectName, subjectType, creditHours],
      }
    );

    res.status(201).json({ message: "Subject added successfully" });
  } catch (error) {
    console.error("upsertSubject error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/subjects/:id
 */
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await sequelize.query(
      `
      DELETE FROM ${TABLE} WHERE subject_allocation_id = ?
      `,
      { replacements: [id] }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("deleteSubject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
