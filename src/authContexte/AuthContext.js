import axios from "axios";
import { createContext, useContext,useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
        console.log("Sending login request...");
        const data  = await axios.post("http://localhost:3001/auth/login", { email, password });
        console.log("API response data:", data);

        if (data.accessToken) {
            console.log("Login successful, received data:", data);
            console.log("Rôle décodé :", data.user.role);
            setCurrentUser({ ...data.user, token: data.accessToken });
            localStorage.setItem("user", JSON.stringify({ ...data.user, token: data.accessToken }));
// Vérifier si le token JWT est stocké dans le localStorage
const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;

if (token) {
  console.log("Le token JWT est stocké dans le localStorage :", token);
} else {
  console.log("Aucun token JWT n'est stocké dans le localStorage.");
}
if (token) {
  const decoded = jwtDecode(token);
  console.log(decoded);
  // Pour vérifier si le rôle est inclus
  console.log("Le rôle inclus dans le token est :", decoded.role);
}

            console.log("Navigating to dashboard...");
            navigate('/dashboard');
        } else {
            console.log("No access token received");
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
};

  const logout = async () => {
    localStorage.removeItem("user");
    setCurrentUser(null); // Update the currentUser state after logout
  };
  useEffect(() => {
    if (currentUser && currentUser.token) {
        const decoded = jwtDecode(currentUser.token);
        console.log("Current user details:", decoded);
        console.log("Current user role:", decoded.role);
    }
}, [currentUser]);

useEffect(() => {
    console.log("Current user changed:", currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));
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