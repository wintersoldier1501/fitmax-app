"use client";

import { useState, useMemo } from "react";
import { useFitmax } from "@/context/FitmaxContext";
import { Clock, TrendingDown, TrendingUp, AlertTriangle, Zap, Footprints, Dumbbell } from "lucide-react";

interface TrajectoryPoint {
  day: number;
  weight: number;
  bf: number;
  leanKg: number;
  fatKg: number;
}

export function BioTimeMachine() {
  const { profile, biometrics, targetMacros, dailyHistory, exercisePRs } = useFitmax();

  const [horizon, setHorizon] = useState<30 | 60 | 90>(90);
  const [adherence, setAdherence] = useState<number>(92);
  const [extraSteps, setExtraSteps] = useState<0 | 3000 | 5000>(0);

  const simulation = useMemo(() => {
    const isFemale = profile.sex === "M"; // "H" = Hombre, "M" = Mujer
    const startWeight = profile.weight > 0 ? profile.weight : isFemale ? 62 : 76;
    const heightCm = profile.height > 0 ? profile.height : isFemale ? 162 : 175;
    const heightM = heightCm / 100;

    let startBF = biometrics.bodyFatPercentage ?? 0;
    if (!startBF || startBF < 4) {
      const bmi = startWeight / (heightM * heightM);
      const rawBf = 1.2 * bmi + 0.23 * (profile.age || 26) - (isFemale ? 5.4 : 16.2);
      startBF = Math.max(8, Math.min(45, Math.round(rawBf * 10) / 10));
    }

    const startFatKg = startWeight * (startBF / 100);
    const startLeanKg = startWeight - startFatKg;

    const bmr = biometrics.leanMass
      ? 370 + 21.6 * biometrics.leanMass
      : 10 * startWeight + 6.25 * heightCm - 5 * (profile.age || 26) + (isFemale ? -161 : 5);

    const activityMults: Record<string, number> = {
      Sedentario: 1.2,
      Ligero: 1.375,
      Moderado: 1.55,
      Intenso: 1.725
    };
    const tdee = Math.round(bmr * (activityMults[profile.activityLevel || ""] || 1.375));

    const plannedCalories =
      targetMacros.calories > 800
        ? targetMacros.calories
        : profile.goal === "Perder Grasa"
          ? tdee - 500
          : profile.goal === "Subir de Peso Limpio"
            ? tdee + 300
            : tdee - 180;

    const validHistory = dailyHistory.filter((d) => d.calories >= 700).slice(-14);
    const calibratedWithHistory = validHistory.length >= 3;
    const avgObserved = calibratedWithHistory
      ? validHistory.reduce((acc, d) => acc + d.calories, 0) / validHistory.length
      : plannedCalories;
    const baselineIntake = calibratedWithHistory
      ? Math.round(0.4 * avgObserved + 0.6 * plannedCalories)
      : plannedCalories;

    const baseDailyDelta = baselineIntake - tdee;
    const extraNeatBurn = (extraSteps / 1000) * 42;

    // Disciplined timeline (Alfa)
    const alfaDailyDelta = baseDailyDelta * (adherence / 100) + (100 - adherence) * 7 - extraNeatBurn;

    let monthlyMuscleRate = (isFemale ? 0.28 : 0.52) * (adherence / 100);
    if (profile.goal === "Subir de Peso Limpio") {
      monthlyMuscleRate = (isFemale ? 0.45 : 0.85) * (adherence / 100);
    } else if (profile.goal === "Perder Grasa") {
      monthlyMuscleRate = adherence >= 84 ? (isFemale ? 0.12 : 0.22) : -0.15;
    }

    // Drift timeline (Sabotaje fin de semana: +1850 kcal Vie-Dom => +264 kcal/día promedio)
    const driftDailyDelta = baseDailyDelta * 0.75 + 264;
    const minFatKg = startWeight * (isFemale ? 0.12 : 0.05);

    const projectAtDay = (day: number, isDrift: boolean): TrajectoryPoint => {
      if (day === 0) {
        return {
          day: 0,
          weight: Math.round(startWeight * 10) / 10,
          bf: Math.round(startBF * 10) / 10,
          leanKg: Math.round(startLeanKg * 100) / 100,
          fatKg: Math.round(startFatKg * 100) / 100
        };
      }

      const leanDelta = isDrift ? monthlyMuscleRate * 0.25 * (day / 30) : monthlyMuscleRate * (day / 30);
      const energyDelta = isDrift ? driftDailyDelta : alfaDailyDelta;
      const rawFatDelta = (energyDelta * day) / 7700 - (isDrift ? 0 : leanDelta * 0.22);

      const nextLean = Math.max(startLeanKg * 0.92, startLeanKg + leanDelta);
      const nextFat = Math.max(minFatKg, startFatKg + rawFatDelta);
      const nextWeight = nextLean + nextFat;
      const nextBf = (nextFat / nextWeight) * 100;

      return {
        day,
        weight: Math.round(nextWeight * 10) / 10,
        bf: Math.round(nextBf * 10) / 10,
        leanKg: Math.round(nextLean * 100) / 100,
        fatKg: Math.round(nextFat * 100) / 100
      };
    };

    const steps = [0, 0.2, 0.4, 0.6, 0.8, 1].map((frac) => Math.round(horizon * frac));
    const alfaCurve = steps.map((d) => projectAtDay(d, false));
    const driftCurve = steps.map((d) => projectAtDay(d, true));

    const alfaEnd = alfaCurve[alfaCurve.length - 1];
    const driftEnd = driftCurve[driftCurve.length - 1];

    const targetDate = new Date(Date.now() + horizon * 86400000).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    // Strength 1RM forecast
    const strengthPctGain = Math.round((horizon / 30) * 2.5 * (adherence / 100) * 10) / 10;
    const topLifts = Object.entries(exercisePRs)
      .sort((a, b) => b[1].best1RM - a[1].best1RM)
      .slice(0, 2)
      .map(([name, pr]) => ({
        name,
        now1RM: Math.round(pr.best1RM),
        future1RM: Math.round(pr.best1RM * (1 + strengthPctGain / 100))
      }));

    return {
      startWeight,
      startBF,
      startLeanKg,
      tdee,
      calibratedWithHistory,
      historyDays: validHistory.length,
      alfaCurve,
      driftCurve,
      alfaEnd,
      driftEnd,
      targetDate,
      strengthPctGain,
      topLifts
    };
  }, [profile, biometrics, targetMacros, dailyHistory, exercisePRs, horizon, adherence, extraSteps]);

  // SVG Dual-Curve geometry
  const W = 340;
  const H = 155;
  const padX = 28;
  const padY = 22;

  const allWeights = [
    ...simulation.alfaCurve.map((p) => p.weight),
    ...simulation.driftCurve.map((p) => p.weight)
  ];
  const minW = Math.min(...allWeights) - 0.8;
  const maxW = Math.max(...allWeights) + 0.8;
  const spanW = Math.max(1.5, maxW - minW);

  const toX = (idx: number, len: number) => padX + (idx / Math.max(1, len - 1)) * (W - padX * 2);
  const toY = (w: number) => H - padY - ((w - minW) / spanW) * (H - padY * 2);

  const alfaPts = simulation.alfaCurve.map((p, i) => `${toX(i, simulation.alfaCurve.length).toFixed(1)},${toY(p.weight).toFixed(1)}`);
  const driftPts = simulation.driftCurve.map((p, i) => `${toX(i, simulation.driftCurve.length).toFixed(1)},${toY(p.weight).toFixed(1)}`);

  const weightDiff = Math.round((simulation.alfaEnd.weight - simulation.startWeight) * 10) / 10;
  const leanDiff = Math.round((simulation.alfaEnd.leanKg - simulation.startLeanKg) * 100) / 100;
  const sabotageGapKg = Math.round(Math.abs(simulation.driftEnd.weight - simulation.alfaEnd.weight) * 10) / 10;

  return (
    <section
      className="glass-card"
      style={{
        padding: "1.2rem",
        border: "1px solid var(--accent-border)",
        background: "linear-gradient(155deg, rgba(0, 229, 255, 0.06), rgba(15, 16, 22, 0.92))",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Clock size={18} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: "1.08rem", color: "white", fontFamily: "var(--font-display)" }}>
              Máquina del Tiempo Bio-Predictiva
            </h2>
          </div>
          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.74rem", color: "var(--text-muted)" }}>
            Tu Gemelo Futuro al <strong style={{ color: "var(--accent)" }}>{simulation.targetDate}</strong> • TDEE est. {simulation.tdee} kcal
          </p>
        </div>
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "0.22rem 0.55rem",
            borderRadius: "999px",
            background: simulation.calibratedWithHistory ? "rgba(16, 185, 129, 0.14)" : "var(--accent-subtle)",
            color: simulation.calibratedWithHistory ? "#10b981" : "var(--accent)",
            border: simulation.calibratedWithHistory ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid var(--accent-border)"
          }}
        >
          {simulation.calibratedWithHistory
            ? `📡 Calibrado (${simulation.historyDays}d reales)`
            : "🧬 Motor Termodinámico"}
        </span>
      </div>

      {/* 30 / 60 / 90 Horizon Pills */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.4rem",
          background: "var(--bg-dark)",
          padding: "0.28rem",
          borderRadius: "12px",
          border: "1px solid var(--border)"
        }}
      >
        {([30, 60, 90] as const).map((d) => (
          <button
            key={d}
            onClick={() => setHorizon(d)}
            style={{
              padding: "0.48rem",
              borderRadius: "9px",
              fontSize: "0.78rem",
              fontWeight: horizon === d ? 800 : 600,
              background: horizon === d ? "var(--accent)" : "transparent",
              color: horizon === d ? "#000" : "var(--text-muted)"
            }}
          >
            {d} Días
          </button>
        ))}
      </div>

      {/* Dual-Curve SVG Chart */}
      <div
        style={{
          background: "rgba(0,0,0,0.35)",
          borderRadius: "14px",
          border: "1px solid var(--border)",
          padding: "0.75rem 0.5rem 0.55rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0.65rem 0.4rem", fontSize: "0.7rem", flexWrap: "wrap", gap: "0.4rem" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: "10px", height: "3px", background: "var(--accent)", display: "inline-block" }} />
            Línea Alfa ({adherence}% disciplina)
          </span>
          <span style={{ color: "#F59E0B", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: "10px", height: "3px", borderTop: "2px dashed #F59E0B", display: "inline-block" }} />
            Deriva (+1,850 kcal/finde)
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
          <defs>
            <linearGradient id="alfaGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal guide lines */}
          {[0.25, 0.5, 0.75].map((f, idx) => (
            <line
              key={idx}
              x1={padX}
              x2={W - padX}
              y1={padY + f * (H - padY * 2)}
              y2={padY + f * (H - padY * 2)}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />
          ))}

          {/* Drift Line (Warning Dashed) */}
          <polyline
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.2"
            strokeDasharray="5 4"
            points={driftPts.join(" ")}
          />

          {/* Alfa Area + Line */}
          <polygon
            fill="url(#alfaGlowGrad)"
            points={`${toX(0, simulation.alfaCurve.length)},${H - padY} ${alfaPts.join(" ")} ${toX(simulation.alfaCurve.length - 1, simulation.alfaCurve.length)},${H - padY}`}
          />
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={alfaPts.join(" ")}
          />

          {/* Start & End Labels */}
          <circle cx={toX(0, simulation.alfaCurve.length)} cy={toY(simulation.startWeight)} r="4" fill="#fff" />
          <text
            x={toX(0, simulation.alfaCurve.length)}
            y={toY(simulation.startWeight) - 8}
            fill="#94a3b8"
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
          >
            {simulation.startWeight}kg
          </text>

          <circle
            cx={toX(simulation.driftCurve.length - 1, simulation.driftCurve.length)}
            cy={toY(simulation.driftEnd.weight)}
            r="4.2"
            fill="#F59E0B"
          />
          <text
            x={toX(simulation.driftCurve.length - 1, simulation.driftCurve.length)}
            y={toY(simulation.driftEnd.weight) - 8}
            fill="#FBBF24"
            fontSize="10"
            fontWeight="700"
            textAnchor="end"
          >
            {simulation.driftEnd.weight}kg
          </text>

          <circle
            cx={toX(simulation.alfaCurve.length - 1, simulation.alfaCurve.length)}
            cy={toY(simulation.alfaEnd.weight)}
            r="5"
            fill="var(--accent)"
          />
          <text
            x={toX(simulation.alfaCurve.length - 1, simulation.alfaCurve.length)}
            y={toY(simulation.alfaEnd.weight) + 15}
            fill="var(--accent)"
            fontSize="10.5"
            fontWeight="800"
            textAnchor="end"
          >
            {simulation.alfaEnd.weight}kg
          </text>
        </svg>
      </div>

      {/* 4 Future Twin KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.75rem" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
            Peso Gemelo Alfa ({horizon}d)
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginTop: "0.2rem" }}>
            <strong style={{ fontSize: "1.22rem", color: "white", fontFamily: "var(--font-display)" }}>
              {simulation.alfaEnd.weight} kg
            </strong>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: weightDiff <= 0 ? "#10b981" : "var(--accent)", display: "flex", alignItems: "center", gap: "2px" }}>
              {weightDiff <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {weightDiff > 0 ? "+" : ""}
              {weightDiff} kg
            </span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.75rem" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
            % Grasa Estimado
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginTop: "0.2rem" }}>
            <strong style={{ fontSize: "1.22rem", color: "var(--accent)", fontFamily: "var(--font-display)" }}>
              {simulation.alfaEnd.bf}%
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              (hoy {simulation.startBF}%)
            </span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.75rem" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
            Masa Muscular Proyectada
          </span>
          <strong style={{ fontSize: "1.1rem", color: leanDiff >= 0 ? "#10b981" : "#EF4444", display: "block", marginTop: "0.2rem" }}>
            {leanDiff >= 0 ? "+" : ""}
            {leanDiff} kg magros
          </strong>
        </div>

        <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "12px", padding: "0.75rem" }}>
          <span style={{ fontSize: "0.68rem", color: "#FBBF24", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <AlertTriangle size={11} /> Impacto Fines de Semana
          </span>
          <strong style={{ fontSize: "1.05rem", color: "#FBBF24", display: "block", marginTop: "0.2rem" }}>
            {sabotageGapKg > 0.2 ? `${sabotageGapKg} kg de freno` : "Ritmo parejo"}
          </strong>
        </div>
      </div>

      {/* 1RM Strength Forecast */}
      <div
        style={{
          background: "var(--primary-subtle)",
          border: "1px solid var(--primary-border)",
          borderRadius: "12px",
          padding: "0.75rem 0.9rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: simulation.topLifts.length ? "0.4rem" : 0 }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Dumbbell size={14} color="var(--primary)" /> Proyección de Fuerza 1RM ({horizon}d)
          </span>
          <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--primary)" }}>
            +{simulation.strengthPctGain}% sobrecarga
          </span>
        </div>
        {simulation.topLifts.length > 0 ? (
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", fontSize: "0.74rem", color: "var(--text-muted)" }}>
            {simulation.topLifts.map((l) => (
              <span key={l.name}>
                <strong style={{ color: "white" }}>{l.name}:</strong> {l.now1RM}kg →{" "}
                <strong style={{ color: "var(--accent)" }}>{l.future1RM}kg</strong>
              </span>
            ))}
          </div>
        ) : (
          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Registra tus entrenos en Gym Log para calcular exactamente cuántos kg subirás en tus básicos.
          </p>
        )}
      </div>

      {/* Interactive What-If Controls */}
      <div
        style={{
          background: "var(--bg-dark)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem"
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Zap size={13} color="var(--accent)" /> Nivel de Disciplina Simulado:
            </span>
            <strong style={{ color: "var(--accent)" }}>{adherence}%</strong>
          </div>
          <input
            type="range"
            min={70}
            max={100}
            step={2}
            value={adherence}
            onChange={(e) => setAdherence(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>

        <div>
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.35rem" }}>
            <Footprints size={13} color="var(--primary)" /> Simulador de NEAT Extra (Pasos diarios adicionales):
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
            {([
              { val: 0, label: "Actual" },
              { val: 3000, label: "+3k pasos" },
              { val: 5000, label: "+5k pasos" }
            ] as const).map((opt) => (
              <button
                key={opt.val}
                onClick={() => setExtraSteps(opt.val)}
                style={{
                  padding: "0.42rem",
                  borderRadius: "9px",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  background: extraSteps === opt.val ? "var(--primary)" : "rgba(255,255,255,0.05)",
                  color: "white",
                  border: "1px solid var(--border)"
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
