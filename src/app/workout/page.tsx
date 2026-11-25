"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./workout.module.css";
import { useFitmax, SetRecord, ExerciseSessionRecord } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DailyWisdom } from "@/components/DailyWisdom";
import { MuscleMap } from "@/components/MuscleMap";
import {
  Sparkles,
  Wand2,
  Check,
  X,
  Clock,
  Shield,
  CheckCircle2,
  Trophy,
  Loader2,
  Timer,
  Flame,
  Brain,
  Dumbbell,
  Activity
} from "lucide-react";

const homeWorkouts = [
  {
    name: "Push (Casa) - Hipertrofia RIR 1",
    duration: "45 min",
    targetMuscles: "Pecho, Hombro anterior, Tríceps",
    exercises: [
      { name: "Flexiones Declinadas", muscle: "Pecho", sets: "4", reps: "Al fallo -1 RIR", rest: "90 seg", cue: "Pies elevados en silla, pausa de 1s abajo." },
      { name: "Pike Push-ups", muscle: "Hombros", sets: "4", reps: "8-12 (RIR 2)", rest: "90 seg", cue: "Cadera alta, cabeza hacia adelante formando un triángulo." },
      { name: "Fondos en Silla", muscle: "Tríceps", sets: "3", reps: "12-15 (RIR 1)", rest: "60 seg", cue: "Codos pegados al cuerpo, rango completo." }
    ]
  },
  {
    name: "Pull (Casa) - Tensión Mecánica",
    duration: "40 min",
    targetMuscles: "Espalda, Bíceps, Core",
    exercises: [
      { name: "Dominadas o Remos Invertidos", muscle: "Espalda", sets: "4", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Inicia con depresión escapular y lleva el pecho a la barra." },
      { name: "Superman Holds", muscle: "Espalda", sets: "3", reps: "45 seg sostenido", rest: "60 seg", cue: "Aprieta glúteos y lumbares con respiración controlada." },
      { name: "Curl de Bíceps con Mochila", muscle: "Bíceps", sets: "3", reps: "12-15 (RIR 1)", rest: "60 seg", cue: "Fase excéntrica de 3 seg sin balancear el torso." }
    ]
  }
];

const gymWorkouts = [
  {
    name: "Día 1: Upper Body (Enfoque Tensión Mecánica)",
    duration: "60 min",
    targetMuscles: "Pecho, Espalda, Hombros, Brazos",
    exercises: [
      { name: "Press de Banca con Barra", muscle: "Pecho", sets: "4", reps: "6-8 (RIR 2)", rest: "3 min", cue: "Retracción escapular firme, arco natural y pausa de 1s en el pecho." },
      { name: "Remo con Barra (Pendlay)", muscle: "Espalda", sets: "4", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Espalda paralela al suelo, tracción explosiva hacia el abdomen." },
      { name: "Press Militar con Mancuernas", muscle: "Hombros", sets: "3", reps: "10-12 (RIR 1)", rest: "2 min", cue: "Codos ligeramente al frente, bloqueo controlado." },
      { name: "Curl de Bíceps en Banco Inclinado", muscle: "Bíceps", sets: "3", reps: "12-15 (Fallo)", rest: "90 seg", cue: "Máximo estiramiento en la posición inferior." }
    ]
  },
  {
    name: "Día 2: Lower Body (Enfoque Cuádriceps/Glúteo)",
    duration: "65 min",
    targetMuscles: "Cuádriceps, Glúteos, Isquiosurales, Gemelos",
    exercises: [
      { name: "Sentadilla Libre (Barra Alta)", muscle: "Cuádriceps", sets: "4", reps: "5-8 (RIR 2)", rest: "3 min", cue: "Rompe el paralelo con rodillas siguiendo la punta de los pies." },
      { name: "Peso Muerto Rumano", muscle: "Isquiosurales", sets: "4", reps: "8-10 (RIR 1)", rest: "2 min", cue: "Bisagra de cadera pura, siente la máxima tensión en femorales." },
      { name: "Prensa de Piernas", muscle: "Cuádriceps", sets: "3", reps: "12-15 (Fallo)", rest: "2 min", cue: "Pies a mitad de plataforma, baja profundo sin despegar cadera." },
      { name: "Elevación de Gemelos de Pie", muscle: "Pantorrillas", sets: "4", reps: "15-20 (Fallo)", rest: "90 seg", cue: "Pausa de 2 seg en máximo estiramiento abajo." }
    ]
  }
];

const cyclingScienceTips = [
  "Optimizando volumen MAV (10-20 series semanales por grupo muscular)...",
  "Alineando el perfil de resistencia según el equipamiento elegido...",
  "Estructurando descansos inter-series para máxima resíntesis de ATP...",
  "Ajustando intensidad RIR 1-3 para hipertrofia miofibrilar pura..."
];

function parseRestSeconds(restText?: string): number {
  if (!restText) return 90;
  const s = restText.toLowerCase();
  const numMatch = s.match(/(\d+(?:[.,]\d+)?)/);
  const val = numMatch ? parseFloat(numMatch[1].replace(",", ".")) : 90;
  if (s.includes("min")) return Math.round(val * 60);
  return Math.round(val);
}

function playTimerChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.14);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.14);
      osc.stop(ctx.currentTime + i * 0.14 + 0.3);
    });
  } catch {
    // Ignore audio context block if browser disallows
  }
}

export default function Workout() {
  const router = useRouter();
  const {
    isLoaded,
    profile,
    customWorkoutPlan,
    saveWorkoutPlan,
    addXp,
    todayReadiness,
    exercisePRs,
    getLastExercisePerformance,
    logWorkoutSession,
    showToast
  } = useFitmax();

  // Page Tab
  const [pageView, setPageView] = useState<"session" | "analytics">("session");

  // Modal State
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [equipment, setEquipment] = useState("Gimnasio Comercial Completo");
  const [focus, setFocus] = useState("Balanceado Estético");
  const [level, setLevel] = useState("Intermedio");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scienceTipIdx, setScienceTipIdx] = useState(0);
  const [generatedPreview, setGeneratedPreview] = useState<any>(null);

  // Active Routine State
  const [activeDayTab, setActiveDayTab] = useState(0);
  const [viewStandardFallback, setViewStandardFallback] = useState(false);
  const [fallbackLocation, setFallbackLocation] = useState<"home" | "gym">("gym");
  const [fallbackRoutineIdx, setFallbackRoutineIdx] = useState(0);
  const [autoRegulate, setAutoRegulate] = useState(false);

  // Set-by-set interactive state keyed by `${dayContext}_${exerciseIdx}` -> SetRecord[]
  const [exerciseSetsMap, setExerciseSetsMap] = useState<Record<string, SetRecord[]>>({});
  const sessionStartRef = useRef<number>(Date.now());

  // Rest Timer State
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [restTotalSeconds, setRestTotalSeconds] = useState<number>(90);
  const [isResting, setIsResting] = useState<boolean>(false);

  // Completion Summary Modal
  const [sessionSummary, setSessionSummary] = useState<{
    workoutName: string;
    totalVolumeKg: number;
    completedSets: number;
    prsCount: number;
    xpEarned: number;
  } | null>(null);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setScienceTipIdx((prev) => (prev + 1) % cyclingScienceTips.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Rest Timer Tick
  useEffect(() => {
    if (!isResting) return;
    if (restSecondsLeft <= 0) {
      setIsResting(false);
      playTimerChime();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([180, 90, 180]);
      }
      showToast("⚡ ¡Descanso terminado! Vamos por la siguiente serie", "xp");
      return;
    }
    const t = setTimeout(() => setRestSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [isResting, restSecondsLeft, showToast]);

  if (!isLoaded) return null;

  const hasActivePlan = customWorkoutPlan && customWorkoutPlan.days && customWorkoutPlan.days.length > 0;
  const isCustomMode = hasActivePlan && !viewStandardFallback;

  let currentWorkoutTitle = "";
  let currentWorkoutDuration = "";
  let currentTargetMuscles = "";
  let currentExercises: any[] = [];

  if (isCustomMode) {
    const day = customWorkoutPlan.days[activeDayTab] || customWorkoutPlan.days[0];
    currentWorkoutTitle = day.dayName || `Día ${day.dayNumber}`;
    currentWorkoutDuration = day.duration || "50-60 min";
    currentTargetMuscles = day.targetMuscles || "Grupo Muscular Principal";
    currentExercises = day.exercises || [];
  } else {
    const list = fallbackLocation === "home" ? homeWorkouts : gymWorkouts;
    const standard = list[fallbackRoutineIdx] || list[0];
    currentWorkoutTitle = standard.name;
    currentWorkoutDuration = standard.duration;
    currentTargetMuscles = standard.targetMuscles;
    currentExercises = standard.exercises;
  }

  const contextPrefix = isCustomMode ? `c_${activeDayTab}` : `s_${fallbackLocation}_${fallbackRoutineIdx}`;

  const getSetsForExercise = (idx: number, exercise: any): SetRecord[] => {
    const key = `${contextPrefix}_${idx}`;
    if (exerciseSetsMap[key]) return exerciseSetsMap[key];

    const baseCount = Math.min(8, Math.max(1, parseInt(String(exercise.sets), 10) || 3));
    const adjustedCount = autoRegulate && baseCount > 2 ? baseCount - 1 : baseCount;
    const prevSets = getLastExercisePerformance(exercise.name);

    return Array.from({ length: adjustedCount }, (_, sIdx) => ({
      weight: prevSets?.[sIdx]?.weight ?? prevSets?.[0]?.weight ?? 0,
      reps: prevSets?.[sIdx]?.reps ?? 10,
      completed: false,
      isPR: false
    }));
  };

  const updateSetField = (exIdx: number, exercise: any, setIdx: number, field: "weight" | "reps", value: number) => {
    const key = `${contextPrefix}_${exIdx}`;
    const current = getSetsForExercise(exIdx, exercise).map((s, i) =>
      i === setIdx ? { ...s, [field]: Math.max(0, value) } : s
    );
    setExerciseSetsMap((prev) => ({ ...prev, [key]: current }));
  };

  const toggleSetCompleted = (exIdx: number, exercise: any, setIdx: number) => {
    const key = `${contextPrefix}_${exIdx}`;
    const sets = getSetsForExercise(exIdx, exercise);
    const target = sets[setIdx];
    const nextCompleted = !target.completed;

    let isPR = false;
    if (nextCompleted && target.weight > 0 && target.reps > 0) {
      const est1RM = target.weight * (1 + target.reps / 30);
      const prevPR = exercisePRs[exercise.name]?.best1RM || 0;
      if (est1RM > prevPR) {
        isPR = true;
        showToast(`🏆 ¡Nuevo PR en ${exercise.name}!`, "xp");
      }
    }

    const updated = sets.map((s, i) =>
      i === setIdx ? { ...s, completed: nextCompleted, isPR } : s
    );
    setExerciseSetsMap((prev) => ({ ...prev, [key]: updated }));

    if (nextCompleted) {
      const restSec = parseRestSeconds(exercise.rest);
      setRestTotalSeconds(restSec);
      setRestSecondsLeft(restSec);
      setIsResting(true);
    }
  };

  const completeAllSetsForExercise = (exIdx: number, exercise: any) => {
    const key = `${contextPrefix}_${exIdx}`;
    const sets = getSetsForExercise(exIdx, exercise);
    const allDone = sets.every((s) => s.completed);
    const updated = sets.map((s) => ({ ...s, completed: !allDone }));
    setExerciseSetsMap((prev) => ({ ...prev, [key]: updated }));
  };

  // Compute progress across all exercises
  let totalTargetSets = 0;
  let totalCompletedSets = 0;
  currentExercises.forEach((ex, idx) => {
    const sList = getSetsForExercise(idx, ex);
    totalTargetSets += sList.length;
    totalCompletedSets += sList.filter((s) => s.completed).length;
  });

  const completionPercentage = totalTargetSets > 0 ? Math.round((totalCompletedSets / totalTargetSets) * 100) : 0;

  const finishWorkout = () => {
    if (totalCompletedSets === 0) {
      showToast("Completa al menos una serie para registrar tu sesión", "warning");
      return;
    }

    let totalVolumeKg = 0;
    let prsCount = 0;
    const musclesSet = new Set<string>();
    const exerciseRecords: ExerciseSessionRecord[] = [];

    currentExercises.forEach((ex, idx) => {
      const sList = getSetsForExercise(idx, ex);
      const completed = sList.filter((s) => s.completed);
      if (completed.length === 0) return;

      musclesSet.add(ex.muscle || "General");
      let best1RM = 0;
      completed.forEach((s) => {
        totalVolumeKg += s.weight * s.reps;
        if (s.isPR) prsCount += 1;
        const est = s.weight > 0 && s.reps > 0 ? s.weight * (1 + s.reps / 30) : 0;
        if (est > best1RM) best1RM = est;
      });

      exerciseRecords.push({
        name: ex.name,
        muscle: ex.muscle || "General",
        sets: sList,
        best1RM: Math.round(best1RM * 10) / 10
      });
    });

    const elapsedMin = Math.max(5, Math.round((Date.now() - sessionStartRef.current) / 60000));
    logWorkoutSession({
      workoutName: currentWorkoutTitle,
      durationMinutes: elapsedMin,
      totalVolumeKg: Math.round(totalVolumeKg),
      prsCount,
      musclesWorked: Array.from(musclesSet),
      exercises: exerciseRecords
    });

    setIsResting(false);
    setSessionSummary({
      workoutName: currentWorkoutTitle,
      totalVolumeKg: Math.round(totalVolumeKg),
      completedSets: totalCompletedSets,
      prsCount,
      xpEarned: 100 + prsCount * 25
    });
  };

  const handleGenerateSplit = async () => {
    setIsGenerating(true);
    setGeneratedPreview(null);

    try {
      const res = await fetch("/api/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysPerWeek,
          equipment,
          focus,
          level,
          profile
        })
      });

      const data = await res.json();
      if (data.split && data.split.days && data.split.days.length > 0) {
        setGeneratedPreview(data.split);
      } else {
        showToast(data.error || "No se pudo generar el split. Intenta de nuevo.", "error");
      }
    } catch {
      showToast("Error de conexión al generar el split.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySplit = () => {
    if (generatedPreview) {
      saveWorkoutPlan(generatedPreview);
      addXp(100, "Split IA creado");
      setActiveDayTab(0);
      setExerciseSetsMap({});
      setViewStandardFallback(false);
      setShowSplitModal(false);
      setGeneratedPreview(null);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <motion.main
      className={styles.main}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ paddingBottom: isResting ? "11rem" : "7rem" }}
    >
      {/* Top Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Iron Log Pro</h1>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Sobrecarga progresiva, RIR & Volumen Científico
          </p>
        </div>
        <button
          onClick={() => {
            setGeneratedPreview(null);
            setShowSplitModal(true);
          }}
          className="glow-primary"
          style={{
            background: "var(--primary)",
            color: "white",
            padding: "0.5rem 0.85rem",
            borderRadius: "12px",
            fontSize: "0.78rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem"
          }}
        >
          <Wand2 size={15} />
          {hasActivePlan ? "Nuevo Split" : "Crear Split"}
        </button>
      </header>

      {/* Main View Mode Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: "0.4rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "0.3rem"
        }}
      >
        <button
          onClick={() => setPageView("session")}
          style={{
            padding: "0.55rem 0.5rem",
            borderRadius: "10px",
            fontSize: "0.8rem",
            fontWeight: pageView === "session" ? 800 : 600,
            background: pageView === "session" ? "var(--primary)" : "transparent",
            color: pageView === "session" ? "white" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem"
          }}
        >
          <Dumbbell size={14} /> Sesión Activa
        </button>
        <button
          onClick={() => setPageView("analytics")}
          style={{
            padding: "0.55rem 0.5rem",
            borderRadius: "10px",
            fontSize: "0.8rem",
            fontWeight: pageView === "analytics" ? 800 : 600,
            background: pageView === "analytics" ? "var(--primary)" : "transparent",
            color: pageView === "analytics" ? "white" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem"
          }}
        >
          <Activity size={14} /> Mapa & PRs
        </button>
        <Link
          href="/science"
          style={{
            padding: "0.55rem 0.7rem",
            borderRadius: "10px",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "var(--accent)",
            background: "var(--accent-subtle)",
            display: "flex",
            alignItems: "center"
          }}
          title="Protocolos científicos"
        >
          🧬
        </Link>
      </div>

      {pageView === "analytics" ? (
        <MuscleMap />
      ) : (
        <>
          {/* Readiness Autoregulation Banner */}
          {todayReadiness && (
            <div
              className="glass-card"
              style={{
                padding: "0.9rem 1rem",
                borderRadius: "14px",
                border:
                  todayReadiness.score < 55
                    ? "1px solid rgba(245, 158, 11, 0.45)"
                    : "1px solid var(--accent-border)",
                background:
                  todayReadiness.score < 55
                    ? "rgba(245, 158, 11, 0.08)"
                    : "var(--accent-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <Brain size={18} color={todayReadiness.score < 55 ? "#F59E0B" : "var(--accent)"} />
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "white", display: "block" }}>
                    Readiness de Hoy: {todayReadiness.score}%
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {todayReadiness.score < 55
                      ? "Fatiga elevada detectada. Se recomienda bajar 1 serie por ejercicio."
                      : "Sistema nervioso listo para sobrecarga progresiva."}
                  </span>
                </div>
              </div>
              {todayReadiness.score < 55 && (
                <button
                  onClick={() => setAutoRegulate(!autoRegulate)}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "8px",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    background: autoRegulate ? "#F59E0B" : "rgba(245, 158, 11, 0.18)",
                    color: autoRegulate ? "#000" : "#F59E0B",
                    border: "1px solid #F59E0B"
                  }}
                >
                  {autoRegulate ? "✓ Autorregulación Activa" : "Autorregular (-1 Serie)"}
                </button>
              )}
            </div>
          )}

          {/* Hero Banner: Custom Split Status or Call To Action */}
          {hasActivePlan && !viewStandardFallback ? (
            <div
              className="glass-card"
              style={{
                background: "linear-gradient(135deg, var(--primary-subtle), var(--accent-subtle))",
                border: "1px solid var(--primary-border)",
                borderRadius: "16px",
                padding: "1.15rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      background: "var(--accent-subtle)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent-border)",
                      padding: "0.18rem 0.5rem",
                      borderRadius: "6px",
                      fontWeight: 800
                    }}
                  >
                    ⚡ Split Científico Activo
                  </span>
                  <h2 style={{ margin: "0.4rem 0 0 0", color: "white", fontSize: "1.15rem", fontWeight: 800 }}>
                    {customWorkoutPlan.splitTitle}
                  </h2>
                </div>
                <button
                  onClick={() => setViewStandardFallback(true)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    padding: "0.3rem 0.55rem",
                    borderRadius: "8px",
                    fontSize: "0.72rem"
                  }}
                >
                  Predeterminadas
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", fontSize: "0.72rem" }}>
                <span style={{ background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.55rem", borderRadius: "8px", color: "var(--text-main)" }}>
                  📅 {customWorkoutPlan.daysPerWeek}D
                </span>
                <span style={{ background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.55rem", borderRadius: "8px", color: "var(--text-main)" }}>
                  🏋️ {customWorkoutPlan.equipment}
                </span>
                <span style={{ background: "var(--primary-subtle)", padding: "0.2rem 0.55rem", borderRadius: "8px", color: "var(--primary)", fontWeight: "bold" }}>
                  🎯 {customWorkoutPlan.focus}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.45rem", overflowX: "auto", paddingBottom: "0.2rem", marginTop: "0.25rem" }}>
                {customWorkoutPlan.days.map((dayItem: any, idx: number) => {
                  const isSelected = activeDayTab === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveDayTab(idx)}
                      style={{
                        flexShrink: 0,
                        padding: "0.45rem 0.8rem",
                        borderRadius: "10px",
                        border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: isSelected ? "var(--primary)" : "rgba(255,255,255,0.04)",
                        color: isSelected ? "white" : "var(--text-muted)",
                        fontWeight: isSelected ? 800 : 500,
                        fontSize: "0.78rem"
                      }}
                    >
                      Día {dayItem.dayNumber || idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                background: "linear-gradient(135deg, var(--primary-subtle), var(--accent-subtle))",
                border: "1px solid var(--primary-border)",
                borderRadius: "16px",
                padding: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.8rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    boxShadow: "0 0 14px var(--primary-glow)"
                  }}
                >
                  🪄
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "white", fontSize: "1rem", fontWeight: 800 }}>Generador de Split IA</h3>
                  <p style={{ margin: "0.15rem 0 0 0", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    Adaptado a tus días y equipo disponible.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setGeneratedPreview(null);
                  setShowSplitModal(true);
                }}
                className="glow-primary"
                style={{
                  padding: "0.55rem 0.9rem",
                  background: "var(--primary)",
                  borderRadius: "10px",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap"
                }}
              >
                Crear ✨
              </button>
            </div>
          )}

          {/* Fallback Selector */}
          {(!isCustomMode || viewStandardFallback) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {hasActivePlan && (
                <button
                  onClick={() => setViewStandardFallback(false)}
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--accent-subtle)",
                    border: "1px solid var(--accent-border)",
                    color: "var(--accent)",
                    padding: "0.3rem 0.65rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}
                >
                  ← Volver a Mi Split Personalizado
                </button>
              )}

              <div className={styles.toggleContainer} style={{ marginTop: 0 }}>
                <button
                  className={`${styles.toggleButton} ${fallbackLocation === "home" ? styles.active : ""}`}
                  onClick={() => {
                    setFallbackLocation("home");
                    setFallbackRoutineIdx(0);
                  }}
                >
                  🏠 En Casa
                </button>
                <button
                  className={`${styles.toggleButton} ${fallbackLocation === "gym" ? styles.active : ""}`}
                  onClick={() => {
                    setFallbackLocation("gym");
                    setFallbackRoutineIdx(0);
                  }}
                >
                  🏋️ Gimnasio
                </button>
              </div>
            </div>
          )}

          {/* Mental Focus & Stoic Primer */}
          <DailyWisdom compact />

          {/* Active Workout Card with Series Tracker */}
          <div className={styles.workoutCard}>
            <div className={styles.workoutHeader}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <div>
                  <h2 className={styles.workoutTitle}>{currentWorkoutTitle}</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "0.3rem" }}>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={13} color="var(--primary)" /> {currentWorkoutDuration}
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Shield size={13} color="var(--accent)" /> {currentTargetMuscles}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: "0.74rem", color: completionPercentage === 100 ? "var(--accent)" : "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {totalCompletedSets}/{totalTargetSets} series ({completionPercentage}%)
                </span>
              </div>

              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", marginTop: "0.75rem", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${completionPercentage}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--primary), var(--accent))",
                    transition: "width 0.3s ease"
                  }}
                />
              </div>
            </div>

            {/* Interactive Exercise Cards with Set Rows */}
            <div className={styles.exerciseList}>
              {currentExercises.map((exercise: any, exIdx: number) => {
                const sets = getSetsForExercise(exIdx, exercise);
                const prevSets = getLastExercisePerformance(exercise.name);
                const exDoneCount = sets.filter((s) => s.completed).length;
                const exAllDone = exDoneCount === sets.length;

                return (
                  <div
                    key={exIdx}
                    style={{
                      background: exAllDone ? "var(--accent-subtle)" : "var(--bg-dark)",
                      border: exAllDone ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                      borderRadius: "16px",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem"
                    }}
                  >
                    {/* Exercise Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, color: "white", fontSize: "0.98rem" }}>{exercise.name}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem", fontSize: "0.74rem" }}>
                          {exercise.muscle && (
                            <span style={{ color: "var(--primary)", fontWeight: 700 }}>{exercise.muscle}</span>
                          )}
                          <span style={{ color: "var(--text-muted)" }}>🎯 {exercise.reps}</span>
                          {exercise.rest && <span style={{ color: "var(--text-muted)" }}>⏱️ {exercise.rest}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => completeAllSetsForExercise(exIdx, exercise)}
                        style={{
                          padding: "0.3rem 0.55rem",
                          borderRadius: "8px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: exAllDone ? "var(--accent)" : "rgba(255,255,255,0.06)",
                          color: exAllDone ? "#000" : "var(--text-muted)",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {exAllDone ? "✓ Hecho" : "Marcar Todo"}
                      </button>
                    </div>

                    {exercise.cue && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.74rem",
                          color: "var(--accent)",
                          background: "rgba(0, 229, 255, 0.05)",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "8px",
                          borderLeft: "2px solid var(--accent)"
                        }}
                      >
                        💡 {exercise.cue}
                      </p>
                    )}

                    {/* Set-by-Set Grid */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "34px 1fr 64px 58px 38px",
                          gap: "0.4rem",
                          fontSize: "0.66rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          padding: "0 0.2rem"
                        }}
                      >
                        <span>Set</span>
                        <span>Anterior</span>
                        <span style={{ textAlign: "center" }}>kg</span>
                        <span style={{ textAlign: "center" }}>Reps</span>
                        <span style={{ textAlign: "center" }}>OK</span>
                      </div>

                      {sets.map((s, sIdx) => {
                        const prevLabel = prevSets?.[sIdx]
                          ? `${prevSets[sIdx].weight}kg×${prevSets[sIdx].reps}`
                          : "—";

                        return (
                          <div
                            key={sIdx}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "34px 1fr 64px 58px 38px",
                              gap: "0.4rem",
                              alignItems: "center",
                              background: s.completed ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.02)",
                              border: s.isPR ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid transparent",
                              borderRadius: "10px",
                              padding: "0.3rem 0.2rem"
                            }}
                          >
                            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: s.completed ? "#10b981" : "var(--text-muted)", textAlign: "center" }}>
                              {sIdx + 1}
                            </span>

                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem", overflow: "hidden" }}>
                              <span>{prevLabel}</span>
                              {s.isPR && <span title="Récord Personal">🏆</span>}
                            </div>

                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={s.weight || ""}
                              placeholder="0"
                              onChange={(e) => updateSetField(exIdx, exercise, sIdx, "weight", parseFloat(e.target.value) || 0)}
                              style={{
                                padding: "0.35rem 0.25rem",
                                textAlign: "center",
                                fontSize: "0.84rem",
                                fontWeight: 700,
                                borderRadius: "8px",
                                background: "rgba(0,0,0,0.35)"
                              }}
                            />

                            <input
                              type="number"
                              min="0"
                              value={s.reps || ""}
                              placeholder="10"
                              onChange={(e) => updateSetField(exIdx, exercise, sIdx, "reps", parseInt(e.target.value, 10) || 0)}
                              style={{
                                padding: "0.35rem 0.25rem",
                                textAlign: "center",
                                fontSize: "0.84rem",
                                fontWeight: 700,
                                borderRadius: "8px",
                                background: "rgba(0,0,0,0.35)"
                              }}
                            />

                            <button
                              onClick={() => toggleSetCompleted(exIdx, exercise, sIdx)}
                              style={{
                                width: "32px",
                                height: "32px",
                                margin: "0 auto",
                                borderRadius: "8px",
                                border: s.completed ? "1px solid #10b981" : "1px solid var(--primary-border)",
                                background: s.completed ? "#10b981" : "var(--primary-subtle)",
                                color: s.completed ? "#000" : "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800
                              }}
                            >
                              ✓
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className={styles.completeButton}
              disabled={totalCompletedSets === 0}
              onClick={finishWorkout}
              style={{
                opacity: totalCompletedSets > 0 ? 1 : 0.55,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <CheckCircle2 size={20} />
              {totalCompletedSets > 0
                ? `Finalizar Entreno (${totalCompletedSets} series) +100 XP`
                : "Marca al menos 1 serie para finalizar"}
            </button>
          </div>
        </>
      )}

      {/* Floating Rest Timer Bar */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            style={{
              position: "fixed",
              bottom: "6.1rem",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              maxWidth: "430px",
              background: "var(--bg-surface-solid)",
              border: "1px solid var(--accent-border)",
              boxShadow: "0 12px 35px rgba(0,0,0,0.8), 0 0 20px var(--accent-subtle)",
              borderRadius: "18px",
              padding: "0.8rem 1rem",
              zIndex: 80
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <Timer size={20} color="var(--accent)" />
                <div>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                    Descanso Inter-Serie
                  </span>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", fontFamily: "var(--font-display)" }}>
                    {formatTimer(restSecondsLeft)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  onClick={() => setRestSecondsLeft((s) => Math.max(5, s - 15))}
                  style={{ padding: "0.4rem 0.6rem", borderRadius: "8px", background: "rgba(255,255,255,0.06)", color: "white", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  -15s
                </button>
                <button
                  onClick={() => setRestSecondsLeft((s) => s + 15)}
                  style={{ padding: "0.4rem 0.6rem", borderRadius: "8px", background: "rgba(255,255,255,0.06)", color: "white", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  +15s
                </button>
                <button
                  onClick={() => setIsResting(false)}
                  style={{ padding: "0.4rem 0.7rem", borderRadius: "8px", background: "var(--primary-subtle)", border: "1px solid var(--primary-border)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  Saltar
                </button>
              </div>
            </div>

            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginTop: "0.55rem", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, (restSecondsLeft / Math.max(1, restTotalSeconds)) * 100)}%`,
                  height: "100%",
                  background: "var(--accent)",
                  transition: "width 0.9s linear"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Summary Receipt Modal */}
      <AnimatePresence>
        {sessionSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.88)",
              backdropFilter: "blur(10px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "2rem 1.5rem",
                background: "var(--bg-surface-solid)",
                border: "1px solid var(--accent-border)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}
            >
              <Trophy size={48} color="#F59E0B" style={{ margin: "0 auto" }} />
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  ¡Sesión Registrada!
                </span>
                <h2 style={{ margin: "0.3rem 0 0 0", fontSize: "1.3rem", color: "white" }}>{sessionSummary.workoutName}</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                <div style={{ background: "var(--bg-dark)", padding: "0.8rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Volumen Total</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>{sessionSummary.totalVolumeKg} kg</span>
                </div>
                <div style={{ background: "var(--bg-dark)", padding: "0.8rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Series Hechas</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)" }}>{sessionSummary.completedSets}</span>
                </div>
                <div style={{ background: "var(--bg-dark)", padding: "0.8rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>PRs Rotos 🏆</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#F59E0B" }}>{sessionSummary.prsCount}</span>
                </div>
                <div style={{ background: "var(--bg-dark)", padding: "0.8rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>XP Ganados</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>+{sessionSummary.xpEarned}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSessionSummary(null);
                  router.push("/dashboard");
                }}
                className="glow-primary"
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: "14px",
                  fontWeight: 800,
                  fontSize: "0.98rem"
                }}
              >
                Volver al Dashboard 🔥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Generator Modal */}
      <AnimatePresence>
        {showSplitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center"
            }}
            onClick={() => {
              if (!isGenerating) setShowSplitModal(false);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "520px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--bg-surface-solid)",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                border: "1px solid var(--border)",
                borderBottom: "none",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.6)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white"
                    }}
                  >
                    <Wand2 size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.15rem", color: "white", fontWeight: 800 }}>Generador de Split por IA</h2>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Ciencia Schoenfeld adaptada a tu disponibilidad</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSplitModal(false)}
                  disabled={isGenerating}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)"
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {!generatedPreview ? (
                <>
                  <div>
                    <label style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                      1. ¿Cuántos días entrenarás por semana?
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                      {[3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDaysPerWeek(num)}
                          style={{
                            padding: "0.75rem 0.35rem",
                            borderRadius: "12px",
                            border: daysPerWeek === num ? "2px solid var(--primary)" : "1px solid var(--border)",
                            background: daysPerWeek === num ? "var(--primary-subtle)" : "var(--bg-dark)",
                            color: daysPerWeek === num ? "white" : "var(--text-muted)",
                            fontWeight: 800,
                            textAlign: "center"
                          }}
                        >
                          <div style={{ fontSize: "1.05rem" }}>{num} Días</div>
                          <div style={{ fontSize: "0.62rem", marginTop: "0.2rem", opacity: 0.8 }}>
                            {num === 3 ? "Full Body" : num === 4 ? "Torso/Pierna" : num === 5 ? "PPL + TP" : "PPL Frec 2"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                      2. Equipamiento disponible:
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                      {[
                        { title: "Gimnasio Comercial Completo", desc: "Barras, mancuernas pesadas, poleas, prensas y máquinas hack." },
                        { title: "Mancuernas y Banco en Casa", desc: "Par de mancuernas ajustables y banco plano o inclinable." },
                        { title: "Calistenia y Barra", desc: "Peso corporal, barra de dominadas, paralelas y piso." },
                        { title: "Bandas de Resistencia y Mancuernas Ligeras", desc: "Entrenamiento en casa con tensión elástica y pesos moderados." }
                      ].map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => setEquipment(item.title)}
                          style={{
                            padding: "0.7rem 0.9rem",
                            borderRadius: "12px",
                            border: equipment === item.title ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                            background: equipment === item.title ? "var(--accent-subtle)" : "var(--bg-dark)",
                            textAlign: "left"
                          }}
                        >
                          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: equipment === item.title ? "white" : "var(--text-main)" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                      3. Enfoque o Prioridad Estética:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
                      {[
                        { key: "Balanceado Estético", label: "⚖️ Balanceado Estético" },
                        { key: "Pecho y Brazos", label: "🛡️ Pecho y Brazos" },
                        { key: "Espalda en V y Hombros 3D", label: "🦅 Espalda V & Hombros" },
                        { key: "Pierna y Glúteo", label: "🦵 Pierna y Glúteo" }
                      ].map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setFocus(f.key)}
                          style={{
                            padding: "0.65rem",
                            borderRadius: "10px",
                            border: focus === f.key ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                            background: focus === f.key ? "var(--primary-subtle)" : "var(--bg-dark)",
                            color: focus === f.key ? "white" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            textAlign: "center"
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                      4. Nivel de Experiencia:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                      {["Principiante", "Intermedio", "Avanzado"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setLevel(lvl)}
                          style={{
                            padding: "0.55rem",
                            borderRadius: "10px",
                            border: level === lvl ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                            background: level === lvl ? "var(--accent-subtle)" : "var(--bg-dark)",
                            color: level === lvl ? "white" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "0.8rem"
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateSplit}
                    disabled={isGenerating}
                    className="glow-primary"
                    style={{
                      width: "100%",
                      padding: "0.95rem",
                      borderRadius: "14px",
                      background: "var(--primary)",
                      color: "white",
                      fontSize: "0.98rem",
                      fontWeight: 800,
                      cursor: isGenerating ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.55rem"
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={19} /> Diseñando Rutina con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles size={19} /> Generar Split Científico con IA
                      </>
                    )}
                  </button>

                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        textAlign: "center",
                        padding: "0.75rem",
                        background: "var(--accent-subtle)",
                        borderRadius: "10px",
                        border: "1px dashed var(--accent-border)"
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--accent)", fontStyle: "italic" }}>
                        🔬 {cyclingScienceTips[scienceTipIdx]}
                      </p>
                    </motion.div>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div
                    style={{
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--accent-border)",
                      borderRadius: "14px",
                      padding: "1rem"
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 800, textTransform: "uppercase" }}>
                      Vista Previa del Split
                    </span>
                    <h3 style={{ margin: "0.2rem 0 0.4rem 0", color: "white", fontSize: "1.15rem" }}>{generatedPreview.splitTitle}</h3>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>{generatedPreview.weeklyOverview}</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "280px", overflowY: "auto" }}>
                    {generatedPreview.days?.map((day: any, dIdx: number) => (
                      <div key={dIdx} style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.8rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "0.84rem" }}>{day.dayName}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>⏱️ {day.duration}</span>
                        </div>
                        <p style={{ margin: "0.2rem 0 0.45rem 0", fontSize: "0.74rem", color: "var(--text-muted)" }}>🎯 {day.targetMuscles}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {day.exercises?.slice(0, 3).map((ex: any, eIdx: number) => (
                            <div key={eIdx} style={{ fontSize: "0.74rem", color: "var(--text-main)", display: "flex", justifyContent: "space-between" }}>
                              <span>• {ex.name}</span>
                              <span style={{ color: "var(--text-muted)" }}>{ex.sets}x {ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "0.7rem" }}>
                    <button
                      onClick={() => setGeneratedPreview(null)}
                      style={{ flex: 1, padding: "0.85rem", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: 700, fontSize: "0.84rem" }}
                    >
                      Ajustar
                    </button>
                    <button
                      onClick={handleApplySplit}
                      className="glow-primary"
                      style={{ flex: 2, padding: "0.85rem", borderRadius: "12px", background: "var(--primary)", color: "white", fontWeight: 800, fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                    >
                      <Check size={17} /> Guardar Rutina (+100 XP)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
