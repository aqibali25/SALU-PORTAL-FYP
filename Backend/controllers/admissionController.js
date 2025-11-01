// Backend/controllers/admissionController.js
import { sequelize } from "../db.js";

/**
 * Use the DB/schema name from env; fallback to production schema.
 * Ensure .env has: DB_NAME=u291434058_SALU_GC (or your local schema)
 */
const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/**
 * GET /api/admissions
 * List all received forms (joined by CNIC).
 * Optional: ?status=Pending|Approved|Rejected
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
        p.cnic AS cnic,
        p.form_status AS status,
        -- father/guardian names (if present)
        f.name AS father_name,
        g.name AS guardian_name,
        pos.applied_department AS department
      FROM \`${DB}\`.personal_info       p
      LEFT JOIN \`${DB}\`.father_info        f   ON f.cnic  = p.cnic
      LEFT JOIN \`${DB}\`.guardian_info      g   ON g.cnic  = p.cnic
      LEFT JOIN \`${DB}\`.program_of_study   pos ON pos.cnic = p.cnic
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
 * GET /api/admissions/:id
 * Fetch ONE application’s full info for the Review pages.
 * :id corresponds to personal_info.id
 * - Latest matriculation + intermediate rows per CNIC
 * - All uploaded documents metadata for that CNIC (no fileData BLOB)
 */
export const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        /* personal_info */
        p.id                                  AS form_id,
        p.cnic                                AS cnic,
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

        /* father_info (join by student's CNIC) */
        f.name                                AS father_name,
        f.cnic_number                         AS father_cnic_number,
        f.mobile_number                       AS father_mobile,
        f.occupation                          AS father_occupation,

        /* guardian_info (join by student's CNIC) */
        g.name                                AS guardian_name,
        g.cnic_number                         AS guardian_cnic_number,
        g.mobile_number                       AS guardian_mobile,
        g.occupation                          AS guardian_occupation,

        /* program_of_study */
        pos.applied_department,
        pos.first_choice,
        pos.second_choice,
        pos.third_choice,

        /* matriculation (latest row for this CNIC) */
        m.group_name                          AS matric_group_name,
        m.degree_year                         AS matric_degree_year,
        m.seat_no                             AS matric_seat_no,
        m.institution_name                    AS matric_institution_name,
        m.board                               AS matric_board,
        m.total_marks                         AS matric_total_marks,
        m.marks_obtained                      AS matric_marks_obtained,
        m.percentage                          AS matric_percentage,

        /* intermediate (latest row for this CNIC) */
        i.group_name                          AS inter_group_name,
        i.degree_year                         AS inter_degree_year,
        i.seat_no                             AS inter_seat_no,
        i.institution_name                    AS inter_institution_name,
        i.board                               AS inter_board,
        i.total_marks                         AS inter_total_marks,
        i.marks_obtained                      AS inter_marks_obtained,
        i.percentage                          AS inter_percentage

      FROM \`${DB}\`.personal_info       p
      LEFT JOIN \`${DB}\`.father_info        f   ON f.cnic  = p.cnic
      LEFT JOIN \`${DB}\`.guardian_info      g   ON g.cnic  = p.cnic
      LEFT JOIN \`${DB}\`.program_of_study   pos ON pos.cnic = p.cnic

      /* Latest MATRICULATION row per CNIC (MySQL 5.7+ friendly) */
      LEFT JOIN (
        SELECT m.*
        FROM \`${DB}\`.matriculation m
        INNER JOIN (
          SELECT cnic, MAX(id) AS max_id
          FROM \`${DB}\`.matriculation
          GROUP BY cnic
        ) t ON t.cnic = m.cnic AND t.max_id = m.id
      ) m ON m.cnic = p.cnic

      /* Latest INTERMEDIATE row per CNIC */
      LEFT JOIN (
        SELECT i.*
        FROM \`${DB}\`.intermediate i
        INNER JOIN (
          SELECT cnic, MAX(id) AS max_id
          FROM \`${DB}\`.intermediate
          GROUP BY cnic
        ) t ON t.cnic = i.cnic AND t.max_id = i.id
      ) i ON i.cnic = p.cnic

      WHERE p.id = ?
      LIMIT 1
      `,
      { replacements: [id] }
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    const row = rows[0];

    // All uploaded docs metadata for this CNIC (exclude fileData BLOB)
    const [docs] = await sequelize.query(
      `
      SELECT
        d.id,
        d.cnic,
        d.docType,
        d.docName,
        d.fileName,
        d.fileSize,
        d.mimeType,
        d.uploadDate
      FROM \`${DB}\`.uploaded_docs d
      WHERE d.cnic = ?
      ORDER BY d.uploadDate DESC, d.id DESC
      `,
      { replacements: [row.cnic] }
    );

    // Build response
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

      uploaded_documents: docs, // array (no fileData)
    };

    res.json({ success: true, data: payload });
  } catch (err) {
    console.error("getAdmissionById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admissions/:id/academics
 * Returns matriculation and intermediate (latest per CNIC)
 */
export const getAcademicsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Resolve CNIC from personal_info.id
    const [[pi]] = await sequelize.query(
      `SELECT cnic FROM \`${DB}\`.personal_info WHERE id = ? LIMIT 1`,
      { replacements: [id] }
    );
    if (!pi)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });

    const cnic = pi.cnic;

    // Latest Matriculation
    const [matricRows] = await sequelize.query(
      `
      SELECT
        m.id,
        m.group_name        AS group_name,
        m.degree_year       AS degree_year,
        m.seat_no           AS seat_no,
        m.institution_name  AS institution_name,
        m.board             AS board,
        m.total_marks       AS total_marks,
        m.marks_obtained    AS marks_obtained,
        m.percentage        AS percentage
      FROM \`${DB}\`.matriculation m
      WHERE m.cnic = ?
      ORDER BY m.id DESC
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    // Latest Intermediate
    const [interRows] = await sequelize.query(
      `
      SELECT
        i.id,
        i.group_name        AS group_name,
        i.degree_year       AS degree_year,
        i.seat_no           AS seat_no,
        i.institution_name  AS institution_name,
        i.board             AS board,
        i.total_marks       AS total_marks,
        i.marks_obtained    AS marks_obtained,
        i.percentage        AS percentage
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
    console.error("getAcademicsById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admissions/:id/documents
 * Returns uploaded documents (metadata only) for the application (by personal_info.id)
 */
export const getDocumentsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Resolve CNIC from personal_info.id
    const [[pi]] = await sequelize.query(
      `SELECT cnic FROM \`${DB}\`.personal_info WHERE id = ? LIMIT 1`,
      { replacements: [id] }
    );
    if (!pi)
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });

    const cnic = pi.cnic;

    // All uploaded docs metadata (no BLOB)
    const [docs] = await sequelize.query(
      `
      SELECT
        d.id,
        d.cnic,
        d.docType,
        d.docName,
        d.fileName,
        d.fileSize,
        d.mimeType,
        d.uploadDate
      FROM \`${DB}\`.uploaded_docs d
      WHERE d.cnic = ?
      ORDER BY d.uploadDate DESC, d.id DESC
      `,
      { replacements: [cnic] }
    );

    res.json({
      success: true,
      data: { cnic, documents: docs },
    });
  } catch (err) {
    console.error("getDocumentsById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
