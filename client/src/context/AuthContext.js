import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000/api";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, {
        email,
        password,
    });

    const token = res.data.token;
    localStorage.setItem("token", token);

    // 🔥 IMPORTANT: fetch logged-in user
    const me = await axios.get(`${API}/users/me`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });

    setUser(me.data);
    return true;
};

  const register = async (name, email, password) => {
    await axios.post(`${API}/auth/register`, {
      name,
      email,
      password,
    });
    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
