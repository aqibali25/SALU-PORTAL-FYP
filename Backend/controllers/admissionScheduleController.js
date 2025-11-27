// controllers/admissionScheduleController.js
import { sequelize } from "../db.js";

// Calculate status based on start and end dates
const calculateStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "Closed";

  const currentDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  currentDate.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (currentDate < start) return "Upcoming";
  if (currentDate >= start && currentDate <= end) return "Open";
  return "Closed";
};

/* ---------------------------- STATUS UPDATE ---------------------------- */
export const updateAdmissionScheduleStatus = async (req, res) => {
  try {
    const schedules = await sequelize.query(
      `SELECT id, start_date, end_date FROM admission_schedule`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!schedules.length) {
      return res.status(200).json({
        success: true,
        message: "No admission schedules found to update",
        updatedCount: 0,
      });
    }

    let updatedCount = 0;
    for (const schedule of schedules) {
      const newStatus = calculateStatus(schedule.start_date, schedule.end_date);

      await sequelize.query(
        `UPDATE admission_schedule SET status = :status WHERE id = :id`,
        {
          replacements: { status: newStatus, id: schedule.id },
          type: sequelize.QueryTypes.UPDATE,
        }
      );
      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: "Admission schedule status updated successfully",
      updatedCount,
      totalRecords: schedules.length,
    });
  } catch (err) {
    console.error("updateAdmissionScheduleStatus error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

/* ---------------------------- CREATE ---------------------------- */
export const createAdmissionSchedule = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      admission_form_fee,
      admission_year,
      shift,
      status,
      test_date,
      reporting_time,
      test_time,
      test_venue,
      test_total_marks,
      test_passing_marks
    } = req.body;

    if (!start_date || !end_date || !admission_form_fee || !admission_year || !shift) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const calculatedStatus = status || calculateStatus(start_date, end_date);

    const [result] = await sequelize.query(
      `
      INSERT INTO admission_schedule 
      (
        start_date, end_date, admission_form_fee, admission_year, \`Shift\`, status,
        test_date, reporting_time, test_time, test_venue, test_total_marks, test_passing_marks
      )
      VALUES 
      (
        :start_date, :end_date, :admission_form_fee, :admission_year, :shift, :status,
        :test_date, :reporting_time, :test_time, :test_venue, :test_total_marks, :test_passing_marks
      )
      `,
      {
        replacements: {
          start_date,
          end_date,
          admission_form_fee: String(admission_form_fee),
          admission_year: Number(admission_year),
          shift,
          status: calculatedStatus,
          test_date,
          reporting_time,
          test_time,
          test_venue,
          test_total_marks,
          test_passing_marks
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    const insertedId = result;

    const [rows] = await sequelize.query(
      `
      SELECT
        id, start_date, end_date, admission_form_fee, admission_year,
        \`Shift\` AS shift, status,
        test_date, reporting_time, test_time, test_venue, test_total_marks, test_passing_marks
      FROM admission_schedule
      WHERE id = :id LIMIT 1
      `,
      { replacements: { id: insertedId }, type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      message: "Admission schedule created successfully.",
      data: rows || null,
    });
  } catch (err) {
    console.error("createAdmissionSchedule error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

/* ----------------------------- UPDATE --------------------------- */
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
      test_date,
      reporting_time,
      test_time,
      test_venue,
      test_total_marks,
      test_passing_marks
    } = req.body;

    if (!id)
      return res.status(400).json({ success: false, message: "Schedule id is required." });

    const [exists] = await sequelize.query(
      `SELECT id FROM admission_schedule WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );

    if (!exists)
      return res.status(404).json({ success: false, message: "Admission schedule not found." });

    const calculatedStatus = status || calculateStatus(start_date, end_date);

    await sequelize.query(
      `
      UPDATE admission_schedule SET
        start_date = :start_date,
        end_date = :end_date,
        admission_form_fee = :admission_form_fee,
        admission_year = :admission_year,
        \`Shift\` = :shift,
        status = :status,
        test_date = :test_date,
        reporting_time = :reporting_time,
        test_time = :test_time,
        test_venue = :test_venue,
        test_total_marks = :test_total_marks,
        test_passing_marks = :test_passing_marks
      WHERE id = :id
      `,
      {
        replacements: {
          start_date,
          end_date,
          admission_form_fee,
          admission_year,
          shift,
          status: calculatedStatus,
          test_date,
          reporting_time,
          test_time,
          test_venue,
          test_total_marks,
          test_passing_marks,
          id
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    const [rows] = await sequelize.query(
      `
      SELECT
        id, start_date, end_date, admission_form_fee, admission_year, \`Shift\` AS shift, status,
        test_date, reporting_time, test_time, test_venue, test_total_marks, test_passing_marks
      FROM admission_schedule
      WHERE id = :id LIMIT 1
      `,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      message: "Admission schedule updated successfully.",
      data: rows || null,
    });
  } catch (err) {
    console.error("updateAdmissionSchedule error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

/* ----------------------------- GET ONE -------------------------- */
export const getAdmissionScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        id, start_date, end_date, admission_form_fee, admission_year,
        \`Shift\` AS shift, status,
        test_date, reporting_time, test_time, test_venue, test_total_marks, test_passing_marks
      FROM admission_schedule
      WHERE id = :id LIMIT 1
      `,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );

    if (!rows)
      return res.status(404).json({ success: false, message: "Admission schedule not found." });

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getAdmissionScheduleById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------- GET ALL -------------------------- */
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
        id, start_date, end_date, admission_form_fee, admission_year,
        \`Shift\` AS shift, status,
        test_date, reporting_time, test_time, test_venue, test_total_marks, test_passing_marks
      FROM admission_schedule
      ${where}
      ORDER BY admission_year DESC, start_date DESC
      `,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getAllAdmissionSchedules error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------- DELETE --------------------------- */
export const deleteAdmissionSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await sequelize.query(
      `DELETE FROM admission_schedule WHERE id = :id`,
      { replacements: { id }, type: sequelize.QueryTypes.DELETE }
    );

    res.json({
      success: true,
      message: "Admission schedule deleted successfully.",
    });
  } catch (err) {
    console.error("deleteAdmissionSchedule error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
