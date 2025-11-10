import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/* ------------------------------- Utilities -------------------------------- */
const normalizeCNIC = (cnic = "") => {
  const digits = String(cnic).replace(/\D/g, "").slice(0, 13);
  if (digits.length !== 13) return null;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

/* -------------------------------- Upsert ---------------------------------- */
export const upsertFee = async (req, res) => {
  try {
    const {
      fee_id,
      cnic,
      paid_date,
      amount,
      year,
      status,
      challan_no,
      department,
    } = req.body || {};

    console.log("Received fee data:", req.body);

    // ---- basic validation
    const normCnic = normalizeCNIC(cnic);
    if (!normCnic) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid CNIC (must be 13 digits)." });
    }

    if (!paid_date || !/^\d{4}-\d{2}-\d{2}$/.test(paid_date)) {
      return res
        .status(400)
        .json({ success: false, message: "paid_date must be YYYY-MM-DD." });
    }

    const amt = Number(amount);
    if (!isFinite(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "amount must be a positive number." });
    }

    if (!year) {
      return res
        .status(400)
        .json({ success: false, message: "year is required." });
    }

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "status is required." });
    }

    if (!challan_no) {
      return res
        .status(400)
        .json({ success: false, message: "challan_no is required." });
    }

    if (!department) {
      return res
        .status(400)
        .json({ success: false, message: "department is required." });
    }

    // Use year as string directly (since DB field is varchar)
    const yearDb = String(year).trim();

    // ✅ Check if CNIC exists in personal_info table
    const [[cnicExists]] = await sequelize.query(
      `
      SELECT COUNT(*) as count FROM \`${DB}\`.personal_info 
      WHERE cnic = ?
      `,
      { replacements: [normCnic] }
    );

    if (cnicExists.count === 0) {
      return res.status(400).json({
        success: false,
        message: `CNIC ${normCnic} does not exist in the system. Please register the student first.`,
      });
    }

    console.log("Processing fee upsert:", {
      fee_id: fee_id || "NEW",
      cnic: normCnic,
      paid_date,
      amount: amt,
      year: yearDb,
      status,
      challan_no,
      department,
    });

    // ---- create or update
    if (fee_id) {
      // UPDATE by fee_id
      const [result] = await sequelize.query(
        `
        UPDATE \`${DB}\`.fees
        SET cnic = ?, paid_date = ?, amount = ?, year = ?, status = ?,
            challan_no = ?, department = ?
        WHERE fee_id = ?
        `,
        {
          replacements: [
            normCnic,
            paid_date,
            amt,
            yearDb,
            status,
            challan_no,
            department,
            fee_id,
          ],
        }
      );

      console.log("Update result:", result);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Fee record not found." });
      }
    } else {
      // INSERT
      const [result] = await sequelize.query(
        `
        INSERT INTO \`${DB}\`.fees
          (cnic, paid_date, amount, year, status, challan_no, department)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        {
          replacements: [
            normCnic,
            paid_date,
            amt,
            yearDb,
            status,
            challan_no,
            department,
          ],
        }
      );

      console.log("Insert result:", result);
    }

    // ---- return the latest fee row for this CNIC
    const [[row]] = await sequelize.query(
      `
      SELECT
        fee_id, cnic, paid_date, amount, year, status, challan_no, department
      FROM \`${DB}\`.fees
      WHERE cnic = ?
      ORDER BY fee_id DESC
      LIMIT 1
      `,
      { replacements: [normCnic] }
    );

    console.log("Returning fee data:", row);

    return res.json({
      success: true,
      message: fee_id ? "Fee updated successfully." : "Fee added successfully.",
      data: row,
    });
  } catch (err) {
    console.error("upsertFee error:", err);
    console.error("Error details:", err.message);
    console.error("SQL error code:", err.original?.code);
    console.error("SQL error number:", err.original?.errno);

    // Handle foreign key constraint error specifically
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot add fee. The provided CNIC does not exist in the student records. Please register the student first.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while processing fee",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* --------------------------------- GETs ----------------------------------- */
export const getFees = async (req, res) => {
  try {
    const { cnic, department, status, year, challan_no } = req.query;

    const where = [];
    const params = [];

    if (cnic) {
      const norm = normalizeCNIC(cnic);
      if (!norm)
        return res
          .status(400)
          .json({ success: false, message: "Invalid CNIC filter." });
      where.push("f.cnic = ?");
      params.push(norm);
    }
    if (department) {
      where.push("f.department = ?");
      params.push(department);
    }
    if (status) {
      where.push("f.status = ?");
      params.push(status);
    }
    if (year) {
      where.push("f.year = ?");
      params.push(year); // Use string directly
    }
    if (challan_no) {
      where.push("f.challan_no = ?");
      params.push(challan_no);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await sequelize.query(
      `
      SELECT
        f.fee_id, f.cnic, f.paid_date, f.amount, f.year, f.status,
        f.challan_no, f.department
      FROM \`${DB}\`.fees f
      ${whereSql}
      ORDER BY f.fee_id DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getFees error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/fees/:fee_id */
export const getFeeById = async (req, res) => {
  try {
    const { fee_id } = req.params;
    const [[row]] = await sequelize.query(
      `
      SELECT fee_id, cnic, paid_date, amount, year, status, challan_no, department
      FROM \`${DB}\`.fees
      WHERE fee_id = ?
      LIMIT 1
      `,
      { replacements: [fee_id] }
    );
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Fee record not found." });

    res.json({ success: true, data: row });
  } catch (err) {
    console.error("getFeeById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/fees/byCnic/:cnic */
export const getFeesByCnic = async (req, res) => {
  try {
    const norm = normalizeCNIC(req.params.cnic);
    if (!norm)
      return res
        .status(400)
        .json({ success: false, message: "Invalid CNIC param." });

    const [rows] = await sequelize.query(
      `
      SELECT fee_id, cnic, paid_date, amount, year, status, challan_no, department
      FROM \`${DB}\`.fees
      WHERE cnic = ?
      ORDER BY fee_id DESC
      `,
      { replacements: [norm] }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getFeesByCnic error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
