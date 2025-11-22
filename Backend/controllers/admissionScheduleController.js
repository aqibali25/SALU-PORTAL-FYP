// controllers/admissionScheduleController.js
import { sequelize } from "../db.js";

// Calculate status based on start and end dates
const calculateStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "Closed";

  const currentDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set time to beginning of day for accurate comparison
  currentDate.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (currentDate < start) {
    return "Upcoming";
  } else if (currentDate >= start && currentDate <= end) {
    return "Open";
  } else {
    return "Closed";
  }
};

/* ---------------------------- STATUS UPDATE ---------------------------- */
/**
 * PUT /api/admission-schedules/update-status
 * No body required - automatically updates all statuses based on current date
 */
export const updateAdmissionScheduleStatus = async (req, res) => {
  try {
    // First, get all admission schedules
    const schedules = await sequelize.query(
      `SELECT id, start_date, end_date FROM admission_schedule`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!schedules || schedules.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No admission schedules found to update",
        updatedCount: 0,
      });
    }

    let updatedCount = 0;

    // Update status for each record
    for (const schedule of schedules) {
      const newStatus = calculateStatus(schedule.start_date, schedule.end_date);

      await sequelize.query(
        `UPDATE admission_schedule SET status = :status WHERE id = :id`,
        {
          replacements: {
            status: newStatus,
            id: schedule.id,
          },
          type: sequelize.QueryTypes.UPDATE,
        }
      );

      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: "Admission schedule status updated successfully",
      updatedCount: updatedCount,
      totalRecords: schedules.length,
    });
  } catch (err) {
    console.error("updateAdmissionScheduleStatus error:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

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
      status,
    } = req.body;

    if (
      !start_date ||
      !end_date ||
      !admission_form_fee ||
      !admission_year ||
      !shift
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Calculate status automatically if not provided
    const calculatedStatus = status || calculateStatus(start_date, end_date);

    // Insert record
    const [result] = await sequelize.query(
      `
      INSERT INTO admission_schedule 
        (start_date, end_date, admission_form_fee, admission_year, \`Shift\`, status)
      VALUES (:start_date, :end_date, :admission_form_fee, :admission_year, :shift, :status)
      `,
      {
        replacements: {
          start_date,
          end_date,
          admission_form_fee: String(admission_form_fee),
          admission_year: Number(admission_year),
          shift,
          status: calculatedStatus,
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    const insertedId = result;

    // Return newly inserted row
    const [rows] = await sequelize.query(
      `
      SELECT
        id,
        start_date,
        end_date,
        admission_form_fee,
        admission_year,
        \`Shift\` AS shift,
        status
      FROM admission_schedule
      WHERE id = :id
      LIMIT 1
      `,
      {
        replacements: { id: insertedId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      message: "Admission schedule created successfully.",
      data: rows ? rows[0] : null,
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
      status,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Schedule id is required." });
    }

    // Check record exists
    const [exists] = await sequelize.query(
      `SELECT id FROM admission_schedule WHERE id = :id LIMIT 1`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!exists || exists.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Admission schedule not found." });
    }

    // Calculate status automatically if dates are updated
    const calculatedStatus = status || calculateStatus(start_date, end_date);

    // Update record
    await sequelize.query(
      `
      UPDATE admission_schedule
      SET
        start_date         = :start_date,
        end_date           = :end_date,
        admission_form_fee = :admission_form_fee,
        admission_year     = :admission_year,
        \`Shift\`          = :shift,
        status             = :status
      WHERE id = :id
      `,
      {
        replacements: {
          start_date,
          end_date,
          admission_form_fee: String(admission_form_fee),
          admission_year: Number(admission_year),
          shift,
          status: calculatedStatus,
          id,
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Get updated record
    const [rows] = await sequelize.query(
      `
      SELECT
        id,
        start_date,
        end_date,
        admission_form_fee,
        admission_year,
        \`Shift\` AS shift,
        status
      FROM admission_schedule
      WHERE id = :id
      LIMIT 1
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      message: "Admission schedule updated successfully.",
      data: rows ? rows[0] : null,
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
        \`Shift\` AS shift,
        status
      FROM admission_schedule
      WHERE id = :id
      LIMIT 1
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!rows || rows.length === 0) {
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

    let whereClause = "";
    const replacements = {};

    if (year) {
      whereClause += "admission_year = :year";
      replacements.year = Number(year);
    }
    if (shift) {
      whereClause += whereClause ? " AND `Shift` = :shift" : "`Shift` = :shift";
      replacements.shift = shift;
    }

    const where = whereClause ? `WHERE ${whereClause}` : "";

    const rows = await sequelize.query(
      `
      SELECT
        id,
        start_date,
        end_date,
        admission_form_fee,
        admission_year,
        \`Shift\` AS shift,
        status
      FROM admission_schedule
      ${where}
      ORDER BY admission_year DESC, start_date DESC
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Ensure we always return an array
    const data = Array.isArray(rows) ? rows : [];

    res.json({
      success: true,
      total: data.length,
      data: data,
    });
  } catch (err) {
    console.error("getAllAdmissionSchedules error:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
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
      `DELETE FROM admission_schedule WHERE id = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.DELETE,
      }
    );

    if (!result || result.affectedRows === 0) {
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
