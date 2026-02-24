import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const STATUS_COLORS = {
  READING: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  READ: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  WANT_TO_READ: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

function MyLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/library", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `http://localhost:5000/api/library/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setBooks((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
  };

  const deleteBook = async (id) => {
    await axios.delete(`http://localhost:5000/api/library/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  const filtered = filter === "ALL" ? books : books.filter((b) => b.status === filter);

  const stats = {
    total: books.length,
    reading: books.filter((b) => b.status === "READING").length,
    read: books.filter((b) => b.status === "READ").length,
    want: books.filter((b) => b.status === "WANT_TO_READ").length,
  };

  return (
    <div className="min-h-screen bg-[#070c1a]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">My Library</h1>
          <p className="text-slate-500 text-sm">Your personal reading collection</p>
        </div>

        {books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total Books", value: stats.total, color: "text-white", bg: "bg-white/5" },
              { label: "Reading", value: stats.reading, color: "text-sky-400", bg: "bg-sky-500/10" },
              { label: "Finished", value: stats.read, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Want to Read", value: stats.want, color: "text-amber-400", bg: "bg-amber-500/10" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-white/6`}>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "ALL", label: "All" },
            { key: "READING", label: "Reading" },
            { key: "READ", label: "Finished" },
            { key: "WANT_TO_READ", label: "Want to Read" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === f.key
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/6"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">Your library is empty</h2>
            <p className="text-slate-500 text-sm mb-6">Search for books and add them to start your collection</p>
            <a href="/" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-emerald-900/40">
              Search Books
            </a>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((book) => (
              <div key={book._id} className="group bg-[#0f1629]/60 border border-white/6 rounded-2xl overflow-hidden hover:border-white/12 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col">
                <div className="relative aspect-[2/3] bg-[#070c1a] overflow-hidden flex-shrink-0">
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => deleteBook(book._id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-rose-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-white font-medium text-xs leading-snug mb-0.5 line-clamp-2">{book.title}</h3>
                  <p className="text-slate-600 text-xs mb-3 truncate">{book.authors?.join(", ") || "Unknown"}</p>
                  <div className="mt-auto">
                    <select
                      value={book.status}
                      onChange={(e) => updateStatus(book._id, e.target.value)}
                      className={`w-full border rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none cursor-pointer transition-colors ${STATUS_COLORS[book.status] || "text-slate-400 bg-slate-800 border-white/10"}`}
                    >
                      <option value="WANT_TO_READ" className="bg-[#0f1629] text-white">Want to Read</option>
                      <option value="READING" className="bg-[#0f1629] text-white">Reading</option>
                      <option value="READ" className="bg-[#0f1629] text-white">Read</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLibrary;