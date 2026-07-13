// glyphboard-client/src/App.jsx
import React, { createContext, useEffect, useState } from "react";
import MainView from "./Components/MainView";
import Sidebar from "./Components/Sidebar";
import LoginModal from "./Components/LoginModel";
import EditorMain from "./Components/MainView/EditorMain";
import RestoringPreviousSession from "./Components/RestoringPreviousSection";
import { motion } from "motion/react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import SettingsView from "./Components/Settings View/SettingsView";
import ModifyView from "./Components/Settings View/ModifyView";
import LogoutView from "./Components/Settings View/LogOutView";
import NewSnippetView from "./Components/MainView/NewSnippetView";

// Initialize standard JavaScript shared context export
export const User = createContext(null);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const InitUser = () => {
    const cachedUser = localStorage.getItem("gb_session_user");

    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setIsLoggedIn(true);
    }

    setAuthLoading(false);
  };

  useEffect(() => {
    InitUser();
  }, []);

  const handleProfileSetup = (userData) => {
    localStorage.setItem("gb_session_user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  if (authLoading) {
    return <RestoringPreviousSession />;
  }

  // Structural rendering helper block
  const handleLogin = () => {
    if (isLoggedIn && user) {
      return (
        <User.Provider value={user}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full flex gap-3 box-border overflow-hidden"
          >
            <Sidebar />
            <MainView />
          </motion.div>
        </User.Provider>
      );
    }
    
    return <LoginModal onLoginSuccess={handleProfileSetup} />;
  };
 
  return (
    <div className="h-screen w-screen overflow-hidden flex gap-3 p-3 bg-zinc-950 text-zinc-100 box-border">
      <Router>
        <Routes>
          {/* Main layout route holds the login handler frame */}
          <Route path="/" element={handleLogin()}>
            
            {/* The index path automatically drops into MainView's <Outlet /> */}
            <Route index element={<EditorMain />} />

            {/* Sub-views and settings panels mapping */}
            <Route path="settings" element={<SettingsView/>} />
            <Route path="settings/modify" element={<ModifyView onLoginSuccess={handleProfileSetup}/>} />
            <Route path="settings/logout" element={<LogoutView/>} />
            <Route path="create-snippet" element={<NewSnippetView/>} />

          </Route>
        </Routes>
      </Router>
    </div>
  );
}