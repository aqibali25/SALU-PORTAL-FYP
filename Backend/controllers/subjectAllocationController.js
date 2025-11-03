// Backend/controllers/subjectAllocationController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";
const TABLE = `\`${DB}\`.subject_allocation`;

// ---- Helpers ----
const ALLOWED_SORTS = new Set([
  "sa_id",
  "sub_name",
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
    subName: "sub_name",
    teacherName: "teacher_name",
    creditHours: "credit_hours",
  }[k] || k);

// ----------------- LIST (with search, sort, pagination) -----------------
/**
 * GET /api/subject-allocations
 * Query params:
 *  - search: string (matches sub_name, teacher_name, department, semester, year)
 *  - sortBy: one of sa_id, sub_name, teacher_name, department, semester, credit_hours, year, created_at, updated_at
 *  - sortDir: ASC|DESC (default DESC for created_at, else ASC)
 *  - page: 1-based (default 1)
 *  - pageSize: default 10
 */
export const listSubjectAllocations = async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "created_at",
      sortDir = "DESC",
      page = 1,
      pageSize = 10,
    } = req.query;

    const sortCol = ALLOWED_SORTS.has(sortBy) ? sortBy : "created_at";
    const dir = String(sortDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const ps = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const offset = (p - 1) * ps;

    const where = search
      ? `WHERE (sub_name LIKE ? OR teacher_name LIKE ? OR department LIKE ? OR semester LIKE ? OR CAST(year AS CHAR) LIKE ?)`
      : "";

    const params = search ? Array(5).fill(`%${search}%`) : [];

    // Count
    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM ${TABLE} ${where}`,
      { replacements: params }
    );

    // Rows
    const [rows] = await sequelize.query(
      `
      SELECT
        sa_id        AS saId,
        subject_name     AS subName,
        teacher_name AS teacherName,
        department,
        semester,
        credit_hours AS creditHours,
        year,
        created_at   AS createdAt,
        updated_at   AS updatedAt
      FROM ${TABLE}
      ${where}
      ORDER BY ${sortCol} ${dir}
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
    console.error("listSubjectAllocations error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- GET ONE -----------------
/**
 * GET /api/subject-allocations/:saId
 */
export const getSubjectAllocation = async (req, res) => {
  try {
    const { saId } = req.params;
    const [rows] = await sequelize.query(
      `
      SELECT
        sa_id        AS saId,
        subject_name     AS subName,
        teacher_name AS teacherName,
        department,
        semester,
        credit_hours AS creditHours,
        year,
        created_at   AS createdAt,
        updated_at   AS updatedAt
      FROM ${TABLE}
      WHERE sa_id = ?
      LIMIT 1
      `,
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
/**
 * POST /api/subject-allocations
 * Body: { subName, teacherName, department, semester, creditHours, year }
 * Note: `teacherName` can be "Yet to assign" initially to match UI.
 */
export const createSubjectAllocation = async (req, res) => {
  try {
    const {
      subName,
      teacherName = "Yet to assign",
      department,
      semester,
      creditHours,
      year,
    } = req.body;

    if (!subName || !department || !semester || !creditHours || !year) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const [result] = await sequelize.query(
      `
      INSERT INTO ${TABLE}
        (sub_name, teacher_name, department, semester, credit_hours, year, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      {
        replacements: [
          subName,
          teacherName,
          department,
          semester,
          creditHours,
          year,
        ],
      }
    );

    const saId = result.insertId;
    return getSubjectAllocation({ params: { saId } }, res); // reuse reader
  } catch (err) {
    console.error("createSubjectAllocation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- UPDATE (Assign/Reassign Teacher or any field) -----------------
/**
 * PUT /api/subject-allocations/:saId
 * Body may include any of:
 *  { subName, teacherName, department, semester, creditHours, year }
 */
export const updateSubjectAllocation = async (req, res) => {
  try {
    const { saId } = req.params;
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
        updates.push(`${toSnake(k)} = ?`);
        params.push(req.body[k]);
      }
    });

    if (!updates.length) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    params.push(saId);

    await sequelize.query(
      `
      UPDATE ${TABLE}
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE sa_id = ?
      `,
      { replacements: params }
    );

    return getSubjectAllocation({ params: { saId } }, res);
  } catch (err) {
    console.error("updateSubjectAllocation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- DELETE -----------------
/**
 * DELETE /api/subject-allocations/:saId
 */
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
