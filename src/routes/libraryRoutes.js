const express = require("express");
const auth = require("../middleware/authMiddleware");

const {
  addToLibrary,
  getMyLibrary,
  updateStatus,
  deleteFromLibrary,
  updateBookReview,
} = require("../controllers/libraryController");

const router = express.Router();

/**
 * Add book to library
 */
router.post("/", auth, addToLibrary);

/**
 * Get logged-in user's library
 */
router.get("/", auth, getMyLibrary);

/**
 * Update rating, review, or status (by Google bookId)
 */
router.put("/:bookId", auth, updateBookReview);

/**
 * Delete book from library (by Google bookId)
 */
router.delete("/:bookId", auth, deleteFromLibrary);

module.exports = router;