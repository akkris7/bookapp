const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: String,
      required: true,
    },
    title: String,
    authors: [String],
    thumbnail: String,
    status: {
      type: String,
      enum: ["READ", "READING", "WANT_TO_READ"],
      default: "WANT_TO_READ",
    },
  },
  { timestamps: true }
);

// Prevent duplicate books per user
librarySchema.index({ user: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("Library", librarySchema);
