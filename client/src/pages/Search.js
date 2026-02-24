import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Search() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedBooks, setAddedBooks] = useState(new Set());

  const searchBooks = async () => {
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}`
      );
      setBooks(res.data.items || []);
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchBooks();
  };

  const addToLibrary = async (book) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/library",
        {
          bookId: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors || [],
          thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddedBooks((prev) => new Set([...prev, book.id]));
    } catch (err) {
      alert("Failed to add book");
    }
  };

  return (
    <div className="min-h-screen bg-[#070c1a]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Discover Books
          </h1>
          <p className="text-slate-500">Search and add books to your personal library</p>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center">
            <svg className="absolute left-5 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0f1629] border border-white/8 rounded-2xl pl-14 pr-36 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15 text-sm transition-all shadow-xl"
            />
            <button
              onClick={searchBooks}
              disabled={loading}
              className="absolute right-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-rose-400 mb-6">{error}</p>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && books.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-slate-600">Search for a book to get started</p>
          </div>
        )}

        {/* Results grid */}
        {!loading && books.length > 0 && (
          <>
            <p className="text-slate-500 text-sm mb-6">
              {books.length} results for "<span className="text-slate-300">{query}</span>"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((book) => {
                const added = addedBooks.has(book.id);
                return (
                  <div
                    key={book.id}
                    className="group bg-[#0f1629]/60 border border-white/6 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:bg-[#0f1629] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20 flex flex-col"
                  >
                    {/* Cover */}
                    <div className="relative aspect-[2/3] bg-[#070c1a] overflow-hidden flex-shrink-0">
                      {book.volumeInfo.imageLinks?.thumbnail ? (
                        <img
                          src={book.volumeInfo.imageLinks.thumbnail}
                          alt={book.volumeInfo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      {added && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="bg-emerald-500 rounded-full p-2">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-white font-medium text-xs leading-snug mb-0.5 line-clamp-2">
                        {book.volumeInfo.title}
                      </h3>
                      <p className="text-slate-600 text-xs mb-3 truncate">
                        {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                      </p>
                      <div className="mt-auto">
                        <button
                          onClick={() => addToLibrary(book)}
                          disabled={added}
                          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            added
                              ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                              : "bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-transparent"
                          }`}
                        >
                          {added ? "✓ Added" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Search;