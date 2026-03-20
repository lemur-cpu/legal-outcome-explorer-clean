"use client";

import { motion } from "framer-motion";
import { Scale, BarChart3, BookOpen, Users, Bell, Search } from "lucide-react";

const NAV_ITEMS = [
  { label: "Explorer", icon: Search, active: true },
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Precedents", icon: BookOpen, active: false },
  { label: "Judges", icon: Users, active: false },
];

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 bg-surface/90 backdrop-blur-md border-b border-border"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-accent shadow-glow-sm">
          <Scale size={14} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            Precedent
          </span>
          <span className="text-sm font-semibold text-accent tracking-tight">IQ</span>
        </div>
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-muted bg-surface-elevated rounded border border-border">
          BETA
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
              ${item.active
                ? "bg-accent-muted text-accent"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              }
            `}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded text-text-muted hover:text-text-primary transition-colors">
          <Bell size={16} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-white">
          JD
        </div>
      </div>
    </motion.header>
  );
}
