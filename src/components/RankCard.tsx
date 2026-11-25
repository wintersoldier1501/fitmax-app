"use client";

import { motion } from "framer-motion";

interface RankCardProps {
  rankName: string;
  currentXP: number;
  maxXP: number;
  streak: number;
  streakShields?: number;
  xpInRank?: number;
}

export const RankCard = ({
  rankName,
  currentXP,
  maxXP,
  streak,
  streakShields = 0,
  xpInRank
}: RankCardProps) => {
  const tierCurrent = xpInRank !== undefined ? xpInRank : currentXP;
  const percentage = Math.min(Math.max((tierCurrent / Math.max(1, maxXP)) * 100, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRadius: "18px",
        padding: "1.4rem",
        border: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: "radial-gradient(circle, var(--primary-subtle) 0%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 0
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.3rem",
          gap: "0.75rem"
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "0.2rem"
            }}
          >
            Rango Actual
          </h2>
          <div
            style={{
              fontSize: "1.65rem",
              fontWeight: 800,
              color: "var(--primary)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              textShadow: "0 0 12px var(--primary-glow)"
            }}
          >
            {rankName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              backgroundColor: "var(--primary-subtle)",
              padding: "0.42rem 0.85rem",
              borderRadius: "50px",
              border: "1px solid var(--primary-border)"
            }}
          >
            <span style={{ fontSize: "1.05rem" }}>🔥</span>
            <span style={{ fontWeight: 700, color: "white", fontSize: "0.88rem" }}>{streak} Días</span>
          </div>
          {streakShields > 0 && (
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--accent)",
                fontWeight: 700,
                background: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
                padding: "0.15rem 0.55rem",
                borderRadius: "999px"
              }}
              title="Escudos criogénicos que salvan tu racha si descansas 1 día"
            >
              🛡️ {streakShields} {streakShields === 1 ? "Escudo" : "Escudos"}
            </span>
          )}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.45rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            fontWeight: 600
          }}
        >
          <span>Siguiente Rango ({tierCurrent} / {maxXP} XP)</span>
          <span style={{ color: "var(--text-main)" }}>Total: {currentXP} XP</span>
        </div>
        <div style={{ height: "10px", backgroundColor: "var(--bg-dark)", borderRadius: "10px", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, var(--primary), var(--accent))",
              boxShadow: "0 0 10px var(--primary-glow)"
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
