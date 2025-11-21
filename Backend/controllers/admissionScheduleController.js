// controllers/admissionScheduleController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";
const TABLE = `\`${DB}\`.admission_schedule`;

/* ---------------------------- CREATE ---------------------------- */
/**
 * POST /api/admission-schedules/create
 * Body: { start_date, end_date, admission_form_fee, admission_year, shift }
 */
export const createAdmissionSchedule = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      admission_form_fee,
      admission_year,
      shift,
    } = req.body;

    if (!start_date || !end_date || !admission_form_fee || !admission_year || !shift) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Insert record
    const [result] = await sequelize.query(
      `
      INSERT INTO ${TABLE}
        (start_date, end_date, admission_form_fee, admission_year, \`Shift\`)
      VALUES (?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          start_date,
          end_date,
          String(admission_form_fee),
          Number(admission_year),
          shift,
        ],
      }
    );

    const insertedId = result.insertId;

    // Return newly inserted row
    const [[row]] = await sequelize.query(
      `
      SELECT
        id,
        start_date,
        end_date,
        admission_form_fee,
        admission_year,
        \`Shift\` AS shift
      FROM ${TABLE}
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [insertedId] }
    );

    res.json({
      success: true,
      message: "Admission schedule created successfully.",
      data: row,
    });
  } catch (err) {
    console.error("createAdmissionSchedule error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

/* ----------------------------- UPDATE --------------------------- */
/**
 * PUT /api/admission-schedules/update
 * Body: { id, start_date, end_date, admission_form_fee, admission_year, shift }
 */
export const updateAdmissionSchedule = async (req, res) => {
  try {
    const {
      id,
      start_date,
      end_date,
      admission_form_fee,
      admission_year,
      shift,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Schedule id is required." });
    }

    // Check record exists
    const [[exists]] = await sequelize.query(
      `SELECT id FROM ${TABLE} WHERE id = ? LIMIT 1`,
      { replacements: [id] }
    );

    if (!exists) {
      return res
        .status(404)
        .json({ success: false, message: "Admission schedule not found." });
    }

    // Simple full update (FE already validates)
    await sequelize.query(
      `
      UPDATE ${TABLE}
      SET
        start_date         = ?,
        end_date           = ?,
        admission_form_fee = ?,
        admission_year     = ?,
        \`Shift\`          = ?
      WHERE id = ?
      `,
      {
        replacements: [
          start_date,
          end_date,
          String(admission_form_fee),
          Number(admission_year),
          shift,
          id,
        ],
      }
    );

    const [[row]] = await sequelize.query(
      `
      SELECT
        id,
        start_date,
        end_date,
        admission_form_fee,
        admission_year,
        \`Shift\` AS shift
      FROM ${TABLE}
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    res.json({
      success: true,
      message: "Admission schedule updated successfully.",
      data: row,
    });
  } catch (err) {
    console.error("updateAdmissionSchedule error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

/* ----------------------------- GET ONE -------------------------- */
/**
 * GET /api/admission-schedules/:id
 */
export const getAdmissionScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        id,
        start_date,
        end_date,
        admission_form_fee,
        admission_year,
        \`Shift\` AS shift
      FROM ${TABLE}
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Admission schedule not found." });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getAdmissionScheduleById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------- GET ALL -------------------------- */
/**
 * GET /api/admission-schedules
 * Optional query:
 *   year  -> filter by admission_year
 *   shift -> filter by Shift
 */
export const getAllAdmissionSchedules = async (req, res) => {
  try {
    const { year, shift } = req.query;

    const conditions = [];
    const params = [];

    if (year) {
      conditions.push("admission_year = ?");
      params.push(Number(year));
    }
    if (shift) {
      conditions.push("`Shift` = ?");
      params.push(shift);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await sequelize.query(
      `
      SELECT
        id,
        start_date,
        end_date,
        admission_form_fee,
        admission_year,
        \`Shift\` AS shift
      FROM ${TABLE}
      ${where}
      ORDER BY admission_year DESC, start_date DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getAllAdmissionSchedules error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------- DELETE --------------------------- */
/**
 * DELETE /api/admission-schedules/:id
 */
export const deleteAdmissionSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await sequelize.query(
      `DELETE FROM ${TABLE} WHERE id = ?`,
      { replacements: [id] }
    );

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Admission schedule not found." });
    }

    res.json({
      success: true,
      message: "Admission schedule deleted successfully.",
    });
  } catch (err) {
    console.error("deleteAdmissionSchedule error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
