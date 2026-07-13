export default function SnippetCard({ snippet, isActive, onDelete }) {
  const langConfig = {
    javascript: { label: "JS", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    python: { label: "PY", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    c: { label: "C++", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    html: { label: "HTM", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    json: { label: "JSN", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    typescript: { label: "TS", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
    java: { label: "JAV", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    csharp: { label: "C#", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    go: { label: "GO", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    rust: { label: "RST", color: "text-orange-500 bg-orange-600/10 border-orange-600/20" },
    php: { label: "PHP", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    ruby: { label: "RBY", color: "text-rose-500 bg-rose-600/10 border-rose-600/20" },
    swift: { label: "SWF", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    css: { label: "CSS", color: "text-blue-500 bg-blue-600/10 border-blue-600/20" },
    sql: { label: "SQL", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
    image: { label: "IMG", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    file: { label: "FILE", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
    text: { label: "TXT", color: "text-[#f78feb] bg-[#f78feb]/10 border-[#f78feb]/20" }
  };

  const currentLang = langConfig[snippet.language?.toLowerCase()] || { label: "???", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      onDelete(snippet.id);
    }
  };

  const displayDate = snippet.date || (snippet.timestamp ? new Date(snippet.timestamp).toLocaleDateString() : "Just now");

  return (
    <div className={`w-full border rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 group cursor-pointer ${
      isActive 
        ? "bg-zinc-800/40 border-zinc-700 shadow-lg" 
        : "bg-zinc-900/50 hover:bg-zinc-800/40 border-zinc-800"
    }`}>
      
      {/* HEADER SECTION: Title & Custom Language Indicator Logo */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors line-clamp-1">
          {snippet.title}
        </h4>
        
        {/* Custom Visual Language Emblem */}
        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${currentLang.color}`}>
          {currentLang.label}
        </span>
      </div>

      {/* DESCRIPTION SECTION: Simple Text Snippet */}
      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
        {snippet.description || snippet.content || "No description provided for this saved saved board entry."}
      </p>

      {/* ATTACHMENT SECTION: Dynamic Image or File Wrapper */}
      {snippet.attachment && (
        <div className="mt-1 w-full rounded-lg bg-zinc-950/60 border border-zinc-800/80 overflow-hidden">
          {snippet.attachment.type === 'image' ? (
            /* Layout A: Image Asset Preview Window */
            <div className="relative w-full h-24 bg-zinc-900 flex items-center justify-center overflow-hidden">
              <img 
                src={snippet.attachment.url} 
                alt="Attachment Preview" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-1.5 left-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[10px] text-zinc-400 font-medium">
                🖼️ Image Asset
              </div>
            </div>
          ) : (
            /* Layout B: Standalone File Attachment Banner */
            <div className="flex items-center gap-2.5 p-2.5">
              <span className="text-base text-zinc-400">📄</span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-zinc-300 font-medium truncate">
                  {snippet.attachment.name}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {snippet.attachment.size}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER SECTION: Timestamp Meta & Interactive Delete Action */}
      <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2.5 text-[10px] text-zinc-600 font-medium mt-1 select-none">
        <span>{displayDate}</span>
        <span 
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity duration-200 flex items-center gap-1 cursor-pointer active:scale-95"
        >
          Delete Snippet
        </span>
      </div>

    </div>
  );
}