// Backend/controllers/admissionController.js
import { sequelize } from "../db.js";

/** Schema name from .env or fallback */
const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/* -------------------------------- Helpers --------------------------------- */
// Map any incoming status (case-insensitive) to your DB enum exactly
const mapStatusToEnum = (status) => {
  const s = String(status || "")
    .toLowerCase()
    .trim();
  const statusMap = {
    pending: "Pending",
    approved: "Approved",
    revert: "Revert",
    trash: "Trash",
    appeared: "Appeared",
    "not appeared": "Not Appeared",
    passed: "Passed",
    failed: "Failed",
    selected: "Selected",
    enrolled: "Enrolled",
  };
  return statusMap[s] || "Pending";
};

/* =============================== Documents ================================= */
/** GET /api/admissions/viewDocument/:id  -> stream BLOB inline */
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `SELECT fileName, fileData, mimeType
       FROM \`${DB}\`.uploaded_docs
       WHERE id = ?`,
      { replacements: [id] }
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }

    const doc = rows[0];
    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${doc.fileName}"`);
    res.setHeader("Content-Length", doc.fileData.length);
    res.send(doc.fileData);
  } catch (err) {
    console.error("viewDocument error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ============================ List Admissions ============================== */
/** GET /api/admissions?status=... */
export const getAllAdmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? "WHERE p.form_status = ?" : "";
    const params = status ? [status] : [];

    const [rows] = await sequelize.query(
      `
      SELECT
        p.id AS form_id,
        CONCAT(p.first_name, ' ', p.last_name) AS student_name,
        p.cnic AS cnic,
        p.roll_no,
        p.cgpa,
        p.form_status AS status,
        f.name AS father_name,
        g.name AS guardian_name,
        pos.applied_department AS department
      FROM \`${DB}\`.personal_info p
      LEFT JOIN \`${DB}\`.father_info      f ON f.cnic = p.cnic
      LEFT JOIN \`${DB}\`.guardian_info    g ON g.cnic = p.cnic
      LEFT JOIN \`${DB}\`.program_of_study pos ON pos.cnic = p.cnic
      ${where}
      ORDER BY p.id DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getAllAdmissions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================= Admission Detail ============================ */
/** GET /api/admissions/:id  (:id = personal_info.id) */
export const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        p.id AS form_id, p.cnic, p.first_name, p.last_name, p.gender, p.dob,
        p.religion, p.disability, p.disability_description, p.native_language,
        p.blood_group, p.province, p.city, p.postal_address, p.permanent_address,
        p.remarks, p.roll_no, p.form_status, p.cgpa,

        f.name AS father_name, f.cnic_number AS father_cnic_number,
        f.mobile_number AS father_mobile, f.occupation AS father_occupation,

        g.name AS guardian_name, g.cnic_number AS guardian_cnic_number,
        g.mobile_number AS guardian_mobile, g.occupation AS guardian_occupation,

        pos.applied_department, pos.first_choice, pos.second_choice, pos.third_choice,

        m.group_name AS matric_group_name, m.degree_year AS matric_degree_year,
        m.seat_no AS matric_seat_no, m.institution_name AS matric_institution_name,
        m.board AS matric_board, m.total_marks AS matric_total_marks,
        m.marks_obtained AS matric_marks_obtained, m.percentage AS matric_percentage,

        i.group_name AS inter_group_name, i.degree_year AS inter_degree_year,
        i.seat_no AS inter_seat_no, i.institution_name AS inter_institution_name,
        i.board AS inter_board, i.total_marks AS inter_total_marks,
        i.marks_obtained AS inter_marks_obtained, i.percentage AS inter_percentage

      FROM \`${DB}\`.personal_info p
      LEFT JOIN \`${DB}\`.father_info f   ON f.cnic = p.cnic
      LEFT JOIN \`${DB}\`.guardian_info g ON g.cnic = p.cnic
      LEFT JOIN \`${DB}\`.program_of_study pos ON pos.cnic = p.cnic

      /* Latest Matric row */
      LEFT JOIN (
        SELECT m.* FROM \`${DB}\`.matriculation m
        INNER JOIN (SELECT cnic, MAX(id) AS max_id FROM \`${DB}\`.matriculation GROUP BY cnic) t
          ON t.cnic = m.cnic AND t.max_id = m.id
      ) m ON m.cnic = p.cnic

      /* Latest Intermediate row */
      LEFT JOIN (
        SELECT i.* FROM \`${DB}\`.intermediate i
        INNER JOIN (SELECT cnic, MAX(id) AS max_id FROM \`${DB}\`.intermediate GROUP BY cnic) t
          ON t.cnic = i.cnic AND t.max_id = i.id
      ) i ON i.cnic = p.cnic

      WHERE p.id = ? LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    const row = rows[0];

    const [docs] = await sequelize.query(
      `SELECT id, cnic, docType, docName, fileName, fileSize, mimeType, uploadDate
       FROM \`${DB}\`.uploaded_docs
       WHERE cnic = ?
       ORDER BY uploadDate DESC, id DESC`,
      { replacements: [row.cnic] }
    );

    res.json({
      success: true,
      data: {
        form_id: row.form_id,
        cnic: row.cnic,
        status: row.form_status,
        personal_info: {
          first_name: row.first_name,
          last_name: row.last_name,
          gender: row.gender,
          dob: row.dob,
          religion: row.religion,
          disability: row.disability,
          disability_description: row.disability_description,
          native_language: row.native_language,
          blood_group: row.blood_group,
          province: row.province,
          city: row.city,
          postal_address: row.postal_address,
          permanent_address: row.permanent_address,
          remarks: row.remarks,
          roll_no: row.roll_no,
          cgpa: row.cgpa,
        },
        father_info: {
          name: row.father_name,
          cnic_number: row.father_cnic_number,
          mobile_number: row.father_mobile,
          occupation: row.father_occupation,
        },
        guardian_info: {
          name: row.guardian_name,
          cnic_number: row.guardian_cnic_number,
          mobile_number: row.guardian_mobile,
          occupation: row.guardian_occupation,
        },
        program_of_study: {
          applied_department: row.applied_department,
          first_choice: row.first_choice,
          second_choice: row.second_choice,
          third_choice: row.third_choice,
        },
        matriculation_latest: {
          group_name: row.matric_group_name,
          degree_year: row.matric_degree_year,
          seat_no: row.matric_seat_no,
          institution_name: row.matric_institution_name,
          board: row.matric_board,
          total_marks: row.matric_total_marks,
          marks_obtained: row.matric_marks_obtained,
          percentage: row.matric_percentage,
        },
        intermediate_latest: {
          group_name: row.inter_group_name,
          degree_year: row.inter_degree_year,
          seat_no: row.inter_seat_no,
          institution_name: row.inter_institution_name,
          board: row.inter_board,
          total_marks: row.inter_total_marks,
          marks_obtained: row.inter_marks_obtained,
          percentage: row.inter_percentage,
        },
        uploaded_documents: docs,
      },
    });
  } catch (err) {
    console.error("getAdmissionById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================= Upsert Entry-Test Marks (form_id) ================= */
/** PUT /api/admissions/updateMarks/:form_id */
export const updateEntryTestMarks = async (req, res) => {
  try {
    const { form_id } = req.params;
    const {
      obtained_marks,
      total_marks,
      percentage,
      passing_marks,
      merit_list,
      department,
      fee_status, // "Paid" | "Unpaid"
      status, // optional: any extended enum
    } = req.body;

    // 1) resolve CNIC
    const [[pi]] = await sequelize.query(
      `SELECT cnic FROM \`${DB}\`.personal_info WHERE id = ? LIMIT 1`,
      { replacements: [form_id] }
    );
    if (!pi)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });

    const cnic = pi.cnic;
    const obtained = Number(obtained_marks ?? 0);
    const total = Number(total_marks ?? 0);
    const etPct =
      total > 0 ? Number(((obtained / total) * 100).toFixed(2)) : null;
    const finalPct =
      percentage != null ? Number(Number(percentage).toFixed(2)) : etPct;
    const passMarks = passing_marks != null ? Number(passing_marks) : null;
    const feeStatus = fee_status ?? "Unpaid";
    const enumStatus = status ? mapStatusToEnum(status) : null;

    // 2) upsert enroll_students by CNIC
    const [[existing]] = await sequelize.query(
      `SELECT enroll_id FROM \`${DB}\`.enroll_students WHERE cnic = ? LIMIT 1`,
      { replacements: [cnic] }
    );

    if (existing) {
      await sequelize.query(
        `
        UPDATE \`${DB}\`.enroll_students
        SET entry_test_obtained_marks = ?,
            entry_test_total_marks    = ?,
            entry_test_percentage     = ?,
            total_percentage          = ?,
            passing_marks             = COALESCE(?, passing_marks),
            merit_list                = COALESCE(?, merit_list),
            department                = COALESCE(?, department),
            fee_status                = COALESCE(?, fee_status)
            ${enumStatus ? ", form_status = ?" : ""}
        WHERE enroll_id = ?
        `,
        {
          replacements: [
            obtained,
            total,
            etPct,
            finalPct,
            passMarks,
            merit_list ?? null,
            department ?? null,
            feeStatus,
            ...(enumStatus ? [enumStatus] : []),
            existing.enroll_id,
          ],
        }
      );
    } else {
      await sequelize.query(
        `
        INSERT INTO \`${DB}\`.enroll_students
          (cnic, entry_test_obtained_marks, entry_test_total_marks,
           entry_test_percentage, total_percentage, passing_marks,
           merit_list, department, fee_status${
             enumStatus ? ", form_status" : ""
           })
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?${enumStatus ? ", ?" : ""})
        `,
        {
          replacements: [
            cnic,
            obtained,
            total,
            etPct,
            finalPct,
            passMarks,
            merit_list ?? null,
            department ?? null,
            feeStatus,
            ...(enumStatus ? [enumStatus] : []),
          ],
        }
      );
    }

    // 3) if status provided, mirror to personal_info (your personal_info enum is extended)
    if (enumStatus) {
      await sequelize.query(
        `UPDATE \`${DB}\`.personal_info SET form_status = ? WHERE id = ?`,
        { replacements: [enumStatus, form_id] }
      );
    }

    // 4) return latest enroll row
    const [[row]] = await sequelize.query(
      `
      SELECT
        enroll_id AS enrollId, cnic,
        entry_test_obtained_marks AS entryTestObtained,
        entry_test_total_marks    AS entryTestTotal,
        entry_test_percentage     AS entryTestPercentage,
        total_percentage          AS totalPercentage,
        passing_marks             AS passingMarks,
        merit_list                AS meritList,
        department,
        fee_status                AS feeStatus,
        form_status               AS formStatus
      FROM \`${DB}\`.enroll_students
      WHERE cnic = ?
      ORDER BY enroll_id DESC
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    res.json({ success: true, message: "Marks saved.", data: row });
  } catch (err) {
    console.error("updateEntryTestMarks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================== Upsert Marks (when you only have enroll_id) ============ */
/** PUT /api/admissions/updateMarksByEnroll/:enroll_id */
export const updateEntryTestMarksByEnroll = async (req, res) => {
  try {
    const { enroll_id } = req.params;

    const [[er]] = await sequelize.query(
      `SELECT cnic FROM \`${DB}\`.enroll_students WHERE enroll_id = ? LIMIT 1`,
      { replacements: [enroll_id] }
    );
    if (!er)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const [[pi]] = await sequelize.query(
      `SELECT id FROM \`${DB}\`.personal_info WHERE cnic = ? LIMIT 1`,
      { replacements: [er.cnic] }
    );
    if (!pi)
      return res
        .status(404)
        .json({ success: false, message: "Form not found for CNIC" });

    req.params.form_id = pi.id;
    return updateEntryTestMarks(req, res);
  } catch (err) {
    console.error("updateEntryTestMarksByEnroll error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================== Enrolled List ============================== */
/** GET /api/admissions/enrolled/list?status=Passed|Selected|... */
export const getAllEnrolledStudents = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? "WHERE form_status = ?" : "";
    const params = status ? [status] : [];

    const [rows] = await sequelize.query(
      `
      SELECT
        enroll_id AS enrollId,
        cnic,
        entry_test_obtained_marks AS entryTestObtained,
        entry_test_total_marks    AS entryTestTotal,
        entry_test_percentage     AS entryTestPercentage,
        total_percentage          AS totalPercentage,
        passing_marks             AS passingMarks,
        merit_list                AS meritList,
        department,
        fee_status                AS feeStatus,
        form_status               AS formStatus
      FROM \`${DB}\`.enroll_students
      ${where}
      ORDER BY enroll_id DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getAllEnrolledStudents error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================== Academics & Docs =========================== */
/** GET /api/admissions/:id/academics */
export const getAcademicsById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[pi]] = await sequelize.query(
      `SELECT cnic FROM \`${DB}\`.personal_info WHERE id = ? LIMIT 1`,
      { replacements: [id] }
    );
    if (!pi)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    const cnic = pi.cnic;

    const [matricRows] = await sequelize.query(
      `
      SELECT id, group_name, degree_year, seat_no, institution_name,
             board, total_marks, marks_obtained, percentage
      FROM \`${DB}\`.matriculation
      WHERE cnic = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    const [interRows] = await sequelize.query(
      `
      SELECT id, group_name, degree_year, seat_no, institution_name,
             board, total_marks, marks_obtained, percentage
      FROM \`${DB}\`.intermediate
      WHERE cnic = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    res.json({
      success: true,
      data: {
        cnic,
        matriculation: matricRows[0] || null,
        intermediate: interRows[0] || null,
      },
    });
  } catch (err) {
    console.error("getAcademicsById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/admissions/:id/documents */
export const getDocumentsById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[pi]] = await sequelize.query(
      `SELECT cnic FROM \`${DB}\`.personal_info WHERE id = ? LIMIT 1`,
      { replacements: [id] }
    );
    if (!pi)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });

    const [docs] = await sequelize.query(
      `
      SELECT id, cnic, docType, docName, fileName, fileSize, mimeType, uploadDate
      FROM \`${DB}\`.uploaded_docs
      WHERE cnic = ?
      ORDER BY uploadDate DESC, id DESC
      `,
      { replacements: [pi.cnic] }
    );

    res.json({ success: true, data: { cnic: pi.cnic, documents: docs } });
  } catch (err) {
    console.error("getDocumentsById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================== Status Only ================================ */
/** PATCH /api/admissions/updateStatus/:form_id   Body: { status, remarks } */
export const updateFormStatus = async (req, res) => {
  try {
    const { form_id } = req.params;
    const { status, remarks, cgpa } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing 'status'." });
    }

    const enumStatus = mapStatusToEnum(status);

    const [[exists]] = await sequelize.query(
      `SELECT id FROM \`${DB}\`.personal_info WHERE id = ? LIMIT 1`,
      { replacements: [form_id] }
    );
    if (!exists)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });

    // Update both status and remarks
    await sequelize.query(
      `UPDATE \`${DB}\`.personal_info SET form_status = ?, remarks = ?, cgpa = ? WHERE id = ?`,
      { replacements: [enumStatus, remarks || null, cgpa || 0, form_id] } // Use null if remarks is not provided
    );

    res.json({
      success: true,
      message: `Form status updated to '${enumStatus}'${
        remarks ? " with remarks" : ""
      }.`,
    });
  } catch (err) {
    console.error("updateFormStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const assignRollNo = async (req, res) => {
  try {
    const { form_id } = req.params;
    const { roll_no } = req.body;

    if (!roll_no) {
      return res
        .status(400)
        .json({ success: false, message: "Missing 'roll_no'." });
    }

    const [[exists]] = await sequelize.query(
      `SELECT id FROM \`${DB}\`.personal_info WHERE id = ? LIMIT 1`,
      { replacements: [form_id] }
    );
    if (!exists)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });

    // ✅ CORRECTED: Use UPDATE instead of INSERT
    await sequelize.query(
      `UPDATE \`${DB}\`.personal_info SET roll_no = ? WHERE id = ?`,
      { replacements: [roll_no, form_id] }
    );

    res.json({
      success: true,
      message: `Roll number assigned: '${roll_no}'.`,
    });
  } catch (err) {
    console.error("assignRollNo error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
