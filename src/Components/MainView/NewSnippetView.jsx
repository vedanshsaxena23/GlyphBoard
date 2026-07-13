import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { addClip } from "../../utilities/db.js"; 

export default function NewSnippetView() {
  const navigate = useNavigate();
  const { refreshClips } = useOutletContext();

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [description, setDescription] = useState("");

  const supportedLanguages = [
    { value: "javascript", label: "JavaScript (JS)" },
    { value: "typescript", label: "TypeScript (TS)" },
    { value: "python", label: "Python (PY)" },
    { value: "c", label: "C++" },
    { value: "csharp", label: "C# (C#)" },
    { value: "html", label: "HTML (HTM)" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON (JSN)" },
    { value: "java", label: "Java (JAV)" },
    { value: "go", label: "Go (GO)" },
    { value: "rust", label: "Rust (RST)" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby (RBY)" },
    { value: "swift", label: "Swift (SWF)" },
    { value: "sql", label: "SQL" },
    { value: "text", label: "Plain Text (TXT)" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      let starterCode = "// Type or paste your code snippet here\n";
      if (language === "python") starterCode = "# Type or paste your code snippet here\nprint('Hello World')";
      if (language === "html") starterCode = "\n<!DOCTYPE html>\n<html>\n</html>";
      if (language === "json") starterCode = "{\n  \"key\": \"value\"\n}";

      const newId = await addClip(
        starterCode,
        language,
        title.trim()
      );

      if (description.trim()) {
        const { openDB } = await import("../../utilities/db.js");
        const db = await openDB();
        const transaction = db.transaction("clips", "readwrite");
        const store = transaction.objectStore("clips");
        
        const fetchReq = store.get(newId);
        fetchReq.onsuccess = () => {
          const data = fetchReq.result;
          data.description = description.trim();
          store.put(data);
        };
      }

      await refreshClips(newId);
      navigate("/");
    } catch (err) {
      console.error("Critical session state compilation exception:", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-sans text-zinc-200 select-none p-6 overflow-y-auto bg-zinc-900/10">
      
      {/* Structural Heading Strip Banner */}
      <div className="border-b border-zinc-800/60 pb-6 mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
          Create New Board Element
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Configure baseline parameters to spin up a fresh persistent runtime snippet workspace block on disk.
        </p>
      </div>

      {/* Input Form Layout Container Stack Array */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl animate-[fadeIn_0.2s_ease-out]">
        
        {/* Input field A: Title Designation */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
            Snippet Signature Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Authentication Hook Middleware"
            className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-100 font-mono tracking-wide placeholder-zinc-700 focus:outline-none focus:border-zinc-700/80 transition duration-200"
          />
        </div>

        {/* Input field B: Language Core Dictionary Key Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
            Language Core Blueprint
          </label>
          <div className="relative w-full">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 font-medium focus:outline-none focus:border-zinc-700/80 transition duration-200 cursor-pointer appearance-none"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-zinc-950 text-zinc-300">
                  {lang.label}
                </option>
              ))}
            </select>
            {/* Custom SVG selector dropdown handle icon */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Input field C: Short Description Text Area block */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
            Description Notes (Optional Summary)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief metadata summary of what this code logic sequence handles..."
            rows={3}
            className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-100 font-sans tracking-wide placeholder-zinc-700 focus:outline-none focus:border-zinc-700/80 transition duration-200 resize-none leading-relaxed"
          />
        </div>

        {/* Binary Form Action Buttons Footer Options Grid */}
        <div className="flex gap-3 pt-2">
          <button 
            type="submit"
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-xl transition duration-200 active:scale-95"
          >
            Deploy Snippet File
          </button>
          <button 
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl text-xs font-medium transition duration-200"
          >
            Dismiss
          </button>
        </div>

      </form>
    </div>
  );
}