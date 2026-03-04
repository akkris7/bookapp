const axios = require("axios");
const Library = require("../models/Library");

exports.getBookDetails = async (req, res) => {
  try {
    const { bookId } = req.params;

    // 1️⃣ Get book from Google
    const googleRes = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_API_KEY}`
    );

    const bookData = googleRes.data;

    // 2️⃣ Get reviews from your DB
    const reviews = await Library.find({ bookId, rating: { $exists: true } })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // 3️⃣ Calculate average rating
    const averageRating =
      reviews.length > 0
        ? (
            reviews.reduce((acc, r) => acc + r.rating, 0) /
            reviews.length
          ).toFixed(1)
        : 0;

    res.json({
      book: bookData,
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch book details" });
  }
};