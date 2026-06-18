"use client";

import { motion } from "framer-motion";

interface MacroRingProps {
  label: string;
  current: number;
  total: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export const MacroRing = ({ label, current, total, color, size = 100, strokeWidth = 8 }: MacroRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(current / total, 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--bg-surface-hover)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1.1
        }}>
          <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>{current}</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>/ {total}g</span>
        </div>
      </div>
      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
};
