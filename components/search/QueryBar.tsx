"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

interface QueryBarProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export function QueryBar({ onSubmit, isLoading }: QueryBarProps) {
  const [value,   setValue]   = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const q = value.trim();
    if (!q || isLoading) return;
    onSubmit(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="max-w-[520px] mx-auto w-full">
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(26,75,140,0.25), 0 2px 8px rgba(26,75,140,0.10)"
            : "0 0 0 1px #e2ddd6",
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
        style={{ background: "#ffffff" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Describe your legal scenario or paste a case citation…"
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
          style={{ color: "#1c1917" }}
        />

        <motion.button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-7 h-7 rounded text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ background: "#1a4b8c" }}
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ArrowRight size={14} />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
