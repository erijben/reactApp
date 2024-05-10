import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import from 'jwt-decode'

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userDetails = JSON.parse(user);
      const decoded = jwtDecode(userDetails.token); // Decode to verify and extract roles immediately
      return { ...userDetails, role: decoded.role };
    }
    return null;
  });

  const login = async (email, password) => {
    try {
      const response = await axios.post("https://nodeapp-ectt.onrender.com/auth/login", { email, password });
      if (response.data.accessToken) {
        const decoded = jwtDecode(response.data.accessToken);
        const user = { token: response.data.accessToken, role: decoded.role, ...response.data.user };
        setCurrentUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        navigate(decoded.role === "technicienReseau" ? '/dashboard' : '/other-route');
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || "Unknown error");
      alert(`Login failed: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate('/');
  };

  useEffect(() => {
    console.log("Current user role:", currentUser?.role);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
