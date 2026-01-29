import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function MyLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    const res = await axios.get("http://localhost:5000/api/library", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBooks(res.data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `http://localhost:5000/api/library/${id}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // update UI instantly
    setBooks((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status } : b))
    );

  };
  const deleteBook = async (id) => {
    await axios.delete(
     `http://localhost:5000/api/library/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // remove from UI
    setBooks((prev) => prev.filter((b) => b._id !== id));

  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <h2>My Library</h2>

      {books.map((book) => (
        <div key={book._id} style={{ margin: "20px 0" }}>
          <h4>{book.title}</h4>
          <p>{book.authors.join(", ")}</p>

          {book.thumbnail && <img src={book.thumbnail} alt="cover" />}

          <select
            value={book.status}
            onChange={(e) => updateStatus(book._id, e.target.value)}
          >
            <option value="WANT_TO_READ">Want to Read</option>
            <option value="READING">Reading</option>
            <option value="READ">Read</option>
          </select>
          <button
            onClick={() => deleteBook(book._id)}
            style={{ marginLeft: "10px" }}
          >
            Remove
          </button>
        </div>
      ))}
    </>
  );
};

export default MyLibrary;
