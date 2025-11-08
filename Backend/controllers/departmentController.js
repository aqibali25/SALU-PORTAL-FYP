import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";
const TABLE = `\`${DB}\`.departments`;

// allowed sort columns (DB names) - updated to match your actual columns
const ALLOWED_SORTS = new Set(["id", "department_name"]);

/**
 * GET /api/departments
 * Query:
 *   search   - matches department_name
 *   sortBy   - any of ALLOWED_SORTS (default id)
 *   sortDir  - ASC|DESC (default DESC)
 *   page     - default 1
 *   pageSize - default 10 (max 100)
 */
export const listDepartments = async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "id",
      sortDir = "DESC",
      page = 1,
      pageSize = 10,
    } = req.query;

    const sort = ALLOWED_SORTS.has(sortBy) ? sortBy : "id";
    const dir = String(sortDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const ps = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const offset = (p - 1) * ps;

    const where = search ? `WHERE (department_name LIKE ?)` : "";

    const params = search ? [`%${search}%`] : [];

    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM ${TABLE} ${where}`,
      { replacements: params }
    );

    const [rows] = await sequelize.query(
      `
      SELECT
        id AS departmentId,
        department_name AS departmentName
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
    console.error("listDepartments error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/departments/:id
 */
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await sequelize.query(
      `
      SELECT
        id AS departmentId,
        department_name AS departmentName
      FROM ${TABLE}
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getDepartmentById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/departments/upsert
 * Body:
 * {
 *   departmentId, departmentName
 * }
 * If departmentId exists -> UPDATE, else INSERT
 */
export const upsertDepartment = async (req, res) => {
  try {
    const { departmentId, departmentName } = req.body;

    if (!departmentName) {
      return res.status(400).json({ message: "Department name is required" });
    }

    // ✅ UPDATE
    if (departmentId) {
      await sequelize.query(
        `
        UPDATE ${TABLE}
        SET 
          department_name = ?
        WHERE id = ?
        `,
        {
          replacements: [departmentName, departmentId],
        }
      );

      return res
        .status(200)
        .json({ message: "Department updated successfully" });
    }

    // ✅ INSERT
    await sequelize.query(
      `
      INSERT INTO ${TABLE} (department_name)
      VALUES (?)
      `,
      {
        replacements: [departmentName],
      }
    );

    res.status(201).json({ message: "Department added successfully" });
  } catch (error) {
    console.error("upsertDepartment error:", error);

    // Handle duplicate entry error
    if (error.original?.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Department name already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/departments/:id
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const [rows] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM ${TABLE} WHERE id = ?`,
      { replacements: [id] }
    );

    if (rows[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await sequelize.query(`DELETE FROM ${TABLE} WHERE id = ?`, {
      replacements: [id],
    });

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (err) {
    console.error("deleteDepartment error:", err);

    // Handle foreign key constraint error
    if (err.original?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete department. It is being used by other records.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
