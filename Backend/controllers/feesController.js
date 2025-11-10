// Backend/controllers/feesController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/* ------------------------------- Utilities -------------------------------- */
const normalizeCNIC = (cnic = "") => {
  // Accepts "4510275930238" or "45102-7593023-8" and returns "45102-7593023-8"
  const digits = String(cnic).replace(/\D/g, "").slice(0, 13);
  if (digits.length !== 13) return null;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

const mapUiYearToDbYear = (val = "") => {
  // UI sends "1st Year" etc. DB has YEAR(4). We store 0001..0004.
  const s = String(val).toLowerCase().trim();
  if (s.startsWith("1st")) return 1;
  if (s.startsWith("2nd")) return 2;
  if (s.startsWith("3rd")) return 3;
  if (s.startsWith("4th")) return 4;
  // If already a 4-digit year like 2025, keep it.
  if (/^\d{4}$/.test(val)) return Number(val);
  return null; // store NULL if unknown
};

/* -------------------------------- Upsert ---------------------------------- */
/**
 * POST /api/fees/upsert
 * Body:
 *  {
 *    fee_id?, cnic, paid_date(YYYY-MM-DD), amount(number/decimal),
 *    year("1st Year"|... or 4-digit), status("Partial Pay"|"Full Pay"),
 *    challan_no, department
 *  }
 */
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

    const yearDb = mapUiYearToDbYear(year); // may be 1..4 or a 4-digit year or null
    if (year && yearDb === null) {
      // not fatal – we allow NULL in YEAR (MySQL converts invalid to 0000)
      // but better to return a helpful warning
      // You can hard-enforce by returning 400 here if you prefer.
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

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Fee record not found." });
      }
    } else {
      // INSERT
      await sequelize.query(
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

    return res.json({
      success: true,
      message: fee_id ? "Fee updated." : "Fee added.",
      data: row,
    });
  } catch (err) {
    console.error("upsertFee error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* --------------------------------- GETs ----------------------------------- */
/**
 * GET /api/fees
 * Optional filters: ?cnic=...&department=...&status=...&year=...&challan_no=...
 */
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
      const y = mapUiYearToDbYear(year);
      where.push("f.year = ?");
      params.push(y);
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
