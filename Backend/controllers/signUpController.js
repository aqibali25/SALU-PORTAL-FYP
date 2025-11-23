// Backend/controllers/signUpController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/**
 * GET /api/signups
 * Return all records from sign_up table WITHOUT PASSWORD
 */
export const getAllSignUps = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `
      SELECT 
        CNIC,
        EMAIL,
        FULLNAME
      FROM \`${DB}\`.sign_up
      ORDER BY CNIC ASC
      `
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getAllSignUps error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/signups/:cnic
 * Get single user by CNIC (again, WITHOUT PASSWORD)
 */
export const getSignUpByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT 
        CNIC,
        EMAIL,
        FULLNAME
      FROM \`${DB}\`.sign_up
      WHERE CNIC = ?
      LIMIT 1
      `,
      { replacements: [cnic] }
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("getSignUpByCnic error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
