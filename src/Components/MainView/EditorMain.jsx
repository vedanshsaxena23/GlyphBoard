// src/Components/MainView/EditorMain.jsx
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useOutletContext } from "react-router-dom";
import { updateClip } from "../../utilities/db.mjs";

function getSafeContent(raw) {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof raw.content === "string") {
    return raw.content;
  }
  return "";
}

export default function EditorMain() {
  const { activeClip, refreshClips } = useOutletContext();
  const [editorValue, setEditorValue] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [copied, setCopied] = useState(false);

  const currentClipIdRef = useRef(null);

  const handleCopy = () => {
    if (typeof editorValue === "string") {
      navigator.clipboard.writeText(editorValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (activeClip) {
      currentClipIdRef.current = activeClip.id;
      setEditorValue(getSafeContent(activeClip.content));
      setSaveStatus("Saved");
    }
  }, [activeClip?.id]);

  useEffect(() => {
    if (!activeClip) return;

    const baselineContent = getSafeContent(activeClip.content);
    if (editorValue === baselineContent) return;

    setSaveStatus("Saving...");

    const delayDebounceFn = setTimeout(async () => {
      try {
        const timestamp = Date.now();
        const updatedRecord = {
          ...activeClip,
          content: editorValue,
          updatedAt: timestamp,
        };

        await updateClip(updatedRecord);
        setSaveStatus("Saved");

        if (typeof refreshClips === "function") {
          await refreshClips(activeClip.id);
        }
      } catch (err) {
        console.error("Autosave storage operation failed:", err);
        setSaveStatus("Error Saving");
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [editorValue, activeClip?.id]);

  if (!activeClip) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
        No snippets selected. Copy something to start tracking.
      </div>
    );
  }

  const safeLang = typeof activeClip.language === "string" 
    ? activeClip.language.toLowerCase() 
    : "javascript";

  const displayTitle = typeof activeClip.title === "string" 
    ? activeClip.title 
    : "Untitled Snippet";

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900">
      {/* Dynamic Sub-header Context Panel */}
      <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-950/20 select-none">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-300">
            {displayTitle}
          </span>

          {/* Status Indicator */}
          <span
            className={`text-[10px] font-mono transition ${
              saveStatus === "Saving..."
                ? "text-amber-400"
                : saveStatus === "Error Saving"
                ? "text-red-400"
                : "text-zinc-500"
            }`}
          >
            • {saveStatus}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200 active:scale-95 ${
              copied
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                : "text-zinc-400 bg-zinc-800/40 border-zinc-700/60 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-medium">
            {safeLang}
          </span>
        </div>
      </div>

      {/* Monaco Layout Container Frame */}
      <div className="flex-1 min-h-0 w-full">
        <Editor
          theme="vs-dark"
          language={safeLang}
          value={typeof editorValue === "string" ? editorValue : ""}
          onChange={(newValue) => setEditorValue(newValue ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "Fira Code, JetBrains Mono, monospace",
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}