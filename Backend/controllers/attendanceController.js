// Backend/controllers/attendanceController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/* =======================================================================
   1) CREATE attendance record(s)
   ======================================================================= */
/**
 * POST /api/attendance
 * Body can be one object or an array of objects:
 * {
 *   subject_name: "Database Systems",
 *   roll_no: "CS-23-045",
 *   department: "Computer Science",
 *   attendance_date: "2025-11-14",
 *   status: "Present"   // Present | Absent | Leave
 * }
 */
export const createAttendance = async (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : [req.body];
    if (!records.length) {
      return res
        .status(400)
        .json({ success: false, message: "No records provided." });
    }

    const validStatuses = ["Present", "Absent", "Leave"];
    let insertedCount = 0;

    for (const rec of records) {
      const {
        subject_name,
        roll_no,
        department,
        attendance_date,
        status,
      } = rec || {};

      if (
        !subject_name ||
        !roll_no ||
        !department ||
        !attendance_date ||
        !status
      ) {
        continue; // skip invalid rows silently
      }
      if (!validStatuses.includes(status)) continue;

      await sequelize.query(
        `
        INSERT INTO \`${DB}\`.mark_attendance
          (attendance_date, status, subject_name, roll_no, department)
        VALUES (?, ?, ?, ?, ?)
        `,
        {
          replacements: [
            attendance_date,
            status,
            subject_name,
            roll_no,
            department,
          ],
        }
      );
      insertedCount++;
    }

    res.json({
      success: true,
      message: `${insertedCount} attendance record(s) saved successfully.`,
    });
  } catch (err) {
    console.error("createAttendance error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =======================================================================
   2) GET attendance (all / filters)
   ======================================================================= */
/**
 * GET /api/attendance
 * Optional query params:
 *   ?subject_name=...&roll_no=...&department=...&date=YYYY-MM-DD
 */
export const getAttendance = async (req, res) => {
  try {
    const { subject_name, roll_no, department, date } = req.query;

    const filters = [];
    const params = [];

    if (subject_name) {
      filters.push("a.subject_name = ?");
      params.push(subject_name);
    }
    if (roll_no) {
      filters.push("a.roll_no = ?");
      params.push(roll_no);
    }
    if (department) {
      filters.push("a.department = ?");
      params.push(department);
    }
    if (date) {
      filters.push("a.attendance_date = ?");
      params.push(date);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [rows] = await sequelize.query(
      `
      SELECT
        a.attendance_id,
        a.attendance_date,
        a.status,
        a.subject_name,
        a.roll_no,
        a.department
      FROM \`${DB}\`.mark_attendance a
      ${whereClause}
      ORDER BY a.attendance_date DESC, a.attendance_id DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getAttendance error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =======================================================================
   3) UPDATE attendance record
   ======================================================================= */
/**
 * PUT /api/attendance/:attendance_id
 * Body (any of these—commonly you'll change status):
 *   { status: "Absent" }  // Present | Absent | Leave
 *   { subject_name, roll_no, department, attendance_date } // optional edits
 */
export const updateAttendance = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const {
      status,
      subject_name,
      roll_no,
      department,
      attendance_date,
    } = req.body || {};

    if (!attendance_id) {
      return res
        .status(400)
        .json({ success: false, message: "attendance_id required." });
    }

    const fields = [];
    const params = [];

    if (status !== undefined) {
      const validStatuses = ["Present", "Absent", "Leave"];
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value." });
      }
      fields.push("status = ?");
      params.push(status);
    }
    if (subject_name !== undefined) {
      fields.push("subject_name = ?");
      params.push(subject_name);
    }
    if (roll_no !== undefined) {
      fields.push("roll_no = ?");
      params.push(roll_no);
    }
    if (department !== undefined) {
      fields.push("department = ?");
      params.push(department);
    }
    if (attendance_date !== undefined) {
      fields.push("attendance_date = ?");
      params.push(attendance_date);
    }

    if (!fields.length) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update." });
    }

    params.push(attendance_id);

    const [result] = await sequelize.query(
      `
      UPDATE \`${DB}\`.mark_attendance
      SET ${fields.join(", ")}
      WHERE attendance_id = ?
      `,
      { replacements: params }
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found." });
    }

    res.json({ success: true, message: "Attendance updated successfully." });
  } catch (err) {
    console.error("updateAttendance error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
