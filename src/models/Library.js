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
      enum: ["WANT_TO_READ", "READING", "READ"],
      default: "WANT_TO_READ",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Library", librarySchema);