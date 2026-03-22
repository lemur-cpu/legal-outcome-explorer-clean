"use client";

import { motion } from "framer-motion";
import { BarChart3, BookOpen, Search, Github } from "lucide-react";

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
      {/* Logo — text only, no icon */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-tight" style={{ color: "#e2e8f0", fontFamily: "Inter, sans-serif" }}>
          Precedent
        </span>
        <span className="text-sm font-semibold tracking-tight" style={{ color: "#4f8ef7", fontFamily: "Inter, sans-serif" }}>
          IQ
        </span>
        <span
          className="ml-0.5 px-1 py-0.5 rounded border"
          style={{ color: "#94a3b8", background: "#1e2231", borderColor: "#2e3347", fontFamily: "IBM Plex Mono, monospace", fontSize: 8 }}
        >
          BETA
        </span>
      </div>

      {/* Nav — centered with more spacing */}
      <nav className="hidden md:flex items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeNav;
          return (
            <button
              key={item.label}
              onClick={() => onNavClick?.(item.label)}
              className="flex items-center gap-1.5 text-sm font-medium rounded-md transition-colors"
              style={{
                padding:    "6px 16px",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color:      isActive ? "#ffffff" : "#94a3b8",
                transition: "background 150ms, color 150ms",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                }
              }}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right — GitHub link only */}
      <a
        href="https://github.com/courtneyquinn/legal-outcome-explorer-clean"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#ffffff")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)")}
      >
        <Github size={15} />
        <span style={{ fontSize: 13 }}>View on GitHub</span>
      </a>
    </motion.header>
  );
}
