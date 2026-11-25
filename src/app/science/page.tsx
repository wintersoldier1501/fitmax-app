"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useFitmax } from "@/context/FitmaxContext";
import { FlaskConical, Dumbbell, Zap, Activity } from "lucide-react";

const RIR_DATA = [
  {
    rir: 0,
    title: "RIR 0 — Fallo Muscular",
    stimulus: 100,
    fatigue: 95,
    desc: "Máxima tensión mecánica posible, pero fatiga extrema al Sistema Nervioso Central. Úsalo solo en la última serie de aislamiento (poleas/máquinas)."
  },
  {
    rir: 1,
    title: "RIR 1 — 1 Rep en Reserva",
    stimulus: 96,
    fatigue: 75,
    desc: "Punto dulce avanzado para accesorios y últimas series de presses. Altísima hipertrofia con recuperación manejable."
  },
  {
    rir: 2,
    title: "RIR 2 — Estímulo Óptimo Base",
    stimulus: 90,
    fatigue: 55,
    desc: "Recomendación científica principal (Schoenfeld / Helms) para ejercicios compuestos pesados (sentadilla, banca, remo)."
  },
  {
    rir: 3,
    title: "RIR 3 — Calentamiento / Descarga",
    stimulus: 74,
    fatigue: 32,
    desc: "Ideal para primeras series de adaptación, semanas de descarga o días de Readiness bajo (<55%)."
  }
];

export default function SciencePage() {
  const router = useRouter();
  const { profile } = useFitmax();

  const [weightKg, setWeightKg] = useState<number>(profile.weight || 75);
  const [liftWeight, setLiftWeight] = useState<number>(80);
  const [liftReps, setLiftReps] = useState<number>(8);
  const [selectedRir, setSelectedRir] = useState<number>(2);

  // Calculations
  const creatineDose = Math.max(3, Math.min(10, Math.round(weightKg * 0.07 * 10) / 10));
  const caffeineMin = Math.round(weightKg * 3);
  const caffeineMax = Math.round(weightKg * 6);
  const leucineMeal = Math.round(weightKg * 0.04 * 10) / 10;

  const est1RM = Math.round(liftWeight * (1 + liftReps / 30) * 10) / 10;
  const rirInfo = RIR_DATA.find((r) => r.rir === selectedRir) || RIR_DATA[2];

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        minHeight: "100vh",
        padding: "1.8rem 1.4rem 7rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem"
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
        <button
          onClick={() => router.back()}
          style={{
            fontSize: "1.4rem",
            color: "var(--text-main)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, margin: 0, color: "white" }}>Laboratorio Fitmax</h1>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--accent)" }}>Calculadoras científicas basadas en tu peso actual</p>
        </div>
      </header>

      {/* Calculator 1: Exact Ergogenic Dosing by Body Weight */}
      <section className="glass-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--accent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <h2 style={{ fontSize: "1.05rem", color: "white", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <FlaskConical size={18} color="var(--accent)" /> Dosis Exacta por Peso
          </h2>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--accent)" }}>{weightKg} kg</span>
        </div>

        <input
          type="range"
          min="45"
          max="140"
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
          style={{ width: "100%", padding: 0, marginBottom: "1rem", accentColor: "var(--accent)" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.55rem" }}>
          <div style={{ background: "var(--bg-dark)", padding: "0.75rem 0.5rem", borderRadius: "12px", textAlign: "center", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "block" }}>⚡ Creatina</span>
            <strong style={{ color: "var(--accent)", fontSize: "1.05rem" }}>{creatineDose}g</strong>
            <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", display: "block" }}>al día</span>
          </div>
          <div style={{ background: "var(--bg-dark)", padding: "0.75rem 0.5rem", borderRadius: "12px", textAlign: "center", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "block" }}>☕ Cafeína</span>
            <strong style={{ color: "var(--primary)", fontSize: "1rem" }}>{caffeineMin}-{caffeineMax}</strong>
            <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", display: "block" }}>mg pre-entreno</span>
          </div>
          <div style={{ background: "var(--bg-dark)", padding: "0.75rem 0.5rem", borderRadius: "12px", textAlign: "center", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "block" }}>🥩 Leucina</span>
            <strong style={{ color: "#10B981", fontSize: "1.05rem" }}>{leucineMeal}g</strong>
            <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", display: "block" }}>umbral mTOR</span>
          </div>
        </div>
      </section>

      {/* Calculator 2: Interactive 1RM & Loading Zones */}
      <section className="glass-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--primary)" }}>
        <h2 style={{ fontSize: "1.05rem", color: "white", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.85rem" }}>
          <Dumbbell size={18} color="var(--primary)" /> Calculadora 1RM (Fórmula Epley)
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.9rem" }}>
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Peso levantado (kg)</label>
            <input
              type="number"
              min="5"
              step="2.5"
              value={liftWeight}
              onChange={(e) => setLiftWeight(Math.max(1, Number(e.target.value) || 0))}
              style={{ width: "100%", textAlign: "center", fontWeight: 800, background: "var(--bg-dark)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Repeticiones limpias</label>
            <input
              type="number"
              min="1"
              max="30"
              value={liftReps}
              onChange={(e) => setLiftReps(Math.max(1, Number(e.target.value) || 1))}
              style={{ width: "100%", textAlign: "center", fontWeight: 800, background: "var(--bg-dark)" }}
            />
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--primary-subtle)", borderRadius: "12px", border: "1px solid var(--primary-border)", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>1RM Estimado</span>
          <strong style={{ fontSize: "1.6rem", color: "white" }}>{est1RM} kg</strong>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
          {[
            { pct: 0.9, label: "90% Fuerza", reps: "3-4 reps", col: "#EF4444" },
            { pct: 0.75, label: "75% Hipertrofia", reps: "8-10 reps", col: "var(--primary)" },
            { pct: 0.6, label: "60% Tensión", reps: "14-18 reps", col: "var(--accent)" }
          ].map((z) => (
            <div key={z.label} style={{ background: "var(--bg-dark)", padding: "0.6rem 0.35rem", borderRadius: "10px", textAlign: "center", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.66rem", color: z.col, fontWeight: 700, display: "block" }}>{z.label}</span>
              <strong style={{ color: "white", fontSize: "0.95rem" }}>{Math.round(est1RM * z.pct)} kg</strong>
              <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", display: "block" }}>{z.reps}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator 3: Interactive RIR Simulator */}
      <section className="glass-card" style={{ padding: "1.25rem", border: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "1.05rem", color: "white", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem" }}>
          <Zap size={18} color="#F59E0B" /> Simulador Interactivo RIR (Reps en Reserva)
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.45rem", marginBottom: "0.9rem" }}>
          {[0, 1, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRir(r)}
              style={{
                padding: "0.55rem",
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: "0.82rem",
                border: selectedRir === r ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                background: selectedRir === r ? "var(--primary-subtle)" : "var(--bg-dark)",
                color: selectedRir === r ? "white" : "var(--text-muted)"
              }}
            >
              RIR {r}
            </button>
          ))}
        </div>

        <div style={{ background: "var(--bg-dark)", padding: "0.95rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <p style={{ margin: "0 0 0.6rem 0", fontWeight: 800, color: "white", fontSize: "0.9rem" }}>{rirInfo.title}</p>
          <p style={{ margin: "0 0 0.85rem 0", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.45 }}>{rirInfo.desc}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.2rem" }}>
                <span style={{ color: "var(--accent)" }}>Estímulo Hipertrófico</span>
                <span style={{ color: "white", fontWeight: 700 }}>{rirInfo.stimulus}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div style={{ width: `${rirInfo.stimulus}%`, height: "100%", background: "var(--accent)", borderRadius: "3px", transition: "width 0.3s" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.2rem" }}>
                <span style={{ color: "#F59E0B" }}>Fatiga al Sistema Nervioso</span>
                <span style={{ color: "white", fontWeight: 700 }}>{rirInfo.fatigue}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div style={{ width: `${rirInfo.fatigue}%`, height: "100%", background: "#F59E0B", borderRadius: "3px", transition: "width 0.3s" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concurrent Interference Protocol Card */}
      <section className="glass-card" style={{ padding: "1.2rem", borderLeft: "4px solid #10B981" }}>
        <h2 style={{ fontSize: "1.02rem", color: "white", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
          <Activity size={17} color="#10B981" /> Protocolo Interferencia AMPK / mTOR
        </h2>
        <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Correr activa la vía <strong style={{ color: "white" }}>AMPK</strong> y levantar pesas activa <strong style={{ color: "white" }}>mTOR</strong>. Para atletas híbridos: realiza el running intenso con al menos <strong style={{ color: "var(--accent)" }}>6 horas de separación</strong> de pierna pesada (o siempre después de las pesas, nunca antes).
        </p>
      </section>
    </motion.main>
  );
}
