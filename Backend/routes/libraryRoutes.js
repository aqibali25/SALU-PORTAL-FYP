// routes/libraryRoutes.js
import express from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBookById,
  issueBook,
  getAllBookIssues,
  getBookIssuesByRollNo,
  getBookIssuesByBookId,
  updateBookIssueStatus,
} from "../controllers/libraryController.js";

const router = express.Router();

/* --------------------------- LIBRARY BOOKS --------------------------- */
router.post("/books", createBook);           // add book
router.get("/books", getAllBooks);           // get all books
router.get("/books/:bookId", getBookById);   // get single book
router.put("/books/:bookId", updateBookById); // update book

/* --------------------------- ISSUED BOOKS ---------------------------- */
router.post("/book-issues", issueBook);                    // issue a book
router.get("/book-issues", getAllBookIssues);              // all issues
router.get("/book-issues/student/:rollNo", getBookIssuesByRollNo); // issues by student
router.get("/book-issues/book/:bookId", getBookIssuesByBookId);    // issues by book
router.put("/book-issues/status", updateBookIssueStatus);  // update status

export default router;
