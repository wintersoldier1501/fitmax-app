"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./workout.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";
import { DailyWisdom } from "@/components/DailyWisdom";
import { 
  Sparkles, 
  Wand2, 
  Dumbbell, 
  Flame, 
  Check, 
  ChevronRight, 
  X, 
  Clock, 
  Calendar, 
  Shield, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  Trophy, 
  Zap,
  Info,
  Loader2
} from "lucide-react";

// Default Scientific Workouts (Fallback)
const homeWorkouts = [
  {
    name: "Push (Casa) - Hipertrofia RIR 1",
    duration: "45 min",
    targetMuscles: "Pecho, Hombro anterior, Tríceps",
    exercises: [
      { name: "Flexiones Declinadas", muscle: "Pectoral Clavicular", sets: "4", reps: "Al fallo -1 RIR", rest: "90 seg", cue: "Pies elevados en silla, pausa de 1s abajo." },
      { name: "Pike Push-ups", muscle: "Deltoides Anterior/Lateral", sets: "4", reps: "8-12 (RIR 2)", rest: "90 seg", cue: "Cadera alta, cabeza hacia adelante formando un triángulo." },
      { name: "Fondos en Silla", muscle: "Tríceps", sets: "3", reps: "12-15 (RIR 1)", rest: "60 seg", cue: "Codos pegados al cuerpo, rango completo." }
    ]
  },
  {
    name: "Pull (Casa) - Tensión Mecánica",
    duration: "40 min",
    targetMuscles: "Espalda, Bíceps, Core",
    exercises: [
      { name: "Dominadas o Remos Invertidos", muscle: "Dorsal Ancho", sets: "4", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Inicia con depresión escapular y lleva el pecho a la barra." },
      { name: "Superman Holds", muscle: "Erectores Espinales", sets: "3", reps: "45 seg sostenido", rest: "60 seg", cue: "Aprieta glúteos y lumbares con respiración controlada." },
      { name: "Curl de Bíceps con Mochila", muscle: "Bíceps Braquial", sets: "3", reps: "12-15 (RIR 1)", rest: "60 seg", cue: "Fase excéntrica de 3 seg sin balancear el torso." }
    ]
  }
];

const gymWorkouts = [
  {
    name: "Día 1: Upper Body (Enfoque Tensión Mecánica)",
    duration: "60 min",
    targetMuscles: "Pecho, Espalda alta, Hombros, Brazos",
    exercises: [
      { name: "Press de Banca con Barra", muscle: "Pectoral Mayor", sets: "4", reps: "6-8 (RIR 2)", rest: "3 min", cue: "Retracción escapular firme, arco natural y pausa de 1s en el pecho." },
      { name: "Remo con Barra (Pendlay)", muscle: "Dorsales y Espalda Media", sets: "4", reps: "8-10 (RIR 2)", rest: "2 min", cue: "Espalda paralela al suelo, tracción explosiva hacia el abdomen." },
      { name: "Press Militar con Mancuernas", muscle: "Deltoides", sets: "3", reps: "10-12 (RIR 1)", rest: "2 min", cue: "Codos ligeramente al frente, bloqueo controlado." },
      { name: "Curl de Bíceps en Banco Inclinado", muscle: "Bíceps (Cabeza Larga)", sets: "3", reps: "12-15 (Fallo)", rest: "90 seg", cue: "Máximo estiramiento en la posición inferior." }
    ]
  },
  {
    name: "Día 2: Lower Body (Enfoque Cuádriceps/Glúteo)",
    duration: "65 min",
    targetMuscles: "Cuádriceps, Glúteos, Isquiosurales, Gemelos",
    exercises: [
      { name: "Sentadilla Libre (Barra Alta)", muscle: "Cuádriceps y Glúteo", sets: "4", reps: "5-8 (RIR 2)", rest: "3 min", cue: "Rompe el paralelo con rodillas siguiendo la punta de los pies." },
      { name: "Peso Muerto Rumano", muscle: "Isquiosurales", sets: "4", reps: "8-10 (RIR 1)", rest: "2 min", cue: "Bisagra de cadera pura, siente la máxima tensión en femorales." },
      { name: "Prensa de Piernas", muscle: "Cuádriceps", sets: "3", reps: "12-15 (Fallo)", rest: "2 min", cue: "Pies a mitad de plataforma, baja profundo sin despegar cadera." },
      { name: "Elevación de Gemelos de Pie", muscle: "Gastrocnemio", sets: "4", reps: "15-20 (Fallo)", rest: "90 seg", cue: "Pausa de 2 seg en máximo estiramiento abajo." }
    ]
  }
];

const cyclingScienceTips = [
  "Optimizando volumen MAV (10-20 series semanales por grupo muscular)...",
  "Alineando el perfil de resistencia según el equipamiento elegido...",
  "Estructurando descansos inter-series para máxima resíntesis de ATP...",
  "Ajustando intensidad RIR 1-3 para hipertrofia miofibrilar pura..."
];

export default function Workout() {
  const router = useRouter();
  const { isLoaded, profile, customWorkoutPlan, saveWorkoutPlan, addXp } = useFitmax();

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
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [viewStandardFallback, setViewStandardFallback] = useState(false);
  const [fallbackLocation, setFallbackLocation] = useState<"home" | "gym">("gym");
  const [fallbackRoutineIdx, setFallbackRoutineIdx] = useState(0);

  // Cycling science tips while generating
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setScienceTipIdx((prev) => (prev + 1) % cyclingScienceTips.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isLoaded) return null;

  const hasActivePlan = customWorkoutPlan && customWorkoutPlan.days && customWorkoutPlan.days.length > 0;
  const isCustomMode = hasActivePlan && !viewStandardFallback;

  // Active workout resolution
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

  // Count completions for current workout
  const currentCompletedCount = currentExercises.filter((_, idx) => completedExercises[`${isCustomMode ? activeDayTab : fallbackRoutineIdx}_${idx}`]).length;
  const isAllCompleted = currentExercises.length > 0 && currentCompletedCount === currentExercises.length;
  const completionPercentage = currentExercises.length > 0 ? Math.round((currentCompletedCount / currentExercises.length) * 100) : 0;

  const toggleExercise = (idx: number) => {
    const key = `${isCustomMode ? activeDayTab : fallbackRoutineIdx}_${idx}`;
    setCompletedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const finishWorkout = () => {
    addXp(100);
    setWorkoutFinished(true);
    setTimeout(() => {
      setWorkoutFinished(false);
      router.push("/dashboard");
    }, 2200);
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
        alert(data.error || "No se pudo generar el split. Intenta de nuevo.");
      }
    } catch (err) {
      alert("Error de conexión al generar el split.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySplit = () => {
    if (generatedPreview) {
      saveWorkoutPlan(generatedPreview);
      addXp(100);
      setActiveDayTab(0);
      setCompletedExercises({});
      setViewStandardFallback(false);
      setShowSplitModal(false);
      setGeneratedPreview(null);
    }
  };

  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ paddingBottom: "7rem" }}
    >
      {/* Top Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Entrenamiento</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Metodología Schoenfeld & Hipertrofia Científica
          </p>
        </div>
        <button
          onClick={() => {
            setGeneratedPreview(null);
            setShowSplitModal(true);
          }}
          className="glow-primary"
          style={{
            background: "linear-gradient(135deg, #FF3366, #FF6B8B)",
            border: "none",
            color: "white",
            padding: "0.5rem 0.9rem",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(255, 51, 102, 0.4)"
          }}
        >
          <Wand2 size={16} />
          {hasActivePlan ? "Nuevo Split" : "Crear Split"}
        </button>
      </header>

      {/* Hero Banner: Custom Split Status or Call To Action */}
      {hasActivePlan && !viewStandardFallback ? (
        <div 
          className="glass-card"
          style={{
            background: "linear-gradient(135deg, rgba(255, 51, 102, 0.12), rgba(0, 229, 255, 0.08))",
            border: "1px solid rgba(255, 51, 102, 0.3)",
            borderRadius: "16px",
            padding: "1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ 
                fontSize: "0.7rem", 
                textTransform: "uppercase", 
                background: "rgba(0, 229, 255, 0.15)", 
                color: "#00E5FF", 
                border: "1px solid rgba(0, 229, 255, 0.3)",
                padding: "0.2rem 0.5rem", 
                borderRadius: "6px",
                fontWeight: 800,
                letterSpacing: "0.5px"
              }}>
                ⚡ Split Científico Activo
              </span>
              <h2 style={{ margin: "0.4rem 0 0 0", color: "white", fontSize: "1.25rem", fontWeight: 800 }}>
                {customWorkoutPlan.splitTitle}
              </h2>
            </div>
            <button
              onClick={() => setViewStandardFallback(true)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                padding: "0.3rem 0.6rem",
                borderRadius: "8px",
                fontSize: "0.75rem",
                cursor: "pointer"
              }}
            >
              Ver Predeterminadas
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.6rem", borderRadius: "8px", color: "var(--text-main)" }}>
              📅 {customWorkoutPlan.daysPerWeek} Días/Semana
            </span>
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.6rem", borderRadius: "8px", color: "var(--text-main)" }}>
              🏋️ {customWorkoutPlan.equipment}
            </span>
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.6rem", borderRadius: "8px", color: "#FF3366", fontWeight: "bold" }}>
              🎯 {customWorkoutPlan.focus}
            </span>
          </div>

          {customWorkoutPlan.weeklyOverview && (
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic", borderLeft: "2px solid var(--primary)", paddingLeft: "0.6rem" }}>
              "{customWorkoutPlan.weeklyOverview}"
            </p>
          )}

          {/* Day Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.2rem", marginTop: "0.4rem" }}>
            {customWorkoutPlan.days.map((dayItem: any, idx: number) => {
              const isSelected = activeDayTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveDayTab(idx)}
                  style={{
                    flexShrink: 0,
                    padding: "0.5rem 0.85rem",
                    borderRadius: "10px",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: isSelected ? "var(--primary)" : "rgba(255,255,255,0.04)",
                    color: isSelected ? "white" : "var(--text-muted)",
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
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
            background: "linear-gradient(135deg, rgba(255, 51, 102, 0.16), rgba(0, 229, 255, 0.12))",
            border: "1px solid rgba(255, 51, 102, 0.4)",
            borderRadius: "16px",
            padding: "1.3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 24px rgba(255, 51, 102, 0.15)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #FF3366, #FF6B8B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              boxShadow: "0 0 16px rgba(255, 51, 102, 0.4)"
            }}>
              🪄
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem", fontWeight: 800 }}>
                  Generador de Split Semanal
                </h3>
                <span style={{ fontSize: "0.7rem", background: "rgba(0, 229, 255, 0.2)", color: "#00E5FF", border: "1px solid rgba(0, 229, 255, 0.4)", padding: "0.15rem 0.4rem", borderRadius: "6px", fontWeight: "bold" }}>
                  IA
                </span>
              </div>
              <p style={{ margin: "0.2rem 0 0 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Personalizado a tus días, equipo y prioridad muscular.
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
              padding: "0.6rem 1rem",
              background: "var(--primary)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Crear ✨
          </button>
        </div>
      )}

      {/* Fallback Selector (Casa vs Gym) if in standard mode */}
      {(!isCustomMode || viewStandardFallback) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {hasActivePlan && (
            <button
              onClick={() => setViewStandardFallback(false)}
              style={{
                alignSelf: "flex-start",
                background: "rgba(0, 229, 255, 0.1)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                color: "#00E5FF",
                padding: "0.3rem 0.7rem",
                borderRadius: "8px",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              ← Volver a Mi Split Personalizado
            </button>
          )}

          <div className={styles.toggleContainer}>
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

      {/* Active Workout Card */}
      <div className={styles.workoutCard}>
        <div className={styles.workoutHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
            <div>
              <h2 className={styles.workoutTitle}>{currentWorkoutTitle}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.3rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Clock size={13} color="var(--primary)" /> {currentWorkoutDuration}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Shield size={13} color="#00E5FF" /> {currentTargetMuscles}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: isAllCompleted ? "#00E5FF" : "var(--text-muted)", fontWeight: "bold" }}>
                {currentCompletedCount} / {currentExercises.length} hechos ({completionPercentage}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", marginTop: "0.8rem", overflow: "hidden" }}>
            <div 
              style={{ 
                width: `${completionPercentage}%`, 
                height: "100%", 
                background: "linear-gradient(90deg, var(--primary), #00E5FF)",
                transition: "width 0.3s ease"
              }} 
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className={styles.exerciseList}>
          {currentExercises.map((exercise: any, idx: number) => {
            const key = `${isCustomMode ? activeDayTab : fallbackRoutineIdx}_${idx}`;
            const isCompleted = !!completedExercises[key];

            return (
              <div 
                key={idx} 
                className={`${styles.exerciseItem} ${isCompleted ? styles.completed : ""}`}
                onClick={() => toggleExercise(idx)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.9rem",
                  padding: "1rem",
                  background: isCompleted ? "rgba(0, 229, 255, 0.05)" : "var(--bg-dark)",
                  border: isCompleted ? "1px solid rgba(0, 229, 255, 0.3)" : "1px solid var(--border)",
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "all 0.25s ease"
                }}
              >
                <div 
                  className={styles.checkbox}
                  style={{
                    marginTop: "0.2rem",
                    borderColor: isCompleted ? "#00E5FF" : "var(--primary)",
                    background: isCompleted ? "#00E5FF" : "transparent",
                    color: isCompleted ? "#000" : "transparent"
                  }}
                >
                  ✓
                </div>

                <div className={styles.exerciseInfo} style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p className={styles.exerciseName} style={{ color: isCompleted ? "var(--text-muted)" : "white", fontWeight: 700 }}>
                      {exercise.name}
                    </p>
                    {exercise.muscle && (
                      <span style={{ 
                        fontSize: "0.7rem", 
                        background: "rgba(255,255,255,0.05)", 
                        color: "var(--primary)", 
                        padding: "0.15rem 0.5rem", 
                        borderRadius: "6px",
                        whiteSpace: "nowrap"
                      }}>
                        {exercise.muscle}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "0.4rem", fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                      🔢 {exercise.sets ? `${exercise.sets} series` : ""} {exercise.reps ? `× ${exercise.reps}` : ""}
                    </span>
                    {exercise.rest && (
                      <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        ⏱️ Descanso: {exercise.rest}
                      </span>
                    )}
                  </div>

                  {exercise.cue && (
                    <p style={{ 
                      margin: "0.5rem 0 0 0", 
                      fontSize: "0.75rem", 
                      color: "#00E5FF", 
                      background: "rgba(0, 229, 255, 0.06)", 
                      padding: "0.4rem 0.6rem", 
                      borderRadius: "8px",
                      borderLeft: "2px solid #00E5FF"
                    }}>
                      💡 <strong>Tip Técnico:</strong> {exercise.cue}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion CTA */}
        {workoutFinished ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={styles.successMessage}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
          >
            <Trophy size={40} color="#00E5FF" />
            <span>¡Sesión Completada con Éxito! 🔥</span>
            <span style={{ fontSize: "1rem", color: "var(--primary)" }}>+100 XP Añadidos a tu Cuenta</span>
          </motion.div>
        ) : (
          <button 
            className={styles.completeButton}
            disabled={!isAllCompleted}
            onClick={finishWorkout}
            style={{
              opacity: isAllCompleted ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <CheckCircle2 size={20} />
            {isAllCompleted ? "Terminar Sesión y Ganar +100 XP" : `Completa los ${currentExercises.length} Ejercicios`}
          </button>
        )}
      </div>

      {/* Split Generator Modal */}
      <AnimatePresence>
        {showSplitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: "0"
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
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--bg-surface)",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                border: "1px solid var(--border)",
                borderBottom: "none",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.5)"
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #FF3366, #FF6B8B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white"
                  }}>
                    <Wand2 size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.2rem", color: "white", fontWeight: 800 }}>
                      Generador de Split por IA
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Ciencia Schoenfeld adaptada a tu disponibilidad
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSplitModal(false)}
                  disabled={isGenerating}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    cursor: "pointer"
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {!generatedPreview ? (
                <>
                  {/* Selector 1: Días por Semana */}
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                      1. ¿Cuántos días entrenarás por semana?
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                      {[3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDaysPerWeek(num)}
                          style={{
                            padding: "0.8rem 0.4rem",
                            borderRadius: "12px",
                            border: daysPerWeek === num ? "2px solid var(--primary)" : "1px solid var(--border)",
                            background: daysPerWeek === num ? "rgba(255, 51, 102, 0.15)" : "var(--bg-dark)",
                            color: daysPerWeek === num ? "white" : "var(--text-muted)",
                            fontWeight: 800,
                            cursor: "pointer",
                            textAlign: "center"
                          }}
                        >
                          <div style={{ fontSize: "1.1rem" }}>{num} Días</div>
                          <div style={{ fontSize: "0.65rem", marginTop: "0.2rem", opacity: 0.8 }}>
                            {num === 3 ? "Full Body" : num === 4 ? "Torso/Pierna" : num === 5 ? "PPL + TP" : "PPL Frec 2"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector 2: Equipo Disponible */}
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                      2. Equipamiento disponible:
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            border: equipment === item.title ? "1.5px solid #00E5FF" : "1px solid var(--border)",
                            background: equipment === item.title ? "rgba(0, 229, 255, 0.08)" : "var(--bg-dark)",
                            textAlign: "left",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: equipment === item.title ? "white" : "var(--text-main)" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector 3: Enfoque Prioritario */}
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
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
                            padding: "0.7rem",
                            borderRadius: "10px",
                            border: focus === f.key ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                            background: focus === f.key ? "rgba(255, 51, 102, 0.12)" : "var(--bg-dark)",
                            color: focus === f.key ? "white" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            textAlign: "center"
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector 4: Nivel */}
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                      4. Nivel de Experiencia:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                      {["Principiante", "Intermedio", "Avanzado"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setLevel(lvl)}
                          style={{
                            padding: "0.6rem",
                            borderRadius: "10px",
                            border: level === lvl ? "1.5px solid #00E5FF" : "1px solid var(--border)",
                            background: level === lvl ? "rgba(0, 229, 255, 0.1)" : "var(--bg-dark)",
                            color: level === lvl ? "white" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleGenerateSplit}
                    disabled={isGenerating}
                    className="glow-primary"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "14px",
                      background: "var(--primary)",
                      border: "none",
                      color: "white",
                      fontSize: "1rem",
                      fontWeight: 800,
                      cursor: isGenerating ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem",
                      marginTop: "0.5rem"
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Diseñando Rutina con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generar Split Científico con IA
                      </>
                    )}
                  </button>

                  {/* Science Tip while loading */}
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        textAlign: "center",
                        padding: "0.8rem",
                        background: "rgba(0, 229, 255, 0.08)",
                        borderRadius: "10px",
                        border: "1px dashed rgba(0, 229, 255, 0.3)"
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "#00E5FF", fontStyle: "italic" }}>
                        🔬 {cyclingScienceTips[scienceTipIdx]}
                      </p>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Split Preview Screen */
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{
                    background: "rgba(0, 229, 255, 0.08)",
                    border: "1px solid rgba(0, 229, 255, 0.3)",
                    borderRadius: "14px",
                    padding: "1rem"
                  }}>
                    <span style={{ fontSize: "0.7rem", color: "#00E5FF", fontWeight: 800, textTransform: "uppercase" }}>
                      Vista Previa del Split
                    </span>
                    <h3 style={{ margin: "0.2rem 0 0.5rem 0", color: "white", fontSize: "1.2rem" }}>
                      {generatedPreview.splitTitle}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {generatedPreview.weeklyOverview}
                    </p>
                  </div>

                  {/* Days Overview */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "300px", overflowY: "auto" }}>
                    {generatedPreview.days?.map((day: any, dIdx: number) => (
                      <div 
                        key={dIdx}
                        style={{
                          background: "var(--bg-dark)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          padding: "0.8rem"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "0.85rem" }}>
                            {day.dayName}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            ⏱️ {day.duration}
                          </span>
                        </div>
                        <p style={{ margin: "0.2rem 0 0.5rem 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          🎯 {day.targetMuscles}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                          {day.exercises?.slice(0, 3).map((ex: any, eIdx: number) => (
                            <div key={eIdx} style={{ fontSize: "0.75rem", color: "var(--text-main)", display: "flex", justifyContent: "space-between" }}>
                              <span>• {ex.name}</span>
                              <span style={{ color: "var(--text-muted)" }}>{ex.sets}x {ex.reps}</span>
                            </div>
                          ))}
                          {day.exercises && day.exercises.length > 3 && (
                            <span style={{ fontSize: "0.7rem", color: "#00E5FF" }}>
                              +{day.exercises.length - 3} ejercicios más...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
                    <button
                      onClick={() => setGeneratedPreview(null)}
                      style={{
                        flex: 1,
                        padding: "0.9rem",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      Ajustar Parámetros
                    </button>
                    <button
                      onClick={handleApplySplit}
                      className="glow-primary"
                      style={{
                        flex: 2,
                        padding: "0.9rem",
                        borderRadius: "12px",
                        background: "var(--primary)",
                        border: "none",
                        color: "white",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem"
                      }}
                    >
                      <Check size={18} />
                      Guardar como Mi Rutina (+100 XP)
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
