// src/Components/Settings View/LogOutView.jsx
import { useNavigate } from "react-router-dom";
import { lockStorage } from "../../utilities/db.mjs";

export default function LogoutView() {
  const navigate = useNavigate();

  const handleResetProfile = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (
      !window.confirm(
        "Reset profile on this device? This will erase your saved credentials, local database, and snippets."
      )
    ) {
      return;
    }

    console.log("================ [RESET STARTED] ================");

    try {
      lockStorage();
      console.log("Step 1/5: lockStorage() executed.");
    } catch (err) {
      console.error("Step 1/5: lockStorage() error:", err?.stack || err?.message || err);
    }

    try {
      if (window.electron?.db?.purge) {
        const purgeRes = await window.electron.db.purge();
        console.log("Step 2/5: SQLite purged successfully. Result:", purgeRes);
      } else {
        console.warn("Step 2/5: window.electron.db.purge not defined.");
      }
    } catch (err) {
      console.error("Step 2/5: SQLite purge error:", err?.stack || err?.message || err);
    }

    try {
      if (window.electron?.vault?.save) {
        const vaultRes = await window.electron.vault.save(null);
        console.log("Step 3/5: Vault cleared. Result:", vaultRes);
      } else {
        console.warn("Step 3/5: window.electron.vault.save not defined.");
      }
    } catch (err) {
      console.error("Step 3/5: Vault save error:", err?.stack || err?.message || err);
    }

    try {
      const DB_NAME = "GlyphBoardDB";
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

      await new Promise((resolve) => {
        deleteRequest.onsuccess = () => {
          console.log("Step 4/5: IndexedDB deleted successfully.");
          resolve();
        };
        deleteRequest.onerror = (ev) => {
          console.error("Step 4/5: IndexedDB delete failed:", ev?.target?.error?.message || "Unknown error");
          resolve();
        };
        deleteRequest.onblocked = () => {
          console.warn("Step 4/5: IndexedDB deletion blocked by an open connection.");
          resolve();
        };
      });
    } catch (err) {
      console.error("Step 4/5: IndexedDB wipe exception:", err?.stack || err?.message || err);
    }

    try {
      localStorage.removeItem("gb_session_user");
      localStorage.removeItem("glyph_storage_mode");
      console.log("Step 5/5: localStorage cleared.");
    } catch (err) {
      console.error("Step 5/5: localStorage clear error:", err?.message || err);
    }

    console.log("================ [RESET COMPLETE - RELOADING] ================");

    window.location.hash = "#/";
    window.location.reload();
  };

  return (
    <div className="w-full h-full flex flex-col font-sans text-zinc-200 select-none p-6 justify-center items-center bg-zinc-900/10">
      {/* Visual Frame Container */}
      <div className="w-full max-w-sm p-6 bg-zinc-900 rounded-2xl border border-zinc-800/60 text-center flex flex-col items-center gap-5 shadow-xl animate-[fadeIn_0.2s_ease-out]">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-lg">
          ✕
        </div>

        {/* Warning Content */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
            Terminate Session?
          </h3>
          <p className="text-xs text-zinc-500 max-w-65 leading-relaxed mx-auto">
            This will wipe your active session, delete the encrypted local database and salt, and reset your workspace.
          </p>
        </div>

        {/* Binary Choice Control Layout Array */}
        <div className="flex flex-col w-full gap-2 mt-2">
          <button
            onClick={handleResetProfile}
            className="w-full py-2.5 bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-900/40 transition duration-200 cursor-pointer"
          >
            Confirm Termination
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="w-full py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl text-xs font-medium transition duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}