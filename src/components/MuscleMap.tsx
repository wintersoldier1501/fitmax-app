"use client";

import { useState, useMemo } from "react";
import { useFitmax } from "@/context/FitmaxContext";
import { motion } from "framer-motion";
import { Trophy, Activity } from "lucide-react";

export type MuscleGroupKey =
  | "Pecho"
  | "Hombros"
  | "Espalda"
  | "Bíceps"
  | "Tríceps"
  | "Abdomen"
  | "Cuádriceps"
  | "Isquiosurales"
  | "Glúteos"
  | "Pantorrillas";

const ALL_MUSCLES: MuscleGroupKey[] = [
  "Pecho",
  "Hombros",
  "Espalda",
  "Bíceps",
  "Tríceps",
  "Abdomen",
  "Cuádriceps",
  "Isquiosurales",
  "Glúteos",
  "Pantorrillas"
];

export function mapRawMuscleToGroup(raw: string): MuscleGroupKey {
  const s = (raw || "").toLowerCase();
  if (s.includes("pecho") || s.includes("pectoral")) return "Pecho";
  if (s.includes("hombro") || s.includes("deltoide")) return "Hombros";
  if (s.includes("espalda") || s.includes("dorsal") || s.includes("trapecio") || s.includes("erector") || s.includes("lumbar")) return "Espalda";
  if (s.includes("bícep") || s.includes("bicep")) return "Bíceps";
  if (s.includes("trícep") || s.includes("tricep")) return "Tríceps";
  if (s.includes("abdom") || s.includes("core") || s.includes("oblicu")) return "Abdomen";
  if (s.includes("cuádricep") || s.includes("cuadricep") || s.includes("pierna")) return "Cuádriceps";
  if (s.includes("isquio") || s.includes("femoral")) return "Isquiosurales";
  if (s.includes("glúteo") || s.includes("gluteo")) return "Glúteos";
  if (s.includes("gemelo") || s.includes("pantorrilla") || s.includes("gastrocnemio")) return "Pantorrillas";
  return "Pecho";
}

export function MuscleMap() {
  const { workoutHistory, exercisePRs } = useFitmax();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupKey>("Pecho");

  const weeklySets = useMemo(() => {
    const counts: Record<MuscleGroupKey, number> = {
      Pecho: 0,
      Hombros: 0,
      Espalda: 0,
      Bíceps: 0,
      Tríceps: 0,
      Abdomen: 0,
      Cuádriceps: 0,
      Isquiosurales: 0,
      Glúteos: 0,
      Pantorrillas: 0
    };

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const session of workoutHistory) {
      const sessionTime = new Date(`${session.date}T12:00:00`).getTime();
      if (isNaN(sessionTime) || sessionTime < cutoff) continue;

      for (const ex of session.exercises) {
        const completedCount = ex.sets.filter((s) => s.completed).length;
        if (completedCount <= 0) continue;
        const group = mapRawMuscleToGroup(ex.muscle);
        counts[group] += completedCount;
      }
    }
    return counts;
  }, [workoutHistory]);

  const getMuscleFill = (group: MuscleGroupKey) => {
    const sets = weeklySets[group];
    if (sets === 0) return "rgba(255, 255, 255, 0.1)";
    if (sets <= 9) return "var(--accent)";
    if (sets <= 20) return "var(--primary)";
    return "#F59E0B";
  };

  const getMuscleZoneLabel = (sets: number) => {
    if (sets === 0) return { label: "Sin estímulo esta semana", color: "var(--text-muted)" };
    if (sets <= 9) return { label: "Mantenimiento / Calentando (MEV)", color: "var(--accent)" };
    if (sets <= 20) return { label: "Zona Óptima Hipertrofia (MAV)", color: "var(--primary)" };
    return { label: "Alto Volumen — Vigila Fatiga (MRV)", color: "#F59E0B" };
  };

  const selectedSets = weeklySets[selectedMuscle];
  const zone = getMuscleZoneLabel(selectedSets);
  const prEntries = Object.entries(exercisePRs).slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <div className="glass-card" style={{ padding: "1.3rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <h3 style={{ fontSize: "1.05rem", color: "white", display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Activity size={18} color="var(--primary)" /> Mapa de Volumen Semanal (7D)
          </h3>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Toca un músculo</span>
        </div>

        {/* SVG Anatomical Silhouette Front & Back */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", alignItems: "center", justifyItems: "center", padding: "0.4rem 0" }}>
          {/* FRONT VIEW */}
          <div style={{ textAlign: "center", width: "100%" }}>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Frontal</span>
            <svg viewBox="0 0 180 300" style={{ width: "100%", maxWidth: "165px", height: "auto", display: "block", margin: "0.3rem auto 0" }}>
              {/* Head */}
              <circle cx="90" cy="24" r="14" fill="rgba(255,255,255,0.08)" stroke="var(--border)" strokeWidth="1.5" />
              {/* Neck */}
              <rect x="82" y="38" width="16" height="10" rx="4" fill="rgba(255,255,255,0.07)" />

              {/* Shoulders (Hombros) */}
              <path
                d="M52,54 Q40,56 38,76 L54,78 Z M128,54 Q140,56 142,76 L126,78 Z"
                fill={getMuscleFill("Hombros")}
                stroke={selectedMuscle === "Hombros" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Hombros" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Hombros")}
              />

              {/* Chest (Pecho) */}
              <path
                d="M56,52 L88,54 L88,88 L56,84 Z M92,54 L124,52 L124,84 L92,88 Z"
                fill={getMuscleFill("Pecho")}
                stroke={selectedMuscle === "Pecho" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Pecho" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Pecho")}
              />

              {/* Biceps (Bíceps) */}
              <path
                d="M37,80 L52,82 L47,124 L33,122 Z M128,82 L143,80 L147,122 L133,124 Z"
                fill={getMuscleFill("Bíceps")}
                stroke={selectedMuscle === "Bíceps" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Bíceps" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Bíceps")}
              />

              {/* Forearms */}
              <path d="M33,127 L46,128 L40,168 L28,165 Z M134,128 L147,127 L152,165 L140,168 Z" fill="rgba(255,255,255,0.06)" />

              {/* Abdomen / Core */}
              <path
                d="M66,90 L114,90 L110,152 L70,152 Z"
                fill={getMuscleFill("Abdomen")}
                stroke={selectedMuscle === "Abdomen" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Abdomen" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Abdomen")}
              />

              {/* Quads (Cuádriceps) */}
              <path
                d="M62,158 L87,158 L84,226 L60,224 Z M93,158 L118,158 L120,224 L96,226 Z"
                fill={getMuscleFill("Cuádriceps")}
                stroke={selectedMuscle === "Cuádriceps" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Cuádriceps" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Cuádriceps")}
              />

              {/* Calves Front */}
              <path
                d="M62,232 L82,232 L78,284 L64,284 Z M98,232 L118,232 L116,284 L102,284 Z"
                fill={getMuscleFill("Pantorrillas")}
                stroke={selectedMuscle === "Pantorrillas" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Pantorrillas" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Pantorrillas")}
              />
            </svg>
          </div>

          {/* BACK VIEW */}
          <div style={{ textAlign: "center", width: "100%" }}>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Posterior</span>
            <svg viewBox="0 0 180 300" style={{ width: "100%", maxWidth: "165px", height: "auto", display: "block", margin: "0.3rem auto 0" }}>
              {/* Head */}
              <circle cx="90" cy="24" r="14" fill="rgba(255,255,255,0.08)" stroke="var(--border)" strokeWidth="1.5" />

              {/* Shoulders Rear */}
              <path
                d="M52,54 Q40,56 38,76 L54,78 Z M128,54 Q140,56 142,76 L126,78 Z"
                fill={getMuscleFill("Hombros")}
                stroke={selectedMuscle === "Hombros" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Hombros" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Hombros")}
              />

              {/* Back / Lats (Espalda) */}
              <path
                d="M56,48 L124,48 L116,120 L90,136 L64,120 Z"
                fill={getMuscleFill("Espalda")}
                stroke={selectedMuscle === "Espalda" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Espalda" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Espalda")}
              />

              {/* Triceps */}
              <path
                d="M37,80 L52,82 L47,124 L33,122 Z M128,82 L143,80 L147,122 L133,124 Z"
                fill={getMuscleFill("Tríceps")}
                stroke={selectedMuscle === "Tríceps" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Tríceps" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Tríceps")}
              />

              {/* Forearms */}
              <path d="M33,127 L46,128 L40,168 L28,165 Z M134,128 L147,127 L152,165 L140,168 Z" fill="rgba(255,255,255,0.06)" />

              {/* Glutes (Glúteos) */}
              <path
                d="M62,138 L89,140 L89,176 L60,174 Z M91,140 L118,138 L120,174 L91,176 Z"
                fill={getMuscleFill("Glúteos")}
                stroke={selectedMuscle === "Glúteos" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Glúteos" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Glúteos")}
              />

              {/* Hamstrings (Isquiosurales) */}
              <path
                d="M62,180 L87,180 L84,226 L60,224 Z M93,180 L118,180 L120,224 L96,226 Z"
                fill={getMuscleFill("Isquiosurales")}
                stroke={selectedMuscle === "Isquiosurales" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Isquiosurales" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Isquiosurales")}
              />

              {/* Calves (Pantorrillas) */}
              <path
                d="M62,232 L82,232 L78,284 L64,284 Z M98,232 L118,232 L116,284 L102,284 Z"
                fill={getMuscleFill("Pantorrillas")}
                stroke={selectedMuscle === "Pantorrillas" ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "Pantorrillas" ? "2" : "1"}
                style={{ cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setSelectedMuscle("Pantorrillas")}
              />
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><i style={{ width: 9, height: 9, borderRadius: 3, background: "rgba(255,255,255,0.12)", display: "inline-block" }} /> 0 series</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><i style={{ width: 9, height: 9, borderRadius: 3, background: "var(--accent)", display: "inline-block" }} /> 1-9 (MEV)</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><i style={{ width: 9, height: 9, borderRadius: 3, background: "var(--primary)", display: "inline-block" }} /> 10-20 Óptimo</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><i style={{ width: 9, height: 9, borderRadius: 3, background: "#F59E0B", display: "inline-block" }} /> &gt;20 Alto</span>
        </div>

        {/* Selected Muscle Inspector */}
        <motion.div
          key={selectedMuscle}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "0.9rem",
            padding: "0.9rem",
            background: "var(--bg-dark)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem"
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 800, color: "white", fontSize: "0.95rem" }}>{selectedMuscle}</p>
            <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.76rem", color: zone.color, fontWeight: 600 }}>{zone.label}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "white" }}>{selectedSets}</span>
            <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)" }}>series / 7d</span>
          </div>
        </motion.div>

        {/* Quick Muscle Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.75rem" }}>
          {ALL_MUSCLES.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              style={{
                padding: "0.28rem 0.55rem",
                borderRadius: "8px",
                fontSize: "0.7rem",
                fontWeight: selectedMuscle === m ? 700 : 500,
                background: selectedMuscle === m ? "var(--primary-subtle)" : "rgba(255,255,255,0.03)",
                border: selectedMuscle === m ? "1px solid var(--primary-border)" : "1px solid var(--border)",
                color: selectedMuscle === m ? "white" : "var(--text-muted)"
              }}
            >
              {m} ({weeklySets[m]})
            </button>
          ))}
        </div>
      </div>

      {/* Personal Records Leaderboard */}
      <div className="glass-card" style={{ padding: "1.3rem", border: "1px solid var(--border)" }}>
        <h3 style={{ fontSize: "1rem", color: "white", display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.85rem" }}>
          <Trophy size={17} color="#F59E0B" /> Récords Personales (1RM Estimado)
        </h3>
        {prEntries.length === 0 ? (
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: 0 }}>
            Completa series registrando tus pesos (kg) y repeticiones en la pestaña Sesión Activa para desbloquear tus récords de fuerza aquí.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {prEntries.map(([name, pr]) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.7rem 0.85rem",
                  background: "var(--bg-dark)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px"
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.86rem", color: "white" }}>{name}</p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Mejor serie: {pr.weight} kg × {pr.reps} reps • {pr.date}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#F59E0B" }}>{pr.best1RM} kg</span>
                  <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-muted)" }}>1RM Est.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
