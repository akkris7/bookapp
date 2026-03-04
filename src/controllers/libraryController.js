const Library = require("../models/Library");

/**
 * Add book to library
 */
exports.addToLibrary = async (req, res) => {
  try {
    const userId = req.user._id;

    const existing = await Library.findOne({
      user: userId,
      bookId: req.body.bookId,
    });

    if (existing) {
      return res.status(400).json({ message: "Book already in library" });
    }

    const book = await Library.create({
      user: userId,
      ...req.body,
    });

    res.status(201).json(book);
  } catch (err) {
    console.log("ADD ERROR:", err);
    res.status(400).json({ message: "Failed to add book" });
  }
};

/**
 * Get logged in user's library
 */
exports.getMyLibrary = async (req, res) => {
  try {
    const books = await Library.find({ user: req.user._id });
    res.json(books);
  } catch (err) {
    console.log("GET LIB ERROR:", err);
    res.status(500).json({ message: "Failed to fetch library" });
  }
};

/**
 * Update status only (by Google bookId)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { status } = req.body;

    const updated = await Library.findOneAndUpdate(
      { user: req.user._id, bookId: bookId },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(updated);
  } catch (err) {
    console.log("STATUS ERROR:", err);
    res.status(400).json({ message: "Failed to update status" });
  }
};

/**
 * Delete book from library (by Google bookId)
 */
exports.deleteFromLibrary = async (req, res) => {
  try {
    const { bookId } = req.params;

    const deleted = await Library.findOneAndDelete({
      user: req.user._id,
      bookId: bookId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book removed from library" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(400).json({ message: "Failed to delete book" });
  }
};

/**
 * Update rating & review (or create entry if not exists)
 */
exports.updateBookReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { status, rating, review, title, authors, thumbnail } = req.body;

    const userId = req.user._id;

    let entry = await Library.findOne({ user: userId, bookId });

    if (entry) {
      if (status) entry.status = status;
      if (rating !== undefined) entry.rating = rating;
      if (review !== undefined) entry.review = review;

      await entry.save();
    } else {
      entry = await Library.create({
        user: userId,
        bookId,
        title,
        authors,
        thumbnail,
        status: status || "WANT_TO_READ",
        rating,
        review,
      });
    }

    res.json({
      message: "Book updated successfully",
      entry,
    });
  } catch (err) {
    console.log("REVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to update book" });
  }
};