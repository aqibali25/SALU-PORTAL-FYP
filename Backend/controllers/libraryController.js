// controllers/libraryController.js
import { sequelize } from "../db.js";

const DB = process.env.DB_NAME || "u291434058_SALU_GC";

/* --------------------------- helpers --------------------------- */

const mapBookStatus = (status) => {
  const s = String(status || "")
    .toLowerCase()
    .trim();
  const map = {
    available: "Available",
    outofstock: "Out of stock",
    lended: "Lended",
  };
  return map[s] || "Available";
};

const mapIssueStatus = (status) => {
  const s = String(status || "")
    .toLowerCase()
    .trim();
  const map = {
    issued: "Issued",
    returned: "Returned",
    overdue: "Overdue",
    lost: "Lost",
  };
  return map[s] || "Issued";
};

/* ===================================================================
   OVERDUE BOOKS UPDATE FUNCTION
   =================================================================== */

/** PUT /api/book-issues/update-overdue  -> update status to Overdue for overdue books */
export const updateOverdueBooks = async (req, res) => {
  try {
    const currentDate = new Date();

    // Update books where return_date is NULL and due_date has passed and status is not Returned/Overdue
    const [result] = await sequelize.query(
      `UPDATE \`${DB}\`.issued_books 
       SET status = 'Overdue' 
       WHERE book_return_date IS NULL 
       AND book_due_date < ? 
       AND status != 'Returned' 
       AND status != 'Overdue'`,
      { replacements: [currentDate] }
    );

    res.json({
      success: true,
      updatedCount: result.affectedRows,
      message: `Updated ${result.affectedRows} books to overdue status`,
    });
  } catch (error) {
    console.error("Error updating overdue books:", error);
    res.status(500).json({
      success: false,
      message: "Error updating overdue books",
    });
  }
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
      bookEdition,
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

    // Auto-set status based on available copies
    const autoStatus = available === 0 ? "Out of stock" : status || "Available";
    const enumStatus = mapBookStatus(autoStatus);

    await sequelize.query(
      `
      INSERT INTO \`${DB}\`.library_books
        (book_id, book_title, book_edition,authors, genre_category, language,
         total_copies, available_copies, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          bookId,
          title,
          bookEdition || "",
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
        book_edition    AS bookEdition,
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
        book_edition    AS bookEdition,
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
        book_edition    AS bookEdition,
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
      bookEdition,
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

    // Auto-set status based on available copies if availableCopies is being updated
    let finalStatus = status;
    if (availableCopies !== undefined && availableCopies !== null) {
      finalStatus =
        Number(availableCopies) === 0 ? "Out of stock" : status || "Available";
    }

    const enumStatus = finalStatus ? mapBookStatus(finalStatus) : null;

    await sequelize.query(
      `
      UPDATE \`${DB}\`.library_books
      SET
        book_title       = COALESCE(?, book_title),
        book_edition    = COALESCE(?, book_edition),
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
          bookEdition || null,
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
        book_edition    AS bookEdition,
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
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    if (book.available_copies !== book.total_copies) {
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
    const {
      rollNo,
      bookId,
      bookName,
      issueDate,
      dueDate,
      status,
      bookEdition,
    } = req.body;

    if (!rollNo || !bookId || !issueDate || !dueDate || !status) {
      return res.status(400).json({
        success: false,
        message: "rollNo, bookId, issueDate, dueDate and status are required.",
      });
    }

    // 1) check book exists & is available
    const [[book]] = await sequelize.query(
      `
      SELECT book_id, book_title, book_edition, authors, genre_category, language,
        total_copies,available_copies, status
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
        (student_roll_no, book_id, book_name, book_edition, book_issue_date, book_due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          rollNo,
          bookId,
          bookName || book.book_title,
          bookEdition || book.book_edition,
          issueDate,
          dueDate,
          enumStatus,
        ],
      }
    );

    // 3) Calculate new values first, then update
    const newAvailableCopies = book.available_copies - 1;
    const newStatus = newAvailableCopies > 0 ? book.status : "Out of stock";

    await sequelize.query(
      `
      UPDATE \`${DB}\`.library_books
      SET
        available_copies = ?,
        status = ?,
        updated_at = NOW()
      WHERE book_id = ?
      `,
      { replacements: [newAvailableCopies, newStatus, bookId] }
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
        book_edition   AS bookEdition,
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
        book_edition   AS bookEdition,
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
        book_edition   AS bookEdition,
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
    const { rollNo, bookId, status, returnDate } = req.body;

    if (!rollNo || !bookId || !status || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "rollNo, bookId, status and returnDate are required.",
      });
    }

    const enumStatus = mapIssueStatus(status);

    console.log("Updating book issue status:", {
      rollNo,
      bookId,
      status: enumStatus,
      returnDate,
    });

    // First, check if the issue record exists
    const [[existingIssue]] = await sequelize.query(
      `
      SELECT * FROM \`${DB}\`.issued_books 
      WHERE student_roll_no = ? 
        AND book_id = ? 
        AND status != 'Returned'
      ORDER BY book_issue_date DESC 
      LIMIT 1
      `,
      { replacements: [rollNo, bookId] }
    );

    console.log("Existing issue record:", existingIssue);

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: "No active issue record found for this student and book.",
      });
    }

    // update latest issue record for this student+book
    const [result] = await sequelize.query(
      `
      UPDATE \`${DB}\`.issued_books
      SET status = ?,
        book_return_date = ?
      WHERE student_roll_no = ?
        AND book_id = ?
        AND status != 'Returned'
      ORDER BY book_issue_date DESC
      LIMIT 1
      `,
      { replacements: [enumStatus, returnDate, rollNo, bookId] }
    );

    console.log("Update result:", result);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Issue record not found or already returned.",
      });
    }

    // if returned, increase available copies again and update status
    if (enumStatus === "Returned") {
      // First, get the current available copies
      const [[currentBook]] = await sequelize.query(
        `SELECT available_copies, status FROM \`${DB}\`.library_books WHERE book_id = ? LIMIT 1`,
        { replacements: [bookId] }
      );

      console.log("Current book before return:", currentBook);

      if (currentBook) {
        const newAvailableCopies = currentBook.available_copies + 1;
        const newStatus = newAvailableCopies > 0 ? "Available" : "Out of stock";

        console.log("Updating book after return:", {
          newAvailableCopies,
          newStatus,
        });

        await sequelize.query(
          `
          UPDATE \`${DB}\`.library_books
          SET
            available_copies = ?,
            status = ?,
            updated_at = NOW()
          WHERE book_id = ?
          `,
          { replacements: [newAvailableCopies, newStatus, bookId] }
        );

        console.log("Book inventory updated successfully");
      }
    }

    res.json({
      success: true,
      message: "Book returned successfully.",
      data: {
        rollNo,
        bookId,
        status: enumStatus,
        returnDate,
      },
    });
  } catch (err) {
    console.error("updateBookIssueStatus error:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
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

    // book is effectively "returned" -> increase copies and update status
    await sequelize.query(
      `
      UPDATE \`${DB}\`.library_books
      SET
        available_copies = available_copies + 1,
        status = CASE 
                   WHEN available_copies + 1 > 0 THEN 'Available'
                   ELSE 'Out of stock'
                 END,
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
