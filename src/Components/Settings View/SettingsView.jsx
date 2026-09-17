import React, { useContext } from "react";
import { User } from "../../context/UserContext";

export default function SettingsPanel() {
  const user = useContext(User);

  const isSqlite = user?.storageEngine === "sqlite";

  const dbConfig = isSqlite
    ? {
        label: "Encrypted SQLite Engine",
        detail: "Hardware-bound AES-GCM",
        badge: "Encrypted Node",
        badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      }
    : {
        label: "IndexedDB Engine Layer",
        detail: "Standard browser storage",
        badge: "Active Node",
        badgeStyle: "bg-[#5B44C7]/10 text-[#7a65e8] border-[#5B44C7]/20",
      };

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

          {/* Dynamic Storage Engine Indicator */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">
              Storage Sub-system
            </label>
            <div className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 font-mono flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-200 font-medium">{dbConfig.label}</span>
                <span className="text-[11px] text-zinc-500 font-sans">{dbConfig.detail}</span>
              </div>
              <span
                className={`text-[10px] px-2.5 py-1 rounded border font-sans font-medium tracking-wide uppercase ${dbConfig.badgeStyle}`}
              >
                {dbConfig.badge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}