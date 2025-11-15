// Backend/controllers/studentMarksController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/* ---------- helpers ---------- */
const toInt = (v, def = 0) => {
  if (v === null || v === undefined || v === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : def;
};

const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);

/** Derive obtained + gpa if any part marks/total provided or changed */
const deriveTotals = ({
  sessional_marks,
  mid_term_marks,
  final_term_marks,
  obtained_marks,
  total_marks,
}) => {
  const s = toInt(sessional_marks, 0);
  const m = toInt(mid_term_marks, 0);
  const f = toInt(final_term_marks, 0);

  // If obtained not provided, compute from parts
  const obtained =
    obtained_marks !== undefined && obtained_marks !== null
      ? toInt(obtained_marks, s + m + f)
      : s + m + f;

  // total default to 100 if not provided
  const total = toInt(total_marks, 100);

  // simple 4.00 scale GPA; adjust if you have another rule
  const pct = total > 0 ? obtained / total : 0;
  const gpa = Number(clamp(pct * 4, 0, 4).toFixed(2));

  return { s, m, f, obtained, total, gpa };
};

/* 
   POST /api/student-marks/upsert
   Creates or updates a row identified by (student_roll_no, subject, semester, department)
   Body accepts the exact column names; also accepts frontend aliases:
   - rollNo -> student_roll_no
   - studentName -> student_name
   - sessional -> sessional_marks
   - mid -> mid_term_marks
   - finalMarks -> final_term_marks
   */
export const upsertStudentMarks = async (req, res) => {
  try {
    const b = req.body || {};

    // Accept both DB keys and FE aliases
    const student_roll_no = b.student_roll_no ?? b.rollNo ?? "";
    const student_name = b.student_name ?? b.studentName ?? "";
    const department = b.department ?? "";
    const semester = b.semester ?? "";
    const subject = b.subject ?? "";

    if (!student_roll_no || !student_name || !department || !semester || !subject) {
      return res.status(400).json({
        success: false,
        message:
          "Required: student_roll_no/rollNo, student_name/studentName, department, semester, subject.",
      });
    }

    const { s, m, f, obtained, total, gpa } = deriveTotals({
      sessional_marks: b.sessional_marks ?? b.sessional,
      mid_term_marks: b.mid_term_marks ?? b.mid,
      final_term_marks: b.final_term_marks ?? b.finalMarks,
      obtained_marks: b.obtained_marks,
      total_marks: b.total_marks,
    });

    // Check if record exists for (roll_no + subject + semester + department)
    const [[existing]] = await sequelize.query(
      `
      SELECT mark_id
      FROM \`${DB}\`.student_marks
      WHERE student_roll_no = ?
        AND subject = ?
        AND semester = ?
        AND department = ?
      LIMIT 1
      `,
      { replacements: [student_roll_no, subject, semester, department] }
    );

    if (existing) {
      // UPDATE
      await sequelize.query(
        `
        UPDATE \`${DB}\`.student_marks
        SET student_name = ?,
            sessional_marks = ?,
            mid_term_marks = ?,
            final_term_marks = ?,
            obtained_marks = ?,
            total_marks = ?,
            gpa = ?
        WHERE mark_id = ?
        `,
        {
          replacements: [
            student_name,
            s,
            m,
            f,
            obtained,
            total,
            gpa,
            existing.mark_id,
          ],
        }
      );
    } else {
      // INSERT
      await sequelize.query(
        `
        INSERT INTO \`${DB}\`.student_marks
          (student_name, student_roll_no, department, semester, subject,
           sessional_marks, mid_term_marks, final_term_marks,
           obtained_marks, total_marks, gpa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        {
          replacements: [
            student_name,
            student_roll_no,
            department,
            semester,
            subject,
            s,
            m,
            f,
            obtained,
            total,
            gpa,
          ],
        }
      );
    }

    // return latest row for this key
    const [[row]] = await sequelize.query(
      `
      SELECT *
      FROM \`${DB}\`.student_marks
      WHERE student_roll_no = ?
        AND subject = ?
        AND semester = ?
        AND department = ?
      ORDER BY mark_id DESC
      LIMIT 1
      `,
      { replacements: [student_roll_no, subject, semester, department] }
    );

    return res.json({
      success: true,
      message: existing ? "Marks updated." : "Marks added.",
      data: row,
    });
  } catch (err) {
    console.error("upsertStudentMarks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 
   GET /api/student-marks
   Optional filters: ?roll_no=...&subject=...&semester=...&department=...&mark_id=...*/
export const getStudentMarks = async (req, res) => {
  try {
    const { roll_no, subject, semester, department, mark_id } = req.query;

    const where = [];
    const params = [];

    if (mark_id) {
      where.push("m.mark_id = ?");
      params.push(mark_id);
    }
    if (roll_no) {
      where.push("m.student_roll_no = ?");
      params.push(roll_no);
    }
    if (subject) {
      where.push("m.subject = ?");
      params.push(subject);
    }
    if (semester) {
      where.push("m.semester = ?");
      params.push(semester);
    }
    if (department) {
      where.push("m.department = ?");
      params.push(department);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await sequelize.query(
      `
      SELECT
        m.mark_id,
        m.student_name,
        m.student_roll_no,
        m.department,
        m.semester,
        m.subject,
        m.sessional_marks,
        m.mid_term_marks,
        m.final_term_marks,
        m.obtained_marks,
        m.total_marks,
        m.gpa
      FROM \`${DB}\`.student_marks m
      ${whereSql}
      ORDER BY m.mark_id DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getStudentMarks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 
   PUT /api/student-marks/:mark_id
   Body: any updatable fields; if any marks change, obtained/gpa auto-recomputed */

export const updateStudentMarks = async (req, res) => {
  try {
    const { mark_id } = req.params;
    if (!mark_id) {
      return res.status(400).json({ success: false, message: "mark_id required." });
    }

    const b = req.body || {};

    // Prepare fields to update
    const fields = [];
    const params = [];

    const updatableText = [
      "student_name",
      "student_roll_no",
      "department",
      "semester",
      "subject",
    ];
    updatableText.forEach((k) => {
      if (b[k] !== undefined) {
        fields.push(`${k} = ?`);
        params.push(b[k]);
      }
    });

    // If any marks provided, recompute obtained + gpa
    const anyMarkProvided =
      ["sessional_marks", "mid_term_marks", "final_term_marks", "obtained_marks", "total_marks"]
        .some((k) => b[k] !== undefined);

    if (anyMarkProvided) {
      const { s, m, f, obtained, total, gpa } = deriveTotals({
        sessional_marks: b.sessional_marks,
        mid_term_marks: b.mid_term_marks,
        final_term_marks: b.final_term_marks,
        obtained_marks: b.obtained_marks,
        total_marks: b.total_marks,
      });

      fields.push("sessional_marks = ?");
      params.push(s);
      fields.push("mid_term_marks = ?");
      params.push(m);
      fields.push("final_term_marks = ?");
      params.push(f);
      fields.push("obtained_marks = ?");
      params.push(obtained);
      fields.push("total_marks = ?");
      params.push(total);
      fields.push("gpa = ?");
      params.push(gpa);
    }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: "Nothing to update." });
    }

    params.push(mark_id);

    const [result] = await sequelize.query(
      `
      UPDATE \`${DB}\`.student_marks
      SET ${fields.join(", ")}
      WHERE mark_id = ?
      `,
      { replacements: params }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    const [[row]] = await sequelize.query(
      `SELECT * FROM \`${DB}\`.student_marks WHERE mark_id = ? LIMIT 1`,
      { replacements: [mark_id] }
    );

    res.json({ success: true, message: "Marks updated.", data: row });
  } catch (err) {
    console.error("updateStudentMarks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
