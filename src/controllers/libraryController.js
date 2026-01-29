const Library = require("../models/Library");

exports.addToLibrary = async (req, res) => {
  try {
    const book = await Library.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: "Book already in library" });
  }
};

exports.getMyLibrary = async (req, res) => {
  const books = await Library.find({ user: req.user._id });
  res.json(books);
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const book = await Library.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    res.status(400).json({ message: "Failed to update status" });
  }
};

exports.deleteFromLibrary = async (req, res) => {
  try {
    const book = await Library.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book removed from library" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete book" });
  }
};

exports.deleteFromLibrary = async (req, res) => {
  try {
    const book = await Library.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book removed from library" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete book" });
  }
};