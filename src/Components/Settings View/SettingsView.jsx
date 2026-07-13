import React, { useContext } from "react";
import { User } from "../../App.jsx";

export default function SettingsPanel() {
  const user = useContext(User);

  return (
    <div className="w-full h-full flex flex-col font-sans text-zinc-200 select-none p-6 overflow-y-auto">
      
      {/* Welcome Banner Module */}
      <div className="border-b border-zinc-800/60 pb-6 mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
          Preference Configuration
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Welcome to your control node interface. Modify system-wide parameters, account states, and local storage variables.
        </p>
      </div>

      {/* Primary Workspace Details Shell */}
      <div className="flex flex-col gap-6 max-w-xl animate-[fadeIn_0.2s_ease-out]">
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Active Session Identity
          </h3>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            Parameters bound inside the active layout context memory scope.
          </p>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col gap-4">
          
          {/* Developer Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Signature
            </label>
            <div className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 font-mono tracking-wide">
              {user?.name || "Anonymous Developer"}
            </div>
          </div>

          {/* Designation Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">
              Designation Tier
            </label>
            <div className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 font-mono tracking-wide">
              {user?.designation || "Local Development Environment Scope"}
            </div>
          </div>

          {/* Core Engine Meta Indicator */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">
              Storage Sub-system
            </label>
            <div className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 font-mono flex items-center justify-between">
              <span>IndexedDB Engine Layer</span>
              <span className="text-[10px] bg-[#5B44C7]/10 text-[#7a65e8] px-2 py-0.5 rounded border border-[#5B44C7]/20 font-sans font-medium">
                Active Node
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}