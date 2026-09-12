import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Builder from "./pages/Builder";
import Billing from "./pages/Billing"
import {Toaster} from "react-hot-toast"

export const serverURL = "https://webmate-ai-server.onrender.com";
export const CLIENT_URL = "http://localhost:5173";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(serverURL + "/api/user/current-user", {
          withCredentials: true,
        });
        setUser(res.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchMe();
  }, []);

  return (
    <>
    <Toaster position="bottom-left"/>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Navbar user={user} setUser={setUser}/>
              <Routes>
                <Route path="/" element={<Home user={user}/>} />
                <Route path="/builder" element={<Builder user={user} setUser={setUser}/>} />
                <Route path="/billing" element={<Billing user={user} setUser={setUser}/>} />
                <Route path="*" element={<Navigate to="/"/>}/>
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
