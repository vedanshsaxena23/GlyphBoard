import React, { useEffect, useState } from "react";

export default function RestoringSession() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center font-mono select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-zinc-800 border-t-[#5B44C7] rounded-full animate-spin" />
        
        {/* Status Text */}
        <div className="text-center flex flex-col gap-1">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">
            Restoring session{dots}
          </p>
          <p className="text-[10px] text-zinc-600">
            Loading profile configurations
          </p>
        </div>
      </div>
    </div>
  );
}