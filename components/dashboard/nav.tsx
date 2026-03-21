"use client";

import { motion } from "framer-motion";
import { Scale, BarChart3, BookOpen, Search, Bell } from "lucide-react";

const NAV_ITEMS = [
  { label: "Explorer",   icon: Search   },
  { label: "Analytics",  icon: BarChart3 },
  { label: "Precedents", icon: BookOpen  },
];

interface NavProps {
  activeNav?: string;
  onNavClick?: (nav: string) => void;
}

export function Nav({ activeNav = "Explorer", onNavClick }: NavProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b"
      style={{ background: "#0f1117", borderColor: "#1e2231" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center w-7 h-7 rounded"
          style={{ background: "#1a4b8c" }}
        >
          <Scale size={14} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "#e2e8f0" }}>
            Precedent
          </span>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "#60a5fa" }}>
            IQ
          </span>
        </div>
        <span
          className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border"
          style={{ color: "#94a3b8", background: "#1e2231", borderColor: "#2e3347" }}
        >
          BETA
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeNav;
          return (
            <button
              key={item.label}
              onClick={() => onNavClick?.(item.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
              style={{
                background: isActive ? "rgba(26,75,140,0.3)" : "transparent",
                color:      isActive ? "#93c5fd" : "#94a3b8",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
              }}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          className="relative p-1.5 rounded transition-colors"
          style={{ color: "#64748b" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#64748b")}
        >
          <Bell size={16} />
          <span
            className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "#1a4b8c" }}
          />
        </button>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: "#1a4b8c" }}
        >
          JD
        </div>
      </div>
    </motion.header>
  );
}
