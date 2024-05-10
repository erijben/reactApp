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
        const data  = await axios.post("https://nodeapp-ectt.onrender.com/auth/login", { email, password });
        console.log("API response data:", data);

        if (data.accessToken) {
          const decoded = jwtDecode(data.accessToken);
            console.log("Login successful, received data:", data);
            console.log("Rôle décodé :", decoded.role);
            setCurrentUser({ ...data.user, token: data.accessToken, role: decoded.role });
            localStorage.setItem("user", JSON.stringify({ ...data.user, token: data.accessToken, role: decoded.role }));
    
            if (decoded.role === "technicienReseau") {
              console.log("Navigating to dashboard as technicienReseau...");
              navigate('/dashboard');
            } else {
              console.log("Navigating to another page based on role...");
              navigate('/other-route'); // Change to appropriate route based on other roles
            }
          } else {
            console.log("No access token received");
          }
        } catch (error) {
          console.error("Login failed:", error);
          alert('Login failed: ' + (error.response?.data?.message || 'Unknown error'));
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