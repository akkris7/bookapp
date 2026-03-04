import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-all duration-150 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <span className={star <= (hovered || value) ? "text-amber-400" : "text-slate-700"}>★</span>
        </button>
      ))}
    </div>
  );
}

function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const token = localStorage.getItem("token");

  const fetchBook = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books/${bookId}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch book:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await axios.post(
        `http://localhost:5000/api/books/${bookId}/review`,
        { rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitSuccess("Review submitted successfully!");
      setRating(0);
      setReview("");
      fetchBook();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit review.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#070c1a] flex items-center justify-center">
        <p className="text-slate-400">Book not found.</p>
      </div>
    );
  }

  const { book, reviews, averageRating, totalReviews } = data;
  const info = book.volumeInfo;

  return (
    <div className="min-h-screen bg-[#070c1a]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Book hero */}
        <div className="flex flex-col sm:flex-row gap-8 mb-12">
          <div className="flex-shrink-0">
            <div className="w-40 h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 bg-[#0f1629]">
              {info.imageLinks?.thumbnail ? (
                <img
                  src={info.imageLinks.thumbnail.replace("http://", "https://")}
                  alt={info.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight leading-tight">{info.title}</h1>
            {info.subtitle && <p className="text-slate-400 text-lg mb-3">{info.subtitle}</p>}
            <p className="text-emerald-400 font-medium mb-4">{info.authors?.join(", ") || "Unknown Author"}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {info.categories?.map((cat) => (
                <span key={cat} className="px-3 py-1 bg-white/5 border border-white/8 rounded-full text-slate-400 text-xs">{cat}</span>
              ))}
              {info.pageCount && (
                <span className="px-3 py-1 bg-white/5 border border-white/8 rounded-full text-slate-400 text-xs">{info.pageCount} pages</span>
              )}
              {info.publishedDate && (
                <span className="px-3 py-1 bg-white/5 border border-white/8 rounded-full text-slate-400 text-xs">{info.publishedDate.slice(0, 4)}</span>
              )}
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl p-4 w-fit">
              <div>
                <p className="text-3xl font-bold text-amber-400">{averageRating}</p>
                <p className="text-slate-500 text-xs">{totalReviews} {totalReviews === 1 ? "review" : "reviews"}</p>
              </div>
              <div>
                <StarRating value={Math.round(averageRating)} readonly />
                <p className="text-slate-500 text-xs mt-1">Platform rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {info.description && (
          <div className="bg-[#0f1629]/60 border border-white/6 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-3">About this book</h2>
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-6"
              dangerouslySetInnerHTML={{ __html: info.description }}
            />
          </div>
        )}

        {/* Submit review */}
        <div className="bg-[#0f1629]/60 border border-white/6 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Leave a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Your Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Your Review (optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you think of this book?"
                rows={3}
                className="w-full bg-[#070c1a] border border-white/8 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15 transition-all resize-none"
              />
            </div>

            {submitError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">{submitError}</div>
            )}
            {submitSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm">{submitSuccess}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-emerald-900/40"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews list */}
        <div>
          <h2 className="text-white font-semibold mb-4">
            Reviews
            {totalReviews > 0 && <span className="ml-2 text-slate-500 font-normal text-sm">({totalReviews})</span>}
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-[#0f1629]/40 border border-white/6 rounded-2xl">
              <p className="text-slate-500">No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="bg-[#0f1629]/60 border border-white/6 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-bold">
                          {r.user?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <span className="text-white text-sm font-medium">{r.user?.name || "Anonymous"}</span>
                    </div>
                    <StarRating value={r.rating} readonly />
                  </div>
                  {r.review && (
                    <p className="text-slate-400 text-sm leading-relaxed mt-2 ml-11">{r.review}</p>
                  )}
                  <p className="text-slate-600 text-xs mt-3 ml-11">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetails;