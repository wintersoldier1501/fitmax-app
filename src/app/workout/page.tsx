"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./workout.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";

// Simulated Scientific Workouts (10-20 weekly sets per muscle group, RIR 1-3)
const homeWorkouts = [
  {
    name: "Push (Casa) - Hipertrofia RIR 1",
    duration: "45 min",
    exercises: [
      { id: 1, name: "Flexiones Declinadas (Fallo en última serie)", reps: "4 x Al fallo -1 RIR", img: "💪" },
      { id: 2, name: "Pike Push-ups (Hombro)", reps: "4 x 8-12 (RIR 2)", img: "🏋️" },
      { id: 3, name: "Fondos en Silla (Tríceps)", reps: "3 x 12-15 (RIR 1)", img: "🪑" }
    ]
  },
  {
    name: "Pull (Casa) - Tensión Mecánica",
    duration: "40 min",
    exercises: [
      { id: 4, name: "Dominadas (Si tienes barra) o Remos con Toalla", reps: "4 x 8-10 (RIR 2)", img: "🚪" },
      { id: 5, name: "Superman Holds (Espalda Baja)", reps: "3 x 45 seg", img: "🦸‍♂️" },
      { id: 6, name: "Curl de Bíceps con Mochila Pesada", reps: "3 x 12-15 (RIR 1)", img: "🎒" }
    ]
  }
];

const gymWorkouts = [
  {
    name: "Día 1: Upper Body (Enfoque Tensión Mecánica)",
    duration: "60 min",
    exercises: [
      { id: 7, name: "Press de Banca con Barra", reps: "4 x 6-8 (RIR 2) - 3 min desc.", img: "🏋️‍♂️" },
      { id: 8, name: "Remo con Barra (Pendlay)", reps: "4 x 8-10 (RIR 2) - 2 min desc.", img: "🚣" },
      { id: 9, name: "Press Militar con Mancuernas", reps: "3 x 10-12 (RIR 1)", img: "💪" },
      { id: 10, name: "Curl de Bíceps en Banco Inclinado", reps: "3 x 12-15 (Fallo)", img: "🔥" }
    ]
  },
  {
    name: "Día 2: Lower Body (Enfoque Cuádriceps/Glúteo)",
    duration: "65 min",
    exercises: [
      { id: 11, name: "Sentadilla Libre (Barra Alta)", reps: "4 x 5-8 (RIR 2) - 3 min desc.", img: "🦵" },
      { id: 12, name: "Peso Muerto Rumano (Isquiosurales)", reps: "4 x 8-10 (RIR 1) - 2 min desc.", img: "🍑" },
      { id: 13, name: "Prensa de Piernas", reps: "3 x 12-15 (Fallo en última serie)", img: "🏋️" },
      { id: 14, name: "Elevación de Gemelos de Pie", reps: "4 x 15-20 (Fallo)", img: "🦿" }
    ]
  }
];

export default function Workout() {
  const router = useRouter();
  const { isLoaded, profile, addXp } = useFitmax();
  const [location, setLocation] = useState<"home" | "gym">("home");
  const [selectedRoutine, setSelectedRoutine] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  if (!isLoaded) return null;

  const routines = location === "home" ? homeWorkouts : gymWorkouts;
  const currentWorkout = routines[selectedRoutine];
  const isAllCompleted = completedExercises.length === currentWorkout.exercises.length && currentWorkout.exercises.length > 0;

  const toggleExercise = (id: number) => {
    if (completedExercises.includes(id)) {
      setCompletedExercises(completedExercises.filter(eId => eId !== id));
    } else {
      setCompletedExercises([...completedExercises, id]);
    }
  };

  const finishWorkout = () => {
    addXp(100);
    setWorkoutFinished(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  // Reset completion when location changes
  useEffect(() => {
    setCompletedExercises([]);
  }, [location]);

  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ←
        </button>
        <h1 className={styles.title}>Rutina del Día</h1>
      </header>

      <div className={styles.toggleContainer}>
        <button 
          className={`${styles.toggleButton} ${location === "home" ? styles.active : ""}`}
          onClick={() => setLocation("home")}
        >
          🏠 En Casa
        </button>
        <button 
          className={`${styles.toggleButton} ${location === "gym" ? styles.active : ""}`}
          onClick={() => setLocation("gym")}
        >
          🏋️ Gimnasio
        </button>
      </div>

      <div className={styles.workoutCard}>
        <div className={styles.workoutHeader}>
          <h2 className={styles.workoutTitle}>{currentWorkout.name}</h2>
          <p className={styles.workoutDesc}>
            Rutina diseñada para hipertrofia con metodología científica. 
            <strong> Duración estimada: {currentWorkout.duration}</strong>
          </p>
        </div>

        <div className={styles.exerciseList}>
          {currentWorkout.exercises.map((exercise) => {
            const isCompleted = completedExercises.includes(exercise.id);
            return (
              <div 
                key={exercise.id} 
                className={`${styles.exerciseItem} ${isCompleted ? styles.completed : ""}`}
                onClick={() => toggleExercise(exercise.id)}
              >
                <div className={styles.checkbox}>
                  {isCompleted && "✓"}
                </div>
                <div className={styles.exerciseInfo}>
                  <p className={styles.exerciseName}>{exercise.name}</p>
                  <p className={styles.exerciseReps}>{exercise.reps}</p>
                </div>
              </div>
            );
          })}
        </div>

        {workoutFinished ? (
          <div className={styles.successMessage}>
            ¡Rutina Completada! +100 XP 🔥
          </div>
        ) : (
          <button 
            className={styles.completeButton}
            disabled={!isAllCompleted}
            onClick={finishWorkout}
          >
            Terminar y Ganar XP
          </button>
        )}
      </div>
    </motion.main>
  );
}
