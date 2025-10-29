// Backend/controllers/admissionController.js
import { sequelize } from "../db.js";

/**
 * Use the DB/schema name from env; fallback to your production schema.
 * Make sure your .env has: DB_NAME=u291434058_SALU_GC (or your local schema)
 */
const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/**
 * GET /api/admissions
 * List all received forms (joined by CNIC).
 * Optional: ?status=Pending|Approved|Rejected  (must match your DB enum)
 */
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
        f.name AS father_name,
        pos.applied_department AS department,
        p.cnic AS cnic,
        p.form_status AS status,
        
        -- Add matriculation details
        m.exam_group AS matric_exam_group,
        m.year AS matric_year,
        m.seat_no AS matric_seat_no,
        m.institution_name AS matric_institution,
        
        -- Add intermediate details
        i.exam_group AS inter_exam_group,
        i.year AS inter_year,
        i.seat_no AS inter_seat_no,
        i.institution_name AS inter_institution,
        
        -- Add document details
        d.photo_url,
        d.cnic_front_url,
        d.cnic_back_url,
        d.matric_certificate_url,
        d.inter_certificate_url

      FROM \`${DB}\`.personal_info p
      LEFT JOIN \`${DB}\`.father_info f ON f.cnic = p.cnic
      LEFT JOIN \`${DB}\`.program_of_study pos ON pos.cnic = p.cnic
      LEFT JOIN \`${DB}\`.matriculation m ON m.cnic = p.cnic
      LEFT JOIN \`${DB}\`.intermediate i ON i.cnic = p.cnic
      LEFT JOIN \`${DB}\`.uploaded_docs d ON d.cnic = p.cnic
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

/**
 * GET /api/admissions/:cnic
 * Fetch ONE application’s full info for the Review pages.
 * :cnic corresponds to personal_info.cnic
 */
export const getAdmissionByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        p.id AS form_id,
        p.cnic,
        p.first_name,
        p.last_name,
        p.gender,
        p.dob,
        p.religion,
        p.disability,
        p.disability_description,
        p.native_language,
        p.blood_group,
        p.province,
        p.city,
        p.postal_address,
        p.permanent_address,
        p.form_status,

        f.name AS father_name,
        f.cnic_number AS father_cnic_number,
        f.mobile_number AS father_mobile,
        f.occupation AS father_occupation,

        pos.applied_department,
        pos.first_choice,
        pos.second_choice,
        pos.third_choice,
        
        -- Matriculation details
        m.exam_group AS matric_exam_group,
        m.year AS matric_year,
        m.seat_no AS matric_seat_no,
        m.institution_name AS matric_institution,
        
        -- Intermediate details
        i.exam_group AS inter_exam_group,
        i.year AS inter_year,
        i.seat_no AS inter_seat_no,
        i.institution_name AS inter_institution,
        
        -- Documents
        d.photo_url,
        d.cnic_front_url,
        d.cnic_back_url,
        d.matric_certificate_url,
        d.inter_certificate_url

      FROM \`${DB}\`.personal_info p
      LEFT JOIN \`${DB}\`.father_info f ON f.cnic = p.cnic
      LEFT JOIN \`${DB}\`.program_of_study pos ON pos.cnic = p.cnic
      LEFT JOIN \`${DB}\`.matriculation m ON m.cnic = p.cnic
      LEFT JOIN \`${DB}\`.intermediate i ON i.cnic = p.cnic
      LEFT JOIN \`${DB}\`.uploaded_docs d ON d.cnic = p.cnic
      WHERE p.cnic = ?
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    const row = rows[0];

    const payload = {
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
      },

      father_info: {
        name: row.father_name,
        cnic_number: row.father_cnic_number,
        mobile_number: row.father_mobile,
        occupation: row.father_occupation,
      },

      program_of_study: {
        applied_department: row.applied_department,
        first_choice: row.first_choice,
        second_choice: row.second_choice,
        third_choice: row.third_choice,
      },

      matriculation: {
        exam_group: row.matric_exam_group,
        year: row.matric_year,
        seat_no: row.matric_seat_no,
        institution_name: row.matric_institution,
      },

      intermediate: {
        exam_group: row.inter_exam_group,
        year: row.inter_year,
        seat_no: row.inter_seat_no,
        institution_name: row.inter_institution,
      },

      documents: {
        photo_url: row.photo_url,
        cnic_front_url: row.cnic_front_url,
        cnic_back_url: row.cnic_back_url,
        matric_certificate_url: row.matric_certificate_url,
        inter_certificate_url: row.inter_certificate_url,
      }
    };

    res.json({ success: true, data: payload });
  } catch (err) {
    console.error("getAdmissionByCnic error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admissions/:cnic/academics
 * Returns matriculation and intermediate for the application (by personal_info.cnic)
 */
export const getAcademicsByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;

    // 2) Matriculation (latest)
    const [matricRows] = await sequelize.query(
      `
      SELECT
        m.id,
        m.exam_group AS exam_group,
        m.year AS degree_year,
        m.seat_no AS seat_no,
        m.institution_name,
        m.board,
        m.total_marks,
        m.marks_obtained,
        m.percentage
      FROM \`${DB}\`.matriculation m
      WHERE m.cnic = ?
      ORDER BY m.id DESC
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    // 3) Intermediate (latest)
    const [interRows] = await sequelize.query(
      `
      SELECT
        i.id,
        i.exam_group AS exam_group,
        i.year AS degree_year,
        i.seat_no AS seat_no,
        i.institution_name,
        i.board,
        i.total_marks,
        i.marks_obtained,
        i.percentage
      FROM \`${DB}\`.intermediate i
      WHERE i.cnic = ?
      ORDER BY i.id DESC
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
    console.error("getAcademicsByCnic error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admissions/:cnic/documents
 * Returns uploaded documents for the application (by personal_info.cnic)
 */
export const getDocumentsByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;

    // 2) Latest uploaded docs
    const [docs] = await sequelize.query(
      `
      SELECT
        d.id,
        d.cnic,
        d.photo_url,
        d.cnic_front_url,
        d.cnic_back_url,
        d.matric_certificate_url,
        d.inter_certificate_url,
        d.domicle_url,
        d.prc_form_d_url,
        d.other_url
      FROM \`${DB}\`.uploaded_docs d
      WHERE d.cnic = ?
      ORDER BY d.id DESC
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    res.json({
      success: true,
      data: { cnic, documents: docs[0] || null },
    });
  } catch (err) {
    console.error("getDocumentsByCnic error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
