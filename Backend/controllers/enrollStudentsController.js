// Backend/controllers/enrollStudentsController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";
const TABLE = `\`${DB}\`.enroll_students`;

/**
 * GET /api/enroll-students
 * Optional query: ?status=Pending|Approved|Rejected
 */
export const getAllEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? "WHERE form_status = ?" : "";
    const params = status ? [status] : [];

    const [rows] = await sequelize.query(
      `
      SELECT
        enroll_id AS enrollId,
        cnic,
        form_status AS formStatus,
        entry_test_obtained_marks AS entryTestObtained,
        entry_test_total_marks AS entryTestTotal,
        entry_test_percentage AS entryTestPercentage,
        total_percentage AS totalPercentage,
        merit_list AS meritList,
        department,
        fee_paid AS feePaid
      FROM ${TABLE}
      ${where}
      ORDER BY enroll_id DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getAllEnrollments error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/enroll-students/:id
 * Fetch one enrollment record
 */
export const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        enroll_id AS enrollId,
        cnic,
        form_status AS formStatus,
        entry_test_obtained_marks AS entryTestObtained,
        entry_test_total_marks AS entryTestTotal,
        entry_test_percentage AS entryTestPercentage,
        total_percentage AS totalPercentage,
        merit_list AS meritList,
        department,
        fee_paid AS feePaid
      FROM ${TABLE}
      WHERE enroll_id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Record not found" });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getEnrollmentById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/enroll-students/marks
 * Used by EnterStdMarks.jsx to save marks
 * Body: {
 *   cnic, entry_test_obtained_marks, entry_test_total_marks,
 *   entry_test_percentage, total_percentage
 * }
 */
export const saveStudentMarks = async (req, res) => {
  try {
    const {
      cnic,
      entry_test_obtained_marks,
      entry_test_total_marks,
      entry_test_percentage,
      total_percentage,
    } = req.body;

    if (!cnic) {
      return res.status(400).json({ success: false, message: "CNIC required" });
    }

    // Check if record exists
    const [[existing]] = await sequelize.query(
      `SELECT enroll_id FROM ${TABLE} WHERE cnic = ? LIMIT 1`,
      { replacements: [cnic] }
    );

    if (existing) {
      // ✅ Update existing record
      await sequelize.query(
        `
        UPDATE ${TABLE}
        SET entry_test_obtained_marks = ?,
            entry_test_total_marks = ?,
            entry_test_percentage = ?,
            total_percentage = ?,
            updated_at = NOW()
        WHERE cnic = ?
        `,
        {
          replacements: [
            entry_test_obtained_marks,
            entry_test_total_marks,
            entry_test_percentage,
            total_percentage,
            cnic,
          ],
        }
      );
    } else {
      // ✅ Insert new record
      await sequelize.query(
        `
        INSERT INTO ${TABLE}
          (cnic, form_status, entry_test_obtained_marks,
           entry_test_total_marks, entry_test_percentage,
           total_percentage, merit_list, department, fee_paid)
        VALUES (?, 'Pending', ?, ?, ?, ?, '', '', 'No')
        `,
        {
          replacements: [
            cnic,
            entry_test_obtained_marks,
            entry_test_total_marks,
            entry_test_percentage,
            total_percentage,
          ],
        }
      );
    }

    res.json({ success: true, message: "Marks saved successfully" });
  } catch (err) {
    console.error("saveStudentMarks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PATCH /api/enroll-students/:id/status
 * Update form status or fee paid
 * Body: { form_status, fee_paid }
 */
export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { form_status, fee_paid } = req.body;

    const updates = [];
    const params = [];

    if (form_status) {
      updates.push("form_status = ?");
      params.push(form_status);
    }
    if (fee_paid) {
      updates.push("fee_paid = ?");
      params.push(fee_paid);
    }

    if (!updates.length)
      return res.status(400).json({ success: false, message: "No fields to update" });

    params.push(id);

    await sequelize.query(
      `
      UPDATE ${TABLE}
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE enroll_id = ?
      `,
      { replacements: params }
    );

    res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    console.error("updateEnrollmentStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
