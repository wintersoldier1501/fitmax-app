"use client";

import { useState } from "react";
import { useFitmax, getLocalISODate, CardioSessionLog } from "@/context/FitmaxContext";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Flame, Plus, AlertTriangle, X, Activity } from "lucide-react";

const CARDIO_RATES: Record<CardioSessionLog["type"], number> = {
  "Zona 2": 7.5,
  Running: 11,
  HIIT: 12.5,
  "Caminata Inclinada": 6.5
};

export function HybridCardioWidget() {
  const {
    dailySteps,
    stepsGoal,
    updateDailySteps,
    cardioHistory,
    logCardioSession,
    workoutHistory,
    customWorkoutPlan,
    showToast
  } = useFitmax();

  const [showCardioModal, setShowCardioModal] = useState(false);
  const [cardioType, setCardioType] = useState<CardioSessionLog["type"]>("Zona 2");
  const [durationMin, setDurationMin] = useState<number>(30);
  const [distanceKm, setDistanceKm] = useState<string>("4");
  const [customStepsInput, setCustomStepsInput] = useState<string>("");

  const todayISO = getLocalISODate();
  const todayCardio = cardioHistory.filter((c) => c.date === todayISO);
  const todayWorkout = workoutHistory.find((w) => w.date === todayISO);

  // Detect AMPK vs mTOR interference on intense cardio + leg day
  const hasHighIntensityCardioToday = todayCardio.some((c) => c.type === "Running" || c.type === "HIIT");
  const trainedLegsToday = Boolean(
    todayWorkout?.musclesWorked?.some((m) =>
      /pierna|cuádricep|cuadricep|isquio|glúteo|gluteo|gemelo|pantorrilla/i.test(m)
    )
  );
  const splitSuggestsLegs = Boolean(
    customWorkoutPlan?.days?.some((d: any) => /pierna|lower|leg/i.test(d.dayName || ""))
  );
  const showInterferenceWarning = hasHighIntensityCardioToday && (trainedLegsToday || splitSuggestsLegs);

  const stepsPct = Math.min(100, Math.round((dailySteps / Math.max(1, stepsGoal)) * 100));

  const handleSaveCardio = () => {
    const mins = Math.max(5, durationMin || 20);
    const kcal = Math.round(mins * CARDIO_RATES[cardioType]);
    logCardioSession({
      type: cardioType,
      durationMin: mins,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      caloriesBurned: kcal
    });
    setShowCardioModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--text-main)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem"
          }}
        >
          <Footprints size={19} color="var(--primary)" /> Atleta Híbrido
        </h2>
        <button
          onClick={() => setShowCardioModal(true)}
          style={{
            fontSize: "0.76rem",
            fontWeight: 700,
            color: "var(--accent)",
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            padding: "0.3rem 0.65rem",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}
        >
          <Plus size={14} /> Registrar Cardio
        </button>
      </div>

      <div className="glass-card" style={{ padding: "1.15rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
              Pasos Diarios (NEAT)
            </span>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "white" }}>
              {dailySteps.toLocaleString()} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/ {stepsGoal.toLocaleString()}</span>
            </span>
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: stepsPct >= 100 ? "#10b981" : "var(--primary)" }}>
            {stepsPct}%
          </span>
        </div>

        <div style={{ width: "100%", height: "7px", background: "var(--bg-dark)", borderRadius: "4px", overflow: "hidden" }}>
          <div
            style={{
              width: `${stepsPct}%`,
              height: "100%",
              background: stepsPct >= 100 ? "#10b981" : "linear-gradient(90deg, var(--primary), var(--accent))",
              transition: "width 0.35s ease"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => updateDailySteps(dailySteps + 1000)}
            style={{
              padding: "0.38rem 0.65rem",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              color: "white",
              fontSize: "0.76rem",
              fontWeight: 700
            }}
          >
            +1,000
          </button>
          <button
            onClick={() => updateDailySteps(dailySteps + 2500)}
            style={{
              padding: "0.38rem 0.65rem",
              borderRadius: "8px",
              background: "var(--primary-subtle)",
              border: "1px solid var(--primary-border)",
              color: "var(--primary)",
              fontSize: "0.76rem",
              fontWeight: 700
            }}
          >
            +2,500
          </button>
          <div style={{ display: "flex", flex: 1, gap: "0.35rem", minWidth: "130px" }}>
            <input
              type="number"
              placeholder="Ej. 8500"
              value={customStepsInput}
              onChange={(e) => setCustomStepsInput(e.target.value)}
              style={{ flex: 1, padding: "0.35rem 0.6rem", fontSize: "0.78rem", borderRadius: "8px", background: "var(--bg-dark)" }}
            />
            <button
              onClick={() => {
                const n = parseInt(customStepsInput, 10);
                if (!isNaN(n) && n >= 0) {
                  updateDailySteps(n);
                  setCustomStepsInput("");
                  showToast(`Pasos actualizados: ${n.toLocaleString()}`, "success");
                }
              }}
              style={{
                padding: "0.35rem 0.65rem",
                borderRadius: "8px",
                background: "var(--accent)",
                color: "#000",
                fontWeight: 800,
                fontSize: "0.75rem"
              }}
            >
              Fijar
            </button>
          </div>
        </div>

        {todayCardio.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", paddingTop: "0.3rem", borderTop: "1px solid var(--border)" }}>
            {todayCardio.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "white", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Activity size={13} color="var(--accent)" /> {c.type} ({c.durationMin} min{c.distanceKm ? ` • ${c.distanceKm} km` : ""})
                </span>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>~{c.caloriesBurned} kcal</span>
              </div>
            ))}
          </div>
        )}

        {showInterferenceWarning && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "10px",
              padding: "0.7rem",
              display: "flex",
              gap: "0.55rem",
              alignItems: "flex-start"
            }}
          >
            <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "0.74rem", color: "#FDE68A", lineHeight: 1.45 }}>
              <strong>Protocolo Interferencia AMPK / mTOR:</strong> Separa este cardio al menos <strong>6 horas</strong> de tu entrenamiento pesado de pierna y añade +35g a +45g de carbos post-sesión.
            </p>
          </div>
        )}
      </div>

      {/* Cardio Logger Modal */}
      <AnimatePresence>
        {showCardioModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: "100%", maxWidth: "400px", padding: "1.5rem", background: "var(--bg-surface-solid)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Flame size={18} color="var(--primary)" /> Registrar Cardio
                </h3>
                <button onClick={() => setShowCardioModal(false)} style={{ color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem", marginBottom: "1rem" }}>
                {(["Zona 2", "Running", "HIIT", "Caminata Inclinada"] as CardioSessionLog["type"][]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCardioType(t)}
                    style={{
                      padding: "0.65rem",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      border: cardioType === t ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                      background: cardioType === t ? "var(--primary-subtle)" : "var(--bg-dark)",
                      color: cardioType === t ? "white" : "var(--text-muted)"
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.2rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value) || 0)}
                    style={{ width: "100%", background: "var(--bg-dark)", fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    Distancia km (opc.)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    style={{ width: "100%", background: "var(--bg-dark)", fontWeight: 700 }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveCardio}
                className="glow-primary"
                style={{ width: "100%", padding: "0.95rem", borderRadius: "12px", background: "var(--primary)", color: "white", fontWeight: 800 }}
              >
                Guardar Cardio (~{Math.round((durationMin || 20) * CARDIO_RATES[cardioType])} kcal) +60 XP
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
