import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useOutletContext } from "react-router-dom";
import { updateClip } from "../../utilities/db.js";

export default function EditorMain() {
  const { activeClip, refreshClips } = useOutletContext();
  const [editorValue, setEditorValue] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editorValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  useEffect(() => {
    if (activeClip) {
      setEditorValue(activeClip.content);
      setSaveStatus("Saved");
    }
  }, [activeClip?.id]);

  useEffect(() => {
    if (!activeClip || editorValue === activeClip.content) return;

    setSaveStatus("Saving...");

    const delayDebounceFn = setTimeout(async () => {
      try {
        const updatedRecord = {
          ...activeClip,
          content: editorValue,
          timestamp: Date.now(),
        };

        await updateClip(updatedRecord);
        
        setSaveStatus("Saved");
        refreshClips(); 
      } catch (err) {
        console.error("Autosave storage operation failed:", err);
        setSaveStatus("Error Saving");
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [editorValue]); 

  if (!activeClip) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
        No snippets selected. Copy something to start tracking.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900">
      
      {/* Dynamic Sub-header Context Panel */}
      <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-950/20 select-none">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-300">{activeClip.title}</span>
          
          {/* Status Indicator */}
          <span className={`text-[10px] font-mono transition ${
            saveStatus === "Saving..." ? "text-amber-400" : 
            saveStatus === "Error Saving" ? "text-red-400" : "text-zinc-500"
          }`}>
            • {saveStatus}
          </span>
        </div>
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
          {activeClip.language}
        </span>
      </div>

      {/* Monaco Layout Container Frame */}
      <div className="flex-1 min-h-0 w-full">
        <Editor
          theme="vs-dark"
          language={activeClip.language}
          value={editorValue}
          onChange={(newValue) => setEditorValue(newValue || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "Fira Code, JetBrains Mono, monospace",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}