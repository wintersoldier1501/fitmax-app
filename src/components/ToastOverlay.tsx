"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFitmax } from "@/context/FitmaxContext";
import { CheckCircle2, Zap, AlertTriangle, XCircle, Trophy, Shield, Sparkles } from "lucide-react";

export function ToastOverlay() {
  const { toasts, dismissToast, levelUpInfo, closeLevelUp } = useFitmax();

  return (
    <>
      {/* Dynamic Island Floating Toasts */}
      <div
        style={{
          position: "fixed",
          top: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          width: "92%",
          maxWidth: "420px",
          pointerEvents: "none"
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const palette =
              toast.type === "xp"
                ? { bg: "rgba(15, 23, 35, 0.94)", border: "var(--accent)", color: "var(--accent)", Icon: Zap }
                : toast.type === "warning"
                ? { bg: "rgba(25, 20, 10, 0.94)", border: "#F59E0B", color: "#F59E0B", Icon: AlertTriangle }
                : toast.type === "error"
                ? { bg: "rgba(30, 10, 14, 0.94)", border: "#EF4444", color: "#EF4444", Icon: XCircle }
                : { bg: "rgba(12, 24, 20, 0.94)", border: "#10B981", color: "#10B981", Icon: CheckCircle2 };

            const Icon = palette.Icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
                onClick={() => dismissToast(toast.id)}
                style={{
                  pointerEvents: "auto",
                  background: palette.bg,
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid ${palette.border}`,
                  boxShadow: `0 10px 30px rgba(0, 0, 0, 0.65), 0 0 18px ${palette.border}33`,
                  borderRadius: "999px",
                  padding: "0.65rem 1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  cursor: "pointer",
                  maxWidth: "100%"
                }}
              >
                <Icon size={17} color={palette.color} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.2px"
                  }}
                >
                  {toast.message}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Epic Level-Up Rank Celebration Modal */}
      <AnimatePresence>
        {levelUpInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.88)",
              backdropFilter: "blur(12px)",
              zIndex: 10001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem"
            }}
            onClick={closeLevelUp}
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "380px",
                padding: "2.2rem 1.6rem",
                textAlign: "center",
                border: "1px solid var(--primary-border)",
                background: "radial-gradient(circle at top, var(--primary-subtle), var(--bg-surface-solid) 70%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.85), 0 0 40px var(--primary-glow)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem"
              }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "24px",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 30px var(--primary-glow)"
                }}
              >
                <Trophy size={42} color="white" />
              </motion.div>

              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem"
                  }}
                >
                  <Sparkles size={14} /> ¡ASCENSO DE RANGO!
                </span>
                <h2
                  style={{
                    margin: "0.4rem 0 0 0",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}
                >
                  {levelUpInfo.rankName}
                </h2>
                <p style={{ margin: "0.4rem 0 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Has alcanzado <strong style={{ color: "white" }}>{levelUpInfo.xp} XP</strong>. La disciplina siempre cobra con intereses.
                </p>
              </div>

              <div
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.82rem",
                  color: "var(--text-main)"
                }}
              >
                <Shield size={16} color="var(--primary)" />
                <span>Revisa nuevos temas desbloqueados en tu Perfil</span>
              </div>

              <button
                onClick={closeLevelUp}
                className="glow-primary"
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "14px",
                  background: "var(--primary)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "1rem"
                }}
              >
                Seguir Forjando 🔥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
