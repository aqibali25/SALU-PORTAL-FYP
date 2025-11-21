// routes/libraryRoutes.js
import express from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBook,
  issueBook,
  getAllBookIssues,
  getBookIssuesByRollNo,
  getBookIssuesByBookId,
  updateBookIssueStatus,
  deleteIssuedBook,
  deleteAllIssuesForBook,
  updateOverdueBooks,
} from "../controllers/libraryController.js";

const router = express.Router();

/* --------------------------- LIBRARY BOOKS --------------------------- */

// Add a new book
// POST /api/books
router.post("/books", createBook);

// Get all books (optional ?status=Available)
router.get("/books", getAllBooks);

// Get single book by ID
router.get("/books/:bookId", getBookById);

// Update book
router.put("/books/:bookId", updateBookById);

// Delete book
router.delete("/books/:bookId", deleteBook);

/* --------------------------- ISSUED BOOKS ---------------------------- */

// Issue a book`
// POST /api/book-issues
router.post("/book-issues", issueBook);

// Get all issued books (array)
router.get("/book-issues", getAllBookIssues);

// Get issues by student roll no
router.get("/book-issues/student/:rollNo", getBookIssuesByRollNo);

// Get issues by book id
router.get("/book-issues/book/:bookId", getBookIssuesByBookId);

// Update issue status (Returned / Overdue / Lost)
router.put("/book-issues/status", updateBookIssueStatus);

// Delete latest issue record for this student & book
router.delete("/book-issues/student/:rollNo/:bookId", deleteIssuedBook);

// Delete ALL issue history of a book
router.delete("/book-issues/book/:bookId", deleteAllIssuesForBook);

// Update all overdue books
router.put("/book-issues/update-overdue", updateOverdueBooks);

export default router;
