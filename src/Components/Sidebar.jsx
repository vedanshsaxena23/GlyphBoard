import "@fontsource/bitcount-prop-single/index.css";
import { useContext } from 'react';
import { User } from "../App";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const user = useContext(User);
  const navigate = useNavigate();

  return (
    <aside className="w-72 h-full flex flex-col justify-between p-6 bg-zinc-900 rounded-2xl border border-zinc-800/50 box-border shadow-2xl">
      
      {/* TOP SECTION: Branding Identity Header & Primary View Navigation Links */}
      <div className="flex flex-col gap-8">
        
        {/* App Identity Header */}
        <div className="flex items-center gap-3.5 px-2" onClick={() => navigate('/')}>
          <img src="./logo.png" alt="GlyphBoard Logo" className="w-10 h-10 rounded-xl object-contain cursor-pointer" />
          <span className="text-3xl tracking-tight text-zinc-100 select-none font-normal cursor-pointer" style={{ fontFamily: "Bitcount Prop Single" }}>
            GlyphBoard
          </span>
        </div>

        {/* Primary Workspace Nav Group */}
        <div className="flex flex-col gap-1">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2 select-none">
            Favorite
          </div>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded-xl text-sm font-medium transition-all duration-200 text-left" onClick={() => navigate('/')}>
            <span className="text-base">📁</span>
            <span>Dashboard</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded-xl text-sm font-medium transition-all duration-200 text-left" onClick={() => navigate('/settings')}>
            <span className="text-base">⚙️</span>
            <span>Settings</span>
          </button>
        </div>

      </div>

      {/* BOTTOM SECTION: Pinned User Profile Footprint */}
      <div className="flex flex-col gap-4 border-t border-zinc-800/60 pt-4">
        
        <div className="flex items-center gap-3 p-1 cursor-pointer hover:bg-zinc-800/20 rounded-xl transition" onClick={() => navigate("/settings")}>
          <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-bold text-sky-400 text-xs tracking-wider select-none shrink-0">
            {user?.name ? user.name.split(" ").map((ele) => ele[0].toUpperCase()).join("") : "??"}
          </div>
          
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-zinc-200 truncate">{user?.name || "Guest Developer"}</span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wide truncate mt-0.5">{user?.designation || "Local Environment"}</span>
          </div>
        </div>

      </div>

    </aside>
  );
}