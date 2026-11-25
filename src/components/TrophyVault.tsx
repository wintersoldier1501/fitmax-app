"use client";

import { useMemo } from "react";
import { useFitmax } from "@/context/FitmaxContext";
import { Award, Lock } from "lucide-react";

export function TrophyVault() {
  const { workoutHistory, exercisePRs, streak, creatineStreak, cardioHistory, dailySteps, stepsGoal, xp, loggedFoods } = useFitmax();

  const trophies = useMemo(() => {
    const totalVolume = workoutHistory.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0);
    const prCount = Object.keys(exercisePRs).length;
    const totalCardio = cardioHistory.length;

    return [
      {
        id: "first_blood",
        icon: "🩸",
        title: "Primera Sangre",
        desc: "Registra tu primer entreno",
        unlocked: workoutHistory.length >= 1,
        progress: Math.min(1, workoutHistory.length) / 1
      },
      {
        id: "pr_breaker",
        icon: "🏆",
        title: "Rompedor de Límites",
        desc: "Rompe tu primer récord PR",
        unlocked: prCount >= 1,
        progress: Math.min(1, prCount) / 1
      },
      {
        id: "ten_tons",
        icon: "🏋️",
        title: "Club 10 Toneladas",
        desc: "Acumula 10,000 kg movidos",
        unlocked: totalVolume >= 10000,
        progress: Math.min(1, totalVolume / 10000)
      },
      {
        id: "invictus_7",
        icon: "🔥",
        title: "7 Días Invicto",
        desc: "Mantén 7 días de racha",
        unlocked: streak >= 7,
        progress: Math.min(1, streak / 7)
      },
      {
        id: "creatine_king",
        icon: "⚡",
        title: "Saturación Creatina",
        desc: "7 días seguidos de 5g creatina",
        unlocked: creatineStreak >= 7,
        progress: Math.min(1, creatineStreak / 7)
      },
      {
        id: "hybrid",
        icon: "🏃",
        title: "Atleta Híbrido",
        desc: "Completa 10k pasos o cardio",
        unlocked: totalCardio >= 1 || dailySteps >= stepsGoal,
        progress: totalCardio >= 1 ? 1 : Math.min(1, dailySteps / Math.max(1, stepsGoal))
      },
      {
        id: "nutrition_master",
        icon: "🥩",
        title: "Disciplina Anabólica",
        desc: "Registra 5+ comidas en diario",
        unlocked: loggedFoods.length >= 5 || xp >= 400,
        progress: Math.min(1, Math.max(loggedFoods.length / 5, xp / 400))
      },
      {
        id: "primarch",
        icon: "⚜️",
        title: "Primarca de Hierro",
        desc: "Alcanza 1,000 XP totales",
        unlocked: xp >= 1000,
        progress: Math.min(1, xp / 1000)
      }
    ];
  }, [workoutHistory, exercisePRs, streak, creatineStreak, cardioHistory, dailySteps, stepsGoal, xp, loggedFoods]);

  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  return (
    <div className="glass-card" style={{ padding: "1.2rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
        <h3 style={{ margin: 0, color: "white", fontSize: "1.02rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Award size={18} color="#F59E0B" /> Vitrina de Medallas
        </h3>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#F59E0B" }}>
          {unlockedCount} / {trophies.length}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
        {trophies.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "0.8rem",
              borderRadius: "12px",
              background: t.unlocked ? "linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(20, 20, 25, 0.8))" : "var(--bg-dark)",
              border: t.unlocked ? "1px solid rgba(245, 158, 11, 0.45)" : "1px solid var(--border)",
              opacity: t.unlocked ? 1 : 0.65,
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.35rem" }}>{t.icon}</span>
              {!t.unlocked && <Lock size={12} color="var(--text-muted)" />}
            </div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "0.8rem", color: t.unlocked ? "white" : "var(--text-muted)" }}>
              {t.title}
            </p>
            <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: 1.3 }}>{t.desc}</p>
            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", marginTop: "0.2rem", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.round(t.progress * 100)}%`,
                  height: "100%",
                  background: t.unlocked ? "#F59E0B" : "var(--primary)"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
