"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse border border-gray-300 dark:border-gray-700" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-14 h-7 p-0.5 rounded-full bg-gray-200/90 dark:bg-gray-800/90 border border-gray-300/80 dark:border-gray-700/80 cursor-pointer transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-inner group"
      aria-label="Toggle light and dark mode"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Background Icons */}
      <div className="flex items-center justify-between w-full px-1.5 pointer-events-none select-none">
        <Sun className="w-3.5 h-3.5 text-amber-500 opacity-70 group-hover:opacity-100 transition-opacity" />
        <Moon className="w-3.5 h-3.5 text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Sliding Knob */}
      <div
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-400 transition-transform duration-300 rotate-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300 rotate-0" />
        )}
      </div>
    </button>
  );
}
