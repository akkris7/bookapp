import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { logout } = useContext(AuthContext);

  return (
    <div style={{ marginBottom: "20px" }}>
      <Link to="/" style={{ marginRight: "10px" }}>
        Search
      </Link>

      <Link to="/library" style={{ marginRight: "10px" }}>
        My Library
      </Link>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;
