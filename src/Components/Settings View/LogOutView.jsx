import { useNavigate } from "react-router-dom";

export default function LogoutView() {
  const navigate = useNavigate();

 const handleResetProfile = async () => {
    if (
      !window.confirm(
        "Reset profile on this device? This will erase your saved credentials and snippets."
      )
    ) {
      return;
    }

    try {
      // 1. Wipe OS SafeStorage Vault
      if (window.electron?.vault) {
        await window.electron.vault.save(null);
      }

      // 2. Wipe SQLite DB if available
      if (window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke("sqlite-clear-clips").catch(() => {});
      }

      // 3. Wipe IndexedDB database
      const DB_NAME = "GlyphBoardDB";
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

      await new Promise((resolve) => {
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => resolve(); // Proceed even if error
        deleteRequest.onblocked = () => {
          console.warn("Database purge blocked by active background instances.");
          resolve();
        };
      });

      // 4. Remove any residual session storage
      localStorage.removeItem("gb_session_user");
    } catch (err) {
      console.error("Failed to complete profile reset:", err);
    } finally {
      // 5. Navigate to Home and perform a full application reload
      window.location.hash = "#/";
      window.location.reload();
    }
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
            This will drop your current active session workspace cache. You will need to re-authenticate to gain access.
          </p>
        </div>

        {/* Binary Choice Control Layout Array */}
        <div className="flex flex-col w-full gap-2 mt-2">
          <button 
            onClick={handleResetProfile}
            className="w-full py-2.5 bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-900/40 transition duration-200"
          >
            Confirm Termination
          </button>
          
          <button 
            onClick={() => navigate("/settings")}
            className="w-full py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl text-xs font-medium transition duration-200"
          >
            Cancel
          </button>
        </div>

      </div>

    </div>
  );
}