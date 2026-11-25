"use client";

import { useState, useMemo } from "react";
import { useFitmax, getLocalISODate } from "@/context/FitmaxContext";
import { Flame, TrendingDown, TrendingUp, Dumbbell, Calendar } from "lucide-react";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function ProgressCharts() {
  const {
    dailyHistory,
    weightHistory,
    workoutHistory,
    currentMacros,
    targetMacros,
    waterGlasses,
    profile
  } = useFitmax();

  const [selectedBarIdx, setSelectedBarIdx] = useState<number>(6);

  // Merge last 6 days from dailyHistory + today's live state
  const last7Days = useMemo(() => {
    const todayISO = getLocalISODate();
    const days: {
      date: string;
      label: string;
      calories: number;
      targetCalories: number;
      protein: number;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = getLocalISODate(d);
      const label = i === 0 ? "Hoy" : DAY_LABELS[d.getDay()];

      if (iso === todayISO) {
        days.push({
          date: iso,
          label,
          calories: currentMacros.calories || 0,
          targetCalories: targetMacros.calories || 2000,
          protein: currentMacros.protein || 0
        });
      } else {
        const hist = dailyHistory.find((h) => h.date === iso);
        days.push({
          date: iso,
          label,
          calories: hist?.calories || 0,
          targetCalories: hist?.targetCalories || targetMacros.calories || 2000,
          protein: hist?.protein || 0
        });
      }
    }
    return days;
  }, [dailyHistory, currentMacros, targetMacros]);

  const maxChartCal = Math.max(
    targetMacros.calories || 2200,
    ...last7Days.map((d) => d.calories),
    1500
  );

  // Weight trend points
  const weightPoints = useMemo(() => {
    if (weightHistory.length > 0) return weightHistory.slice(-10);
    if (profile.weight > 0) return [{ date: getLocalISODate(), weight: profile.weight }];
    return [];
  }, [weightHistory, profile.weight]);

  const weightMin = weightPoints.length > 0 ? Math.min(...weightPoints.map((w) => w.weight)) - 1.5 : 60;
  const weightMax = weightPoints.length > 0 ? Math.max(...weightPoints.map((w) => w.weight)) + 1.5 : 85;
  const weightSpan = Math.max(1, weightMax - weightMin);

  const weightDelta =
    weightPoints.length >= 2
      ? Math.round((weightPoints[weightPoints.length - 1].weight - weightPoints[0].weight) * 10) / 10
      : 0;

  // Strength KPIs
  const total7DayVolume = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return workoutHistory.reduce((acc, w) => {
      const t = new Date(`${w.date}T12:00:00`).getTime();
      return !isNaN(t) && t >= cutoff ? acc + (w.totalVolumeKg || 0) : acc;
    }, 0);
  }, [workoutHistory]);

  const sessionsCount7D = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return workoutHistory.filter((w) => {
      const t = new Date(`${w.date}T12:00:00`).getTime();
      return !isNaN(t) && t >= cutoff;
    }).length;
  }, [workoutHistory]);

  const selectedDay = last7Days[selectedBarIdx] || last7Days[6];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      {/* Top KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div className="glass-card" style={{ padding: "1rem", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Dumbbell size={13} color="var(--primary)" /> Volumen (7 Días)
          </span>
          <p style={{ margin: "0.35rem 0 0 0", fontSize: "1.35rem", fontWeight: 800, color: "white" }}>
            {total7DayVolume.toLocaleString()} <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>kg</span>
          </p>
        </div>

        <div className="glass-card" style={{ padding: "1rem", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Calendar size={13} color="var(--accent)" /> Sesiones (7 Días)
          </span>
          <p style={{ margin: "0.35rem 0 0 0", fontSize: "1.35rem", fontWeight: 800, color: "white" }}>
            {sessionsCount7D} <span style={{ fontSize: "0.8rem", color: "var(--accent)" }}>entrenos</span>
          </p>
        </div>
      </div>

      {/* 7-Day Caloric & Protein Adherence Bar Chart */}
      <div className="glass-card" style={{ padding: "1.25rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
          <h3 style={{ fontSize: "0.98rem", color: "white", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Flame size={17} color="var(--primary)" /> Adherencia Calórica (7 Días)
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700 }}>
            Meta: {targetMacros.calories || 2000} kcal
          </span>
        </div>

        {/* Bars Container */}
        <div style={{ position: "relative", height: "130px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.45rem", alignItems: "end", paddingTop: "12px" }}>
          {/* Target Dashed Line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `${Math.min(95, ((targetMacros.calories || 2000) / maxChartCal) * 100)}%`,
              borderTop: "1px dashed rgba(255,255,255,0.25)",
              pointerEvents: "none"
            }}
          />

          {last7Days.map((day, idx) => {
            const pct = Math.min(100, Math.round((day.calories / maxChartCal) * 100));
            const isSelected = idx === selectedBarIdx;
            const hitTarget = day.calories >= day.targetCalories * 0.8 && day.calories <= day.targetCalories * 1.15;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedBarIdx(idx)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "26px",
                    height: `${Math.max(6, pct)}%`,
                    borderRadius: "6px 6px 2px 2px",
                    background:
                      day.calories === 0
                        ? "rgba(255,255,255,0.06)"
                        : hitTarget
                        ? "linear-gradient(180deg, var(--accent), var(--primary))"
                        : "var(--primary)",
                    opacity: isSelected ? 1 : 0.7,
                    border: isSelected ? "1.5px solid white" : "none",
                    transition: "all 0.25s ease"
                  }}
                />
                <span
                  style={{
                    fontSize: "0.68rem",
                    marginTop: "0.35rem",
                    color: isSelected ? "white" : "var(--text-muted)",
                    fontWeight: isSelected ? 800 : 500
                  }}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Day Breakdown */}
        <div
          style={{
            marginTop: "0.9rem",
            padding: "0.7rem 0.9rem",
            background: "var(--bg-dark)",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8rem"
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            <strong style={{ color: "white" }}>{selectedDay.label}</strong> ({selectedDay.date})
          </span>
          <span style={{ color: "white", fontWeight: 700 }}>
            {selectedDay.calories} kcal • <span style={{ color: "var(--primary)" }}>{selectedDay.protein}g P</span>
          </span>
        </div>
      </div>

      {/* Body Weight SVG Trend Chart */}
      <div className="glass-card" style={{ padding: "1.25rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "0.98rem", color: "white", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {weightDelta <= 0 ? (
              <TrendingDown size={17} color="#10b981" />
            ) : (
              <TrendingUp size={17} color="var(--accent)" />
            )}
            Evolución de Peso Corporal
          </h3>
          {weightPoints.length >= 2 && (
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "0.2rem 0.55rem",
                borderRadius: "8px",
                background: weightDelta <= 0 ? "rgba(16,185,129,0.14)" : "var(--accent-subtle)",
                color: weightDelta <= 0 ? "#10b981" : "var(--accent)"
              }}
            >
              {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg neto
            </span>
          )}
        </div>

        {weightPoints.length <= 1 ? (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
            Peso actual registrado: <strong style={{ color: "white" }}>{profile.weight || "-"} kg</strong> (Meta: {profile.targetWeight || "-"} kg). Realiza tu Check-in Semanal en el Inicio para graficar tu tendencia real.
          </p>
        ) : (
          <div>
            <svg viewBox="0 0 300 100" style={{ width: "100%", height: "105px", overflow: "visible" }}>
              <defs>
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {(() => {
                const coords = weightPoints.map((pt, i) => {
                  const x = (i / Math.max(1, weightPoints.length - 1)) * 280 + 10;
                  const y = 85 - ((pt.weight - weightMin) / weightSpan) * 70;
                  return { x, y, weight: pt.weight, date: pt.date };
                });
                const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
                const areaPath = `M ${coords[0].x},90 L ${coords.map((c) => `${c.x},${c.y}`).join(" L ")} L ${coords[coords.length - 1].x},90 Z`;

                return (
                  <>
                    <path d={areaPath} fill="url(#weightAreaGrad)" />
                    <polyline
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polylinePoints}
                    />
                    {coords.map((c, idx) => (
                      <g key={idx}>
                        <circle cx={c.x} cy={c.y} r="4" fill="var(--bg-dark)" stroke="var(--accent)" strokeWidth="2" />
                        {(idx === 0 || idx === coords.length - 1) && (
                          <text x={c.x} y={c.y - 9} textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
                            {c.weight}kg
                          </text>
                        )}
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              <span>Inicio: {weightPoints[0].date}</span>
              <span>Hidratación hoy: {waterGlasses * 250}ml</span>
              <span>Último: {weightPoints[weightPoints.length - 1].date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
