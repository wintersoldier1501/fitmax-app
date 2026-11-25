"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, RefreshCw, Flame, Check } from "lucide-react";
import { mapRawMuscleToGroup, MuscleGroupKey } from "./MuscleMap";

interface GymTacticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: any;
  workingWeight: number;
  onSwapExercise: (newExercise: any) => void;
}

const PLATE_COLORS: Record<number, string> = {
  25: "#EF4444",
  20: "#3B82F6",
  15: "#F59E0B",
  10: "#10B981",
  5: "#E4E4E7",
  2.5: "#71717A",
  1.25: "#A1A1AA"
};

const BIOMECHANICAL_SWAPS: Record<MuscleGroupKey, { name: string; muscle: string; sets: string; reps: string; rest: string; cue: string }[]> = {
  Pecho: [
    { name: "Press Inclinado con Mancuernas", muscle: "Pecho", sets: "4", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Inclinación 30°, controla la bajada en 2-3 seg." },
    { name: "Press en Máquina Convergente", muscle: "Pecho", sets: "4", reps: "8-12 (RIR 1)", rest: "2 min", cue: "Escápulas retraídas, empuje explosivo." },
    { name: "Cruces en Polea Alta / Peck Deck", muscle: "Pecho", sets: "3", reps: "12-15 (RIR 1)", rest: "90 seg", cue: "Aprieta 1 seg en máxima contracción." },
    { name: "Fondos en Paralelas Lastrados", muscle: "Pecho", sets: "3", reps: "8-12 (RIR 2)", rest: "2 min", cue: "Inclina ligeramente el torso al frente." }
  ],
  Espalda: [
    { name: "Jalón al Pecho Agarre Neutro", muscle: "Espalda", sets: "4", reps: "8-12 (RIR 2)", rest: "2 min", cue: "Deprime los hombros antes de jalar con los codos." },
    { name: "Remo en Máquina T-Bar o Pecho Apoyado", muscle: "Espalda", sets: "4", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Estira completamente los dorsales en cada rep." },
    { name: "Remo Unilateral con Mancuerna", muscle: "Espalda", sets: "3", reps: "10-12 (RIR 1)", rest: "90 seg", cue: "Lleva la mancuerna hacia la cadera, no al hombro." },
    { name: "Pull-Over en Polea Alta con Cuerda", muscle: "Espalda", sets: "3", reps: "12-15 (RIR 1)", rest: "90 seg", cue: "Brazos casi rectos, siente el dorsal ancho." }
  ],
  Hombros: [
    { name: "Elevaciones Laterales en Polea Baja", muscle: "Hombros", sets: "4", reps: "12-15 (RIR 1)", rest: "90 seg", cue: "Tensión constante desde el primer centímetro." },
    { name: "Press Arnold con Mancuernas", muscle: "Hombros", sets: "3", reps: "8-12 (RIR 2)", rest: "2 min", cue: "Rotación fluida sin impulsar con la espalda." },
    { name: "Elevaciones Laterales en Máquina", muscle: "Hombros", sets: "4", reps: "12-15 (Fallo)", rest: "90 seg", cue: "Sube liderando con los codos." },
    { name: "Face Pulls en Polea", muscle: "Hombros", sets: "3", reps: "15-20 (RIR 1)", rest: "60 seg", cue: "Rotación externa al llevar la cuerda hacia la frente." }
  ],
  Bíceps: [
    { name: "Curl Predicador en Máquina o Banco Scott", muscle: "Bíceps", sets: "3", reps: "10-12 (RIR 1)", rest: "90 seg", cue: "Cero impulso, extiende casi por completo." },
    { name: "Curl Martillo con Mancuernas", muscle: "Bíceps", sets: "3", reps: "10-12 (RIR 1)", rest: "90 seg", cue: "Trabaja braquial y grosor de brazo." },
    { name: "Curl en Polea Baja (Bayesian Curl)", muscle: "Bíceps", sets: "3", reps: "12-15 (Fallo)", rest: "90 seg", cue: "Un paso adelante para máximo estiramiento." },
    { name: "Curl con Barra Z", muscle: "Bíceps", sets: "3", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Codos pegados a las costillas." }
  ],
  Tríceps: [
    { name: "Extensión de Tríceps sobre la Cabeza en Polea", muscle: "Tríceps", sets: "3", reps: "10-12 (RIR 1)", rest: "90 seg", cue: "Estira la cabeza larga al máximo." },
    { name: "Press Francés con Mancuernas", muscle: "Tríceps", sets: "3", reps: "10-12 (RIR 2)", rest: "90 seg", cue: "Baja controlado hacia los costados de la cabeza." },
    { name: "Extensión con Barra Recta en Polea", muscle: "Tríceps", sets: "3", reps: "12-15 (Fallo)", rest: "60 seg", cue: "Bloquea codos y controla 2 seg al subir." },
    { name: "Fondos entre Bancos o Máquina", muscle: "Tríceps", sets: "3", reps: "10-15 (RIR 1)", rest: "90 seg", cue: "Torso vertical para enfocar tríceps." }
  ],
  Cuádriceps: [
    { name: "Sentadilla Hack (Hack Squat)", muscle: "Cuádriceps", sets: "4", reps: "8-10 (RIR 2)", rest: "3 min", cue: "Pies bajos en la plataforma, máxima flexión de rodilla." },
    { name: "Prensa Inclinada 45°", muscle: "Cuádriceps", sets: "4", reps: "10-12 (RIR 1)", rest: "2 min", cue: "No despegues el glúteo del respaldo." },
    { name: "Sentadilla Búlgara con Mancuernas", muscle: "Cuádriceps", sets: "3", reps: "8-10 por pierna", rest: "2 min", cue: "Torso erguido para priorizar cuádriceps." },
    { name: "Extensión de Cuádriceps en Máquina", muscle: "Cuádriceps", sets: "3", reps: "12-15 (Fallo)", rest: "90 seg", cue: "Pausa isométrica de 1s arriba." }
  ],
  Isquiosurales: [
    { name: "Curl Femoral Sentado", muscle: "Isquiosurales", sets: "4", reps: "10-12 (RIR 1)", rest: "90 seg", cue: "Cadera flexionada optimiza la hipertrofia femoral." },
    { name: "Curl Femoral Tumbado", muscle: "Isquiosurales", sets: "3", reps: "10-12 (RIR 1)", rest: "90 seg", cue: "Mantén la pelvis pegada al banco." },
    { name: "Peso Muerto Rumano con Mancuernas", muscle: "Isquiosurales", sets: "4", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Empuja la cadera hacia atrás manteniendo rodillas semi-rígidas." },
    { name: "Buenos Días en Máquina Smith", muscle: "Isquiosurales", sets: "3", reps: "10-12 (RIR 2)", rest: "2 min", cue: "Espalda neutra y bajada controlada." }
  ],
  Glúteos: [
    { name: "Hip Thrust en Máquina o Smith", muscle: "Glúteos", sets: "4", reps: "8-12 (RIR 1)", rest: "2 min", cue: "Retroversión pélvica y pausa arriba 1 seg." },
    { name: "Patada de Glúteo en Polea", muscle: "Glúteos", sets: "3", reps: "12-15 por pierna", rest: "60 seg", cue: "No arquees la lumbar al patear." },
    { name: "Abducción de Cadera en Máquina", muscle: "Glúteos", sets: "3", reps: "15-20 (Fallo)", rest: "60 seg", cue: "Controla el cierre en 2 seg." },
    { name: "Zancadas Caminando Largas", muscle: "Glúteos", sets: "3", reps: "10-12 por pierna", rest: "2 min", cue: "Paso amplio e inclina levemente el torso." }
  ],
  Pantorrillas: [
    { name: "Gemelos en Prensa 45°", muscle: "Pantorrillas", sets: "4", reps: "12-15 (Fallo)", rest: "60 seg", cue: "2 seg de pausa en estiramiento máximo." },
    { name: "Gemelos Sentado (Sóleo)", muscle: "Pantorrillas", sets: "4", reps: "15-20 (Fallo)", rest: "60 seg", cue: "Rango completo sin rebotes." },
    { name: "Gemelos de Pie en Smith", muscle: "Pantorrillas", sets: "4", reps: "12-15 (RIR 1)", rest: "90 seg", cue: "Empuja sobre la base del dedo gordo." },
    { name: "Gemelos Unilateral con Mancuerna", muscle: "Pantorrillas", sets: "3", reps: "15 por pierna", rest: "60 seg", cue: "Sujétate para estabilidad total." }
  ],
  Abdomen: [
    { name: "Crunch en Polea Alta con Cuerda", muscle: "Abdomen", sets: "4", reps: "12-15 (RIR 1)", rest: "60 seg", cue: "Flexiona la columna, no la cadera." },
    { name: "Elevaciones de Piernas Colgado", muscle: "Abdomen", sets: "3", reps: "10-15 (RIR 1)", rest: "90 seg", cue: "Sube la pelvis hacia el pecho." },
    { name: "Rueda Abdominal (Ab Wheel)", muscle: "Abdomen", sets: "3", reps: "10-12 (RIR 2)", rest: "90 seg", cue: "Mantén abdomen contraído para no arquear lumbar." },
    { name: "Plancha Lastrada", muscle: "Abdomen", sets: "3", reps: "45 seg", rest: "60 seg", cue: "Glúteos apretados y respiración nasal." }
  ]
};

function roundTo2_5(val: number): number {
  return Math.max(2.5, Math.round(val / 2.5) * 2.5);
}

export function GymTacticalModal({
  isOpen,
  onClose,
  exercise,
  workingWeight,
  onSwapExercise
}: GymTacticalModalProps) {
  const [tab, setTab] = useState<"plates" | "swap">("plates");
  const [targetWeight, setTargetWeight] = useState<number>(workingWeight > 20 ? workingWeight : 60);
  const [barWeight, setBarWeight] = useState<number>(20);

  useEffect(() => {
    if (isOpen) {
      setTargetWeight(workingWeight > 20 ? workingWeight : 60);
    }
  }, [isOpen, workingWeight]);

  const platesPerSide = useMemo(() => {
    const perSide = Math.max(0, (targetWeight - barWeight) / 2);
    let remaining = Math.round(perSide * 100) / 100;
    const result: number[] = [];
    const available = [25, 20, 15, 10, 5, 2.5, 1.25];
    for (const p of available) {
      while (remaining + 0.01 >= p) {
        result.push(p);
        remaining = Math.round((remaining - p) * 100) / 100;
      }
    }
    return { plates: result, remainder: remaining };
  }, [targetWeight, barWeight]);

  const warmupSets = useMemo(() => {
    return [
      { label: "Serie Aprox 1 (50%)", weight: roundTo2_5(targetWeight * 0.5), reps: "8 reps (Velocidad controlada)" },
      { label: "Serie Aprox 2 (70%)", weight: roundTo2_5(targetWeight * 0.7), reps: "4 reps (Activación neural)" },
      { label: "Serie Aprox 3 (85%)", weight: roundTo2_5(targetWeight * 0.85), reps: "1-2 reps (Potenciación sin fatiga)" }
    ];
  }, [targetWeight]);

  if (!isOpen || !exercise) return null;

  const muscleGroup = mapRawMuscleToGroup(exercise.muscle || exercise.name);
  const swapOptions = BIOMECHANICAL_SWAPS[muscleGroup] || BIOMECHANICAL_SWAPS.Pecho;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center"
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "520px",
            maxHeight: "88vh",
            overflowY: "auto",
            background: "var(--bg-surface-solid)",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            border: "1px solid var(--border)",
            borderBottom: "none",
            padding: "1.4rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 800, textTransform: "uppercase" }}>
                Herramientas Tácticas
              </span>
              <h3 style={{ margin: "0.15rem 0 0 0", color: "white", fontSize: "1.05rem" }}>{exercise.name}</h3>
            </div>
            <button onClick={onClose} style={{ color: "var(--text-muted)", padding: "0.3rem" }}>
              <X size={20} />
            </button>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", background: "var(--bg-dark)", padding: "0.3rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <button
              onClick={() => setTab("plates")}
              style={{
                padding: "0.55rem",
                borderRadius: "9px",
                fontSize: "0.78rem",
                fontWeight: 700,
                background: tab === "plates" ? "var(--primary)" : "transparent",
                color: tab === "plates" ? "white" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <Calculator size={14} /> Discos & Aprox
            </button>
            <button
              onClick={() => setTab("swap")}
              style={{
                padding: "0.55rem",
                borderRadius: "9px",
                fontSize: "0.78rem",
                fontWeight: 700,
                background: tab === "swap" ? "var(--primary)" : "transparent",
                color: tab === "swap" ? "white" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <RefreshCw size={14} /> Máquina Ocupada
            </button>
          </div>

          {tab === "plates" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                    Peso Total Objetivo (kg)
                  </label>
                  <input
                    type="number"
                    step="2.5"
                    min={barWeight}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Math.max(barWeight, Number(e.target.value) || barWeight))}
                    style={{ width: "100%", fontWeight: 800, fontSize: "1.05rem", textAlign: "center", background: "var(--bg-dark)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                    Tipo de Barra
                  </label>
                  <select
                    value={barWeight}
                    onChange={(e) => setBarWeight(Number(e.target.value))}
                    style={{ width: "100%", fontWeight: 700, fontSize: "0.86rem", background: "var(--bg-dark)" }}
                  >
                    <option value={20}>Olímpica (20 kg)</option>
                    <option value={15}>Femenina (15 kg)</option>
                    <option value={10}>Barra Z (10 kg)</option>
                  </select>
                </div>
              </div>

              {/* Visual Barbell Sleeve */}
              <div style={{ background: "var(--bg-dark)", borderRadius: "14px", padding: "1rem", border: "1px solid var(--border)" }}>
                <p style={{ margin: "0 0 0.65rem 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  Cargar en <strong style={{ color: "white" }}>CADA LADO</strong> de la barra:
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "4px", minHeight: "64px", justifyContent: "center", overflowX: "auto" }}>
                  <div style={{ width: "42px", height: "12px", background: "#71717A", borderRadius: "4px 0 0 4px" }} />
                  <div style={{ width: "10px", height: "34px", background: "#A1A1AA", borderRadius: "2px" }} />
                  {platesPerSide.plates.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--accent)", paddingLeft: "0.6rem" }}>Solo barra ({barWeight} kg)</span>
                  ) : (
                    platesPerSide.plates.map((p, i) => {
                      const h = Math.max(28, Math.min(62, 24 + p * 1.5));
                      const col = PLATE_COLORS[p] || "#94A3B8";
                      return (
                        <div
                          key={i}
                          style={{
                            width: p >= 15 ? "22px" : "18px",
                            height: `${h}px`,
                            background: col,
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: p === 5 ? "#000" : "#fff",
                            fontSize: "0.62rem",
                            fontWeight: 900,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.6)"
                          }}
                        >
                          {p}
                        </div>
                      );
                    })
                  )}
                  <div style={{ width: "20px", height: "10px", background: "#52525B", borderRadius: "0 4px 4px 0" }} />
                </div>

                {platesPerSide.plates.length > 0 && (
                  <p style={{ margin: "0.65rem 0 0 0", fontSize: "0.82rem", color: "var(--accent)", textAlign: "center", fontWeight: 700 }}>
                    Por lado: {platesPerSide.plates.map((p) => `${p}kg`).join(" + ")}
                    {platesPerSide.remainder > 0.2 ? ` (+${platesPerSide.remainder}kg dif.)` : ""}
                  </p>
                )}
              </div>

              {/* Warmup Ramps */}
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "14px", padding: "0.95rem", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.55rem" }}>
                  <Flame size={14} /> Series de Aproximación (Sin Fatiga)
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {warmupSets.map((w, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "0.4rem 0.6rem", background: "var(--bg-dark)", borderRadius: "8px" }}>
                      <span style={{ color: "var(--text-muted)" }}>{w.label}</span>
                      <span style={{ color: "white", fontWeight: 700 }}>
                        {w.weight} kg × <span style={{ color: "var(--accent)" }}>{w.reps}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Alternativas biomecánicas para <strong style={{ color: "white" }}>{muscleGroup}</strong>:
              </p>
              {swapOptions.map((opt, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg-dark)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "0.85rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "white" }}>{opt.name}</p>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      {opt.sets}× {opt.reps} • {opt.cue}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSwapExercise(opt);
                      onClose();
                    }}
                    style={{
                      padding: "0.45rem 0.7rem",
                      borderRadius: "9px",
                      background: "var(--primary)",
                      color: "white",
                      fontSize: "0.74rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <Check size={13} /> Usar
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
