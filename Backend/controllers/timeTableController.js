// Backend/controllers/timeTableController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/**
 * POST /api/timetable/upload
 * Body (multipart/form-data):
 *  - timetable_image (file)
 *  - department (string)
 *  - semester (string)
 *  - year (number | string, e.g. 2025)
 */
export const uploadTimeTable = async (req, res) => {
  try {
    const { department, semester, year } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "timetable_image file is required." });
    }

    if (!department || !semester || !year) {
      return res.status(400).json({
        success: false,
        message: "department, semester and year are required.",
      });
    }

    const yearInt = parseInt(year, 10);
    if (!Number.isInteger(yearInt) || yearInt < 1900 || yearInt > 3000) {
      return res
        .status(400)
        .json({ success: false, message: "year must be a valid 4-digit year." });
    }

    const buffer = req.file.buffer;

    const [result] = await sequelize.query(
      `
      INSERT INTO \`${DB}\`.time_table
        (timetable_image, uploaded_on, department, semester, year)
      VALUES
        (?, NOW(), ?, ?, ?)
      `,
      {
        replacements: [buffer, department, semester, yearInt],
      }
    );

    return res.status(201).json({
      success: true,
      message: "Time table uploaded successfully.",
      data: {
        id: result.insertId,
        department,
        semester,
        year: yearInt,
      },
    });
  } catch (err) {
    console.error("uploadTimeTable error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while uploading file." });
  }
};

/**
 * GET /api/timetable
 * Optional query filters: ?department=...&semester=...&year=...
 * Returns metadata only (no BLOB) for listing.
 */
export const getTimeTables = async (req, res) => {
  try {
    const { department, semester, year } = req.query;

    const where = [];
    const params = [];

    if (department) {
      where.push("department = ?");
      params.push(department);
    }
    if (semester) {
      where.push("semester = ?");
      params.push(semester);
    }
    if (year) {
      where.push("year = ?");
      params.push(year);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await sequelize.query(
      `
      SELECT
        id,
        uploaded_on,
        department,
        semester,
        year
      FROM \`${DB}\`.time_table
      ${whereSql}
      ORDER BY uploaded_on DESC, id DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getTimeTables error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching data." });
  }
};

/**
 * GET /api/timetable/:id
 * Returns a single row meta (no image).
 */
export const getTimeTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await sequelize.query(
      `
      SELECT
        id,
        uploaded_on,
        department,
        semester,
        year
      FROM \`${DB}\`.time_table
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Time table not found." });
    }

    res.json({ success: true, data: row });
  } catch (err) {
    console.error("getTimeTableById error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching row." });
  }
};

/**
 * GET /api/timetable/:id/image
 * Streams the stored BLOB to the client.
 */
export const getTimeTableImage = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await sequelize.query(
      `
      SELECT timetable_image
      FROM \`${DB}\`.time_table
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!row || !row.timetable_image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found." });
    }

    // We don't have mimeType column, so use generic binary
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="timetable-${id}"`);
    res.send(row.timetable_image);
  } catch (err) {
    console.error("getTimeTableImage error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while sending image." });
  }
};

/**
 * DELETE /api/timetable/:id
 * Deletes a time_table row.
 */
export const deleteTimeTable = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await sequelize.query(
      `
      DELETE FROM \`${DB}\`.time_table
      WHERE id = ?
      `,
      { replacements: [id] }
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Time table not found." });
    }

    res.json({ success: true, message: "Time table deleted successfully." });
  } catch (err) {
    console.error("deleteTimeTable error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting row." });
  }
};
