// glyphboard-client/src/App.jsx
import React, { createContext, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "motion/react";

import MainView from "./Components/MainView";
import Sidebar from "./Components/Sidebar";
import LoginModal from "./Components/LoginModel";
import EditorMain from "./Components/MainView/EditorMain";
import SettingsView from "./Components/Settings View/SettingsView";
import ModifyView from "./Components/Settings View/ModifyView";
import LogoutView from "./Components/Settings View/LogOutView";
import NewSnippetView from "./Components/MainView/NewSnippetView";
import { User } from "./context/UserContext";

// export const User = createContext(null);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuthenticatedSession = (userData) => {
    setCurrentUser(userData);
  };

  return (
    <User.Provider value={currentUser}>
      <div className="h-screen w-screen overflow-hidden flex gap-3 p-3 bg-zinc-950 text-zinc-100 box-border">
        {!currentUser ? (
          <LoginModal onLoginSuccess={handleAuthenticatedSession} />
        ) : (
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full h-full flex gap-3 box-border overflow-hidden"
                  >
                    <Sidebar />
                    <MainView />
                  </motion.div>
                }
              >
                <Route index element={<EditorMain />} />
                <Route path="settings" element={<SettingsView />} />
                <Route path="settings/modify" element={<ModifyView onLoginSuccess={handleAuthenticatedSession} />} />
                <Route path="settings/logout" element={<LogoutView />} />
                <Route path="create-snippet" element={<NewSnippetView />} />
              </Route>
            </Routes>
          </Router>
        )}
      </div>
    </User.Provider>
  );
}