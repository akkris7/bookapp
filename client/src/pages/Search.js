import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const API_KEY = "AIzaSyCdDlAm8PZQH7kXU9Bfvmr9YRCmvCYFyxc";

function HighlightedText({ text, query }) {
  if (!query) return <span>{text}</span>;
  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-emerald-400 font-semibold">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  } catch {
    return <span>{text}</span>;
  }
}

function SkeletonCard() {
  return (
    <div className="bg-[#0f1629]/60 border border-white/6 rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[2/3] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="h-2 bg-white/5 rounded w-1/2" />
        <div className="h-7 bg-white/5 rounded mt-3" />
      </div>
    </div>
  );
}

function Search() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedBooks, setAddedBooks] = useState(new Set());
  const [searched, setSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cache = useRef({});
  const dropdownRef = useRef(null);
  const justSearched = useRef(false);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounce suggestions
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setActiveIndex(-1);
      return;
    }

    const cacheKey = `suggest_${query}`;
    if (cache.current[cacheKey]) {
      if (!justSearched.current) {
        setSuggestions(cache.current[cacheKey]);
        setShowDropdown(true);
      } else {
        setSuggestions(cache.current[cacheKey]);
        justSearched.current = false;
      }
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${query}&maxResults=5&orderBy=relevance&key=${API_KEY}`
        );
        const items = res.data.items || [];
        cache.current[cacheKey] = items;
        if (!justSearched.current) {
          setSuggestions(items);
          setShowDropdown(true);
        } else {
          setSuggestions(items);
          justSearched.current = false;
        }
      } catch (err) {
        // silent
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [query]);

  // Smart ranking
  const rankBooks = (items, q) => {
    return [...items].sort((a, b) => {
      const aTitle = a.volumeInfo.title.toLowerCase();
      const bTitle = b.volumeInfo.title.toLowerCase();
      const qLower = q.toLowerCase();

      if (aTitle === qLower) return -1;
      if (bTitle === qLower) return 1;
      if (aTitle.startsWith(qLower) && !bTitle.startsWith(qLower)) return -1;
      if (bTitle.startsWith(qLower) && !aTitle.startsWith(qLower)) return 1;

      return (b.volumeInfo.ratingsCount || 0) - (a.volumeInfo.ratingsCount || 0);
    });
  };

  const searchBooks = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setShowDropdown(false);
    justSearched.current = true;
    setSearched(true);
    setActiveIndex(-1);
    setBooks([]);

    if (cache.current[q]) {
      setBooks(cache.current[q]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${q}&maxResults=20&orderBy=relevance&key=${API_KEY}`
      );
      const items = res.data.items || [];
      const ranked = rankBooks(items, q);
      cache.current[q] = ranked;
      setBooks(ranked);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleSuggestionClick = (book) => {
    const title = book.volumeInfo.title;
    setQuery(title);
    setShowDropdown(false);
    setActiveIndex(-1);
    justSearched.current = true;
    delete cache.current[title];
    searchBooks(title);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === "Enter") searchBooks();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSuggestionClick(suggestions[activeIndex]);
      } else {
        searchBooks();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const addToLibrary = async (book) => {
    setError("");
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
      if (err.response?.status === 400) {
        setError("This book is already in your library!");
      } else {
        setError("Failed to add book. Please try again.");
      }
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

        {/* Search bar + dropdown */}
        <div className="max-w-2xl mx-auto mb-6 relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <svg className="absolute left-5 w-5 h-5 text-slate-500 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0f1629] border border-white/8 rounded-2xl pl-14 pr-36 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15 text-sm transition-all shadow-xl"
            />
            <button
              onClick={() => searchBooks()}
              disabled={loading}
              className="absolute right-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 mt-2 w-full bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Suggestions</p>
              </div>
              {suggestions.map((book, index) => (
                <button
                  key={book.id}
                  onClick={() => handleSuggestionClick(book)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left group ${
                    activeIndex === index ? "bg-emerald-500/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-8 h-11 flex-shrink-0 bg-[#070c1a] rounded overflow-hidden">
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img src={book.volumeInfo.imageLinks.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      <HighlightedText text={book.volumeInfo.title} query={query} />
                    </p>
                    <p className="text-slate-500 text-xs truncate">
                      {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                    </p>
                  </div>
                  <svg className={`w-4 h-4 flex-shrink-0 transition-colors ${activeIndex === index ? "text-emerald-400" : "text-slate-600 group-hover:text-emerald-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm text-center">
              {error}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !searched && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-slate-600">Start typing to discover your next read</p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && books.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No results found for "{query}"</p>
          </div>
        )}

        {/* Results grid */}
        {!loading && books.length > 0 && (
          <>
            <p className="text-slate-500 text-sm mb-6">
              {books.length} results for "<span className="text-slate-300">{query}</span>"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((book, index) => {
                const added = addedBooks.has(book.id);
                const isTopMatch = index === 0;
                return (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="group bg-[#0f1629]/60 border border-white/6 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:bg-[#0f1629] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20 flex flex-col"
                  >
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
                      {isTopMatch && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                          ⭐ Top
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
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-white font-medium text-xs leading-snug mb-0.5 line-clamp-2">
                        {book.volumeInfo.title}
                      </h3>
                      <p className="text-slate-600 text-xs mb-3 truncate">
                        {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                      </p>
                      <div className="mt-auto">
                        <button
                          onClick={(e) => { e.stopPropagation(); addToLibrary(book); }}
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