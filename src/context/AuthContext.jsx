import { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Connect socket after auth
          const socket = connectSocket();
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser.role === "responder") {
            socket.emit("join-responders", parsedUser.id);
          } else {
            socket.emit("join-user", parsedUser.id);
          }
        } catch (error) {
          console.error("Auth init error:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);

      // Connect socket after login
      const socket = connectSocket();
      if (newUser.role === "responder") {
        socket.emit("join-responders", newUser._id);
      } else {
        socket.emit("join-user", newUser._id);
      }

      toast.success("Login successful!");
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);

      // Connect socket after registration
      const socket = connectSocket();
      if (newUser.role === "responder") {
        socket.emit("join-responders", newUser._id);
      } else {
        socket.emit("join-user", newUser._id);
      }

      toast.success("Registration successful!");
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    disconnectSocket();
    toast.info("Logged out successfully");
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    isResponder: user?.role === "responder",
    isEndUser: user?.role === "enduser",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
