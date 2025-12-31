import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";


function MyLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/library",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBooks(res.data);
      setLoading(false);
    };

    fetchLibrary();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
        <Navbar />
      <h2>My Library</h2>

      {books.length === 0 && <p>No books added yet.</p>}

      {books.map((book) => (
        <div key={book._id} style={{ margin: "20px 0" }}>
          <h4>{book.title}</h4>
          <p>{book.authors.join(", ")}</p>

          {book.thumbnail && (
            <img src={book.thumbnail} alt="cover" />
          )}

          <p>Status: {book.status}</p>
        </div>
      ))}
    </div>
  );
}

export default MyLibrary;
