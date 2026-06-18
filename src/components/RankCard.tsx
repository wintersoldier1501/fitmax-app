"use client";

import { motion } from "framer-motion";

interface RankCardProps {
  rankName: string;
  currentXP: number;
  maxXP: number;
  streak: number;
}

export const RankCard = ({ rankName, currentXP, maxXP, streak }: RankCardProps) => {
  const percentage = Math.min(Math.max((currentXP / maxXP) * 100, 0), 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRadius: "16px",
        padding: "1.5rem",
        border: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Glow */}
      <div style={{
        position: "absolute",
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        background: "radial-gradient(circle, rgba(255, 69, 0, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        zIndex: 0
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>Rango Actual</h2>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "2px", textShadow: "0 0 10px rgba(255,69,0,0.5)" }}>
            {rankName}
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(255,69,0,0.1)", padding: "0.5rem 1rem", borderRadius: "50px", border: "1px solid rgba(255,69,0,0.2)" }}>
          <span style={{ fontSize: "1.2rem" }}>🔥</span>
          <span style={{ fontWeight: 700, color: "white" }}>{streak} Días</span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
          <span>Progreso de XP</span>
          <span>{currentXP} / {maxXP} XP</span>
        </div>
        <div style={{ height: "10px", backgroundColor: "var(--bg-dark)", borderRadius: "10px", overflow: "hidden" }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            style={{ height: "100%", backgroundColor: "var(--primary)", boxShadow: "0 0 10px var(--primary)" }}
          />
        </div>
      </div>
    </motion.div>
  );
};
