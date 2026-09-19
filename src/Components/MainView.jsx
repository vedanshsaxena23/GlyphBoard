// src/Components/MainView.jsx
import { useContext, useState, useEffect } from "react";
import FilterAccordion from "./MainView/FilterAccordion";
import SnippetCard from "./MainView/Snippet";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User } from "../context/UserContext";
import { getAllClips, deleteClip, getActiveEngineInfo } from "../utilities/db.mjs";

export default function MainView() {
  const user = useContext(User);
  const location = useLocation();
  const navigate = useNavigate();

  const [clips, setClips] = useState([]);
  const [activeClip, setActiveClip] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshClips = async (selectNewId = null) => {
    if (!user) return;
    const engineInfo = getActiveEngineInfo();
    if (engineInfo.isEncrypted && !engineInfo.isUnlocked) {
      console.warn("[MainView] Storage locked. Awaiting vault unlock before querying.");
      return;
    }

    try {
      const data = await getAllClips();
      const safeData = Array.isArray(data) ? data : [];
      setClips(safeData);

      if (selectNewId) {
        const newlyCreated = safeData.find((item) => item.id === selectNewId);
        if (newlyCreated) setActiveClip(newlyCreated);
      } else if (safeData.length > 0) {
        setActiveClip((prev) => {
          if (!prev) return safeData[0];
          const exists = safeData.find((item) => item.id === prev.id);
          return exists || safeData[0];
        });
      } else {
        setActiveClip(null);
      }
    } catch (err) {
      console.error("Failed to query records:", err);
    }
  };

  useEffect(() => {
    refreshClips();
  }, []);

  const handleDeleteSnippet = async (id) => {
    try {
      await deleteClip(id);

      if (activeClip?.id === id) {
        setActiveClip(null);
      }

      await refreshClips();
    } catch (err) {
      console.error("Failed to remove target workspace log node:", err);
    }
  };

  const filteredClips = clips.filter((clip) => {
    if (!clip || typeof clip !== "object") return false;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const title = typeof clip.title === "string" ? clip.title.toLowerCase() : "";
    const language = typeof clip.language === "string" ? clip.language.toLowerCase() : "";
    const description = typeof clip.description === "string" ? clip.description.toLowerCase() : "";

    return title.includes(query) || language.includes(query) || description.includes(query);
  });

  const userName =
    typeof user === "string"
      ? user
      : typeof user?.name === "string"
      ? user.name
      : "Developer";

  const routePreferences = {
    "/": {
      title: `Welcome ${userName}`,
      subtitle: "Your Dashboard",
      showDashboardSnippets: true,
    },
    "/create-snippet": {
      title: "Create Snippet",
      subtitle: "Spin up a fresh persistent workspace element",
      showDashboardSnippets: true,
    },
    "/settings": {
      title: "System Settings",
      subtitle: "Configure global parameters and network keys",
      showDashboardSnippets: false,
    },
    "/settings/modify": {
      title: "System Settings",
      subtitle: "Modify your Profile",
      showDashboardSnippets: false,
    },
    "/settings/logout": {
      title: "System Settings",
      subtitle: "Wishing you Good Bye",
      showDashboardSnippets: false,
    },
  };

  const currentConfig = routePreferences[location.pathname] || routePreferences["/"];

  return (
    <main className="flex-1 h-full flex flex-col gap-3 min-w-0">
      {/* HEADER PANELS: Workspace Identity Greeting banner */}
      <header className="h-24 w-full flex items-center justify-between px-6 bg-zinc-900 rounded-2xl border border-zinc-800/40 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {currentConfig.title}
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            {currentConfig.subtitle}
          </p>
        </div>
      </header>

      {/* CORE VIEW PANELS: Left structural list selector + Right code execution space */}
      <div className="flex-1 flex gap-3 min-h-0">
        {currentConfig.showDashboardSnippets ? (
          <section className="w-80 h-full bg-zinc-900 rounded-2xl p-4 overflow-y-auto border border-zinc-800/40 flex flex-col gap-3 box-border">
            <button
              onClick={() => navigate("/create-snippet")}
              className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-semibold transition duration-200 flex items-center justify-center gap-2 shrink-0 shadow-md active:scale-95"
            >
              <span>+</span> New Snippet
            </button>

            {/* Search filter controller */}
            <FilterAccordion searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <div className="flex flex-col gap-2 mt-1">
              {filteredClips.length > 0 ? (
                filteredClips.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveClip(item)}
                    className="cursor-pointer"
                  >
                    <SnippetCard
                      snippet={item}
                      isActive={activeClip?.id === item.id}
                      onDelete={handleDeleteSnippet}
                    />
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-zinc-600 font-mono text-center mt-6 select-none">
                  No matching snippets located
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="w-80 h-full bg-zinc-900 rounded-2xl p-3 border border-zinc-800/40 flex flex-col gap-2 box-border select-none">
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition duration-200 text-left ${
                location.pathname === "/settings/modify"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
              onClick={() => navigate("/settings/modify")}
            >
              <span className="text-sm">👤</span>
              <span>Modify Profile Specs</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition duration-200 text-left ${
                location.pathname === "/settings/logout"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
              onClick={() => navigate("/settings/logout")}
            >
              <span className="text-sm">✕</span>
              <span>Terminate Session (Log out)</span>
            </button>
          </section>
        )}

        <section className="flex-1 h-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/40 box-border">
          <Outlet context={{ activeClip, refreshClips }} />
        </section>
      </div>
    </main>
  );
}