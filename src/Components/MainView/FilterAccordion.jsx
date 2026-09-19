// src/Components/MainView/FilterAccordion.jsx
export default function FilterAccordion({ searchQuery, setSearchQuery }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Filter by title or language..."
        className="w-full px-3 py-2 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700/60 transition"
      />
    </div>
  );
}