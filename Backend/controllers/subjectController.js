// Backend/controllers/subjectController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";
const TABLE = `\`${DB}\`.subjects`;

// allowed sort columns (DB names)
const ALLOWED_SORTS = new Set([
  "subject_allocation_id",
  "subject_name",
  "department",
  "semester",
  "credit_hours",
  "year",
  "subject_type",
]);

/**
 * GET /api/subjects
 * Query:
 *   search   - matches subject_name / department / semester / year / type
 *   sortBy   - any of ALLOWED_SORTS (default subject_allocation_id)
 *   sortDir  - ASC|DESC (default DESC)
 *   page     - default 1
 *   pageSize - default 10 (max 100)
 */
export const listSubjects = async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "subject_allocation_id",
      sortDir = "DESC",
      page = 1,
      pageSize = 10,
    } = req.query;

    const sort = ALLOWED_SORTS.has(sortBy) ? sortBy : "subject_allocation_id";
    const dir = String(sortDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const ps = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const offset = (p - 1) * ps;

    const where = search
      ? `WHERE (subject_name LIKE ? OR department LIKE ? OR semester LIKE ? OR subject_type LIKE ? OR CAST(year AS CHAR) LIKE ?)`
      : "";

    const params = search ? Array(5).fill(`%${search}%`) : [];

    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM ${TABLE} ${where}`,
      { replacements: params }
    );

    const [rows] = await sequelize.query(
      `
      SELECT
        subject_allocation_id AS subjectId,
        subject_name          AS subjectName,
        subject_type          AS subjectType,
        department,
        semester,
        credit_hours          AS creditHours,
        year
      FROM ${TABLE}
      ${where}
      ORDER BY ${sort} ${dir}
      LIMIT ? OFFSET ?
      `,
      { replacements: [...params, ps, offset] }
    );

    res.json({
      success: true,
      total,
      page: p,
      pageSize: ps,
      pageCount: Math.ceil(total / ps),
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
        department,
        semester,
        credit_hours          AS creditHours,
        year
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
 *   subjectId, subjectName, subjectType, department,
 *   semester, creditHours, year
 * }
 * If subjectId exists -> UPDATE, else INSERT
 */
// POST: /api/subjects/upsert
// POST: /api/subjects/upsert
export const upsertSubject = async (req, res) => {
  try {
    const {
      subjectId,
      subjectName,
      subjectType,
      department,
      semester,
      creditHours, // keep string
      year, // keep string
    } = req.body;

    if (
      !subjectName ||
      !subjectType ||
      !department ||
      !semester ||
      !creditHours ||
      !year
    ) {
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
          department = ?,
          semester = ?,
          credit_hours = ?, 
          year = ?
        WHERE subject_allocation_id = ?
        `,
        {
          replacements: [
            subjectName,
            subjectType,
            department,
            semester,
            creditHours,
            year,
            subjectId,
          ],
        }
      );

      return res.status(200).json({ message: "Subject updated successfully" });
    }

    // ✅ INSERT
    await sequelize.query(
      `
      INSERT INTO ${TABLE} (subject_name, subject_type, department, semester, credit_hours, year)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          subjectName,
          subjectType,
          department,
          semester,
          creditHours,
          year,
        ],
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
      `DELETE FROM ${TABLE} WHERE subject_allocation_id = ?`,
      { replacements: [id] }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("deleteSubject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
