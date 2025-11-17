// controllers/libraryController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/* --------------------------- helpers --------------------------- */

const mapBookStatus = (status) => {
  const s = String(status || "").toLowerCase().trim();
  const map = {
    available: "Available",
    lended: "Lended",
    lent: "Lended",
    damaged: "Damaged",
  };
  return map[s] || "Available";
};

const mapIssueStatus = (status) => {
  const s = String(status || "").toLowerCase().trim();
  const map = {
    issued: "Issued",
    returned: "Returned",
    overdue: "Overdue",
    lost: "Lost",
  };
  return map[s] || "Issued";
};

/* ===================================================================
   LIBRARY BOOKS
   =================================================================== */

/** POST /api/books  -> add new book */
export const createBook = async (req, res) => {
  try {
    const {
      bookId,
      title,
      authors,
      genre,
      language,
      totalCopies,
      availableCopies,
      status,
    } = req.body;

    if (!bookId || !title) {
      return res
        .status(400)
        .json({ success: false, message: "bookId and title are required." });
    }

    const total = Number(totalCopies ?? 0);
    const available =
      availableCopies !== undefined && availableCopies !== null
        ? Number(availableCopies)
        : total;

    const enumStatus = mapBookStatus(status);

    await sequelize.query(
      `
      INSERT INTO \`${DB}\`.library_books
        (book_id, book_title, authors, genre_category, language,
         total_copies, available_copies, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          bookId,
          title,
          authors || "",
          genre || "",
          language || "",
          total,
          available,
          enumStatus,
        ],
      }
    );

    const [[book]] = await sequelize.query(
      `
      SELECT
        book_id          AS bookId,
        book_title       AS title,
        authors,
        genre_category   AS genre,
        language,
        total_copies     AS totalCopies,
        available_copies AS availableCopies,
        status,
        created_at       AS createdAt,
        updated_at       AS updatedAt
      FROM \`${DB}\`.library_books
      WHERE book_id = ?
      LIMIT 1
      `,
      { replacements: [bookId] }
    );

    res.json({ success: true, message: "Book created.", data: book });
  } catch (err) {
    console.error("createBook error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

/** GET /api/books  -> all books (optional ?status=Available) */
export const getAllBooks = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? "WHERE status = ?" : "";
    const params = status ? [mapBookStatus(status)] : [];

    const [rows] = await sequelize.query(
      `
      SELECT
        book_id          AS bookId,
        book_title       AS title,
        authors,
        genre_category   AS genre,
        language,
        total_copies     AS totalCopies,
        available_copies AS availableCopies,
        status,
        created_at       AS createdAt,
        updated_at       AS updatedAt
      FROM \`${DB}\`.library_books
      ${where}
      ORDER BY created_at DESC
      `,
      { replacements: params }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getAllBooks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/books/:bookId  -> single book by ID */
export const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        book_id          AS bookId,
        book_title       AS title,
        authors,
        genre_category   AS genre,
        language,
        total_copies     AS totalCopies,
        available_copies AS availableCopies,
        status,
        created_at       AS createdAt,
        updated_at       AS updatedAt
      FROM \`${DB}\`.library_books
      WHERE book_id = ?
      LIMIT 1
      `,
      { replacements: [bookId] }
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    // many front-ends just expect the object directly:
    res.json(rows[0]);
  } catch (err) {
    console.error("getBookById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/books/:bookId  -> update book details */
export const updateBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      authors,
      genre,
      language,
      totalCopies,
      availableCopies,
      status,
    } = req.body;

    const [[exists]] = await sequelize.query(
      `SELECT book_id FROM \`${DB}\`.library_books WHERE book_id = ? LIMIT 1`,
      { replacements: [bookId] }
    );

    if (!exists) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    const enumStatus = status ? mapBookStatus(status) : null;

    await sequelize.query(
      `
      UPDATE \`${DB}\`.library_books
      SET
        book_title       = COALESCE(?, book_title),
        authors          = COALESCE(?, authors),
        genre_category   = COALESCE(?, genre_category),
        language         = COALESCE(?, language),
        total_copies     = COALESCE(?, total_copies),
        available_copies = COALESCE(?, available_copies),
        status           = COALESCE(?, status),
        updated_at       = NOW()
      WHERE book_id = ?
      `,
      {
        replacements: [
          title || null,
          authors || null,
          genre || null,
          language || null,
          totalCopies !== undefined ? Number(totalCopies) : null,
          availableCopies !== undefined ? Number(availableCopies) : null,
          enumStatus,
          bookId,
        ],
      }
    );

    const [[book]] = await sequelize.query(
      `
      SELECT
        book_id          AS bookId,
        book_title       AS title,
        authors,
        genre_category   AS genre,
        language,
        total_copies     AS totalCopies,
        available_copies AS availableCopies,
        status,
        created_at       AS createdAt,
        updated_at       AS updatedAt
      FROM \`${DB}\`.library_books
      WHERE book_id = ?
      LIMIT 1
      `,
      { replacements: [bookId] }
    );

    res.json({ success: true, message: "Book updated.", data: book });
  } catch (err) {
    console.error("updateBookById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /api/books/:bookId  -> delete book (if not lended) */
export const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const [[book]] = await sequelize.query(
      `SELECT * FROM \`${DB}\`.library_books WHERE book_id = ? LIMIT 1`,
      { replacements: [bookId] }
    );

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    if (book.status === "Lended") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete. Book is currently issued (Lended).",
      });
    }

    await sequelize.query(
      `DELETE FROM \`${DB}\`.library_books WHERE book_id = ?`,
      { replacements: [bookId] }
    );

    res.json({ success: true, message: "Book deleted successfully." });
  } catch (err) {
    console.error("deleteBook error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===================================================================
   ISSUED BOOKS
   =================================================================== */

/** POST /api/book-issues  -> issue a book */
export const issueBook = async (req, res) => {
  try {
    const { rollNo, bookId, bookName, issueDate, dueDate, status } = req.body;

    if (!rollNo || !bookId || !issueDate || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "rollNo, bookId, issueDate and dueDate are required.",
      });
    }

    // 1) check book exists & is available
    const [[book]] = await sequelize.query(
      `
      SELECT book_id, book_title, available_copies, status
      FROM \`${DB}\`.library_books
      WHERE book_id = ?
      LIMIT 1
      `,
      { replacements: [bookId] }
    );

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({
        success: false,
        message: "No available copies for this book.",
      });
    }

    const enumStatus = mapIssueStatus(status);

    // 2) insert into issued_books
    await sequelize.query(
      `
      INSERT INTO \`${DB}\`.issued_books
        (student_roll_no, book_id, book_name, book_issue_date, book_due_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          rollNo,
          bookId,
          bookName || book.book_title,
          issueDate,
          dueDate,
          enumStatus,
        ],
      }
    );

    // 3) decrement available copies & maybe update status
    await sequelize.query(
      `
      UPDATE \`${DB}\`.library_books
      SET
        available_copies = available_copies - 1,
        status = CASE
                   WHEN available_copies - 1 <= 0 THEN 'Lended'
                   ELSE status
                 END,
        updated_at = NOW()
      WHERE book_id = ?
      `,
      { replacements: [bookId] }
    );

    res.json({ success: true, message: "Book issued successfully." });
  } catch (err) {
    console.error("issueBook error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

/** GET /api/book-issues  -> all issued records */
export const getAllBookIssues = async (_req, res) => {
  try {
    const [rows] = await sequelize.query(
      `
      SELECT
        student_roll_no AS rollNo,
        book_id         AS bookId,
        book_name       AS bookName,
        book_issue_date AS issueDate,
        book_due_date   AS dueDate,
        status
      FROM \`${DB}\`.issued_books
      ORDER BY book_issue_date DESC, book_id ASC
      `
    );

    // IssuedBooks.jsx usually expects array:
    res.json(rows);
  } catch (err) {
    console.error("getAllBookIssues error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/book-issues/student/:rollNo  -> issues for a student */
export const getBookIssuesByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        student_roll_no AS rollNo,
        book_id         AS bookId,
        book_name       AS bookName,
        book_issue_date AS issueDate,
        book_due_date   AS dueDate,
        status
      FROM \`${DB}\`.issued_books
      WHERE student_roll_no = ?
      ORDER BY book_issue_date DESC
      `,
      { replacements: [rollNo] }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getBookIssuesByRollNo error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/book-issues/book/:bookId  -> issues for a book */
export const getBookIssuesByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT
        student_roll_no AS rollNo,
        book_id         AS bookId,
        book_name       AS bookName,
        book_issue_date AS issueDate,
        book_due_date   AS dueDate,
        status
      FROM \`${DB}\`.issued_books
      WHERE book_id = ?
      ORDER BY book_issue_date DESC
      `,
      { replacements: [bookId] }
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("getBookIssuesByBookId error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/book-issues/status  -> update status (Returned / Overdue / Lost) */
export const updateBookIssueStatus = async (req, res) => {
  try {
    const { rollNo, bookId, status } = req.body;

    if (!rollNo || !bookId || !status) {
      return res.status(400).json({
        success: false,
        message: "rollNo, bookId and status are required.",
      });
    }

    const enumStatus = mapIssueStatus(status);

    // update latest issue record for this student+book
    const [result] = await sequelize.query(
      `
      UPDATE \`${DB}\`.issued_books
      SET status = ?
      WHERE student_roll_no = ?
        AND book_id = ?
      ORDER BY book_issue_date DESC
      LIMIT 1
      `,
      { replacements: [enumStatus, rollNo, bookId] }
    );

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Issue record not found." });
    }

    // if returned, increase available copies again
    if (enumStatus === "Returned") {
      await sequelize.query(
        `
        UPDATE \`${DB}\`.library_books
        SET
          available_copies = available_copies + 1,
          status = 'Available',
          updated_at = NOW()
        WHERE book_id = ?
        `,
        { replacements: [bookId] }
      );
    }

    res.json({ success: true, message: "Issue status updated." });
  } catch (err) {
    console.error("updateBookIssueStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /api/book-issues/student/:rollNo/:bookId  -> delete latest issue record */
export const deleteIssuedBook = async (req, res) => {
  try {
    const { rollNo, bookId } = req.params;

    const [result] = await sequelize.query(
      `
      DELETE FROM \`${DB}\`.issued_books
      WHERE student_roll_no = ?
        AND book_id = ?
      ORDER BY book_issue_date DESC
      LIMIT 1
      `,
      { replacements: [rollNo, bookId] }
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "No issue record found for this student & book.",
      });
    }

    // book is effectively "returned" -> increase copies
    await sequelize.query(
      `
      UPDATE \`${DB}\`.library_books
      SET
        available_copies = available_copies + 1,
        status = 'Available',
        updated_at = NOW()
      WHERE book_id = ?
      `,
      { replacements: [bookId] }
    );

    res.json({ success: true, message: "Issue record deleted." });
  } catch (err) {
    console.error("deleteIssuedBook error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /api/book-issues/book/:bookId  -> delete ALL issue history for a book */
export const deleteAllIssuesForBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const [result] = await sequelize.query(
      `
      DELETE FROM \`${DB}\`.issued_books
      WHERE book_id = ?
      `,
      { replacements: [bookId] }
    );

    res.json({
      success: true,
      message: `${result.affectedRows} issue record(s) deleted for book ${bookId}.`,
    });
  } catch (err) {
    console.error("deleteAllIssuesForBook error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
