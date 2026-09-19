// src/Components/Settings View/ModifyView.jsx
import { useState, useContext } from "react";
import { User } from "../../context/UserContext"; 
import { useNavigate } from "react-router-dom";

export default function ModifyView({onLoginSuccess}) {
  const user = useContext(User);

  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [designation, setDesignation] = useState(user?.designation || "");

  const handlesubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) return;

    onLoginSuccess({
      name: name.trim(),
      email: user.email,
      designation: designation.trim()
    })
  }

  return (
    <div className="w-full h-full flex flex-col font-sans text-zinc-200 select-none p-6 overflow-y-auto">
      
      {/* View Header */}
      <div className="border-b border-zinc-800/60 pb-6 mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
          Modify Profile Specs
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Alter your active session credentials below. Changes will apply immediately across your current workspace environment framework.
        </p>
      </div>

      {/* Input Configuration Grid Form */}
      <div className="flex flex-col gap-6 max-w-xl animate-[fadeIn_0.2s_ease-out]">
        
        {/* Name Input Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
            Signature / Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vedansh Saxena"
            className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-100 font-mono tracking-wide placeholder-zinc-700 focus:outline-none focus:border-zinc-700/80 transition duration-200"
          />
        </div>

        {/* Designation Input Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">
            Designation Tier
          </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Cybersecurity Student"
            className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-100 font-mono tracking-wide placeholder-zinc-700 focus:outline-none focus:border-zinc-700/80 transition duration-200"
          />
        </div>

        {/* Action Controls Stack */}
        <div className="flex gap-3 pt-2">
          <button className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-xl transition duration-200" onClick={handlesubmit}>
            Save Changes
          </button>
          <button className="px-4 py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl text-xs font-medium transition duration-200" onClick={(e) => {navigate("/settings")}}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}