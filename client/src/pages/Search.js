import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Search() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔍 Search books from Google Books API
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

  // 📚 Add book to logged-in user's library
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Added to library!");
    } catch (err) {
      alert("Failed to add book");
    }
  };

  return (
    <div>
        <Navbar />
      <h2>Search Books</h2>

      <input
        type="text"
        placeholder="Search for books..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={searchBooks}>Search</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <div>
        {books.map((book) => (
          <div key={book.id} style={{ margin: "20px 0" }}>
            <h4>{book.volumeInfo.title}</h4>
            <p>{book.volumeInfo.authors?.join(", ")}</p>

            {book.volumeInfo.imageLinks && (
              <img
                src={book.volumeInfo.imageLinks.thumbnail}
                alt="cover"
              />
            )}

            {/* ✅ ADD BUTTON */}
            <button onClick={() => addToLibrary(book)}>
              Add to Library
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
