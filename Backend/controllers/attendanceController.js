// Backend/controllers/attendanceController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";


   //CREATE attendance record(s)

export const createAttendance = async (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : [req.body];

    if (!records.length)
      return res.status(400).json({ success: false, message: "No records provided." });

    const validStatuses = ["Present", "Absent", "Leave"];
    let insertedCount = 0;

    for (const rec of records) {
      const {
        subject_id,
        student_id,
        attendance_date,
        status,
        remarks,
        class_time,
      } = rec;

      if (!subject_id || !student_id || !attendance_date || !status)
        continue;

      if (!validStatuses.includes(status))
        continue;

      await sequelize.query(
        `
        INSERT INTO \`${DB}\`.mark_attendance
          (subject_id, student_id, attendance_date, status, remarks, class_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        {
          replacements: [
            subject_id,
            student_id,
            attendance_date,
            status,
            remarks || "",
            class_time || null,
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


   //GET attendance (all / filters)
   
export const getAttendance = async (req, res) => {
  try {
    const { subject_id, student_id, date } = req.query;

    const filters = [];
    const params = [];

    if (subject_id) {
      filters.push("a.subject_id = ?");
      params.push(subject_id);
    }
    if (student_id) {
      filters.push("a.student_id = ?");
      params.push(student_id);
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
        a.subject_id,
        a.student_id,
        a.attendance_date,
        a.status,
        a.remarks,
        a.class_time,
        a.created_at,
        a.updated_at
      FROM \`${DB}\`.mark_attendance a
      ${whereClause}
      ORDER BY a.attendance_date DESC, a.class_time DESC
      `,
      { replacements: params }
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getAttendance error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


   //UPDATE attendance record
 
export const updateAttendance = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { status, remarks } = req.body;

    if (!attendance_id)
      return res.status(400).json({ success: false, message: "attendance_id required." });

    const validStatuses = ["Present", "Absent", "Leave"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const fields = [];
    const params = [];

    if (status) {
      fields.push("status = ?");
      params.push(status);
    }
    if (remarks) {
      fields.push("remarks = ?");
      params.push(remarks);
    }

    if (!fields.length)
      return res.status(400).json({ success: false, message: "Nothing to update." });

    params.push(attendance_id);

    const [result] = await sequelize.query(
      `
      UPDATE \`${DB}\`.mark_attendance
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE attendance_id = ?
      `,
      { replacements: params }
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Record not found." });

    res.json({ success: true, message: "Attendance updated successfully." });
  } catch (err) {
    console.error("updateAttendance error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
