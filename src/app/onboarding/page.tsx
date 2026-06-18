"use client";

import { useState } from "react";
import styles from "./onboarding.module.css";
import { useRouter } from "next/navigation";
import { useFitmax } from "@/context/FitmaxContext";

export default function Onboarding() {
  const router = useRouter();
  const { setProfileAndCalculate } = useFitmax();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    goal: "",
    name: "",
    sex: "",
    age: "",
    height: "",
    weight: "",
    targetWeight: "",
    activityLevel: "",
    budget: "",
  });

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Finalize profile and calculate macros
      setProfileAndCalculate({
        name: formData.name,
        sex: formData.sex,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        targetWeight: Number(formData.targetWeight),
        goal: formData.goal as any,
        activityLevel: formData.activityLevel as any,
      });
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className={styles.title}>¿Cuál es tu objetivo principal?</h1>
            <p className={styles.subtitle}>Esto calibrará el algoritmo de la IA.</p>
            <div className={styles.optionsGrid}>
              {[
                { title: "Perder Grasa", desc: "Déficit calórico para eliminar tejido adiposo." },
                { title: "Recomposición Corporal", desc: "Bajar grasa y aumentar músculo simultáneamente." },
                { title: "Subir de Peso Limpio", desc: "Superávit controlado para ganar masa muscular sin grasa extra." }
              ].map((opt) => (
                <button
                  key={opt.title}
                  className={`${styles.optionCard} ${formData.goal === opt.title ? styles.selected : ""}`}
                  onClick={() => updateForm("goal", opt.title)}
                >
                  <h3>{opt.title === "Perder Grasa" ? "🔥" : opt.title === "Recomposición Corporal" ? "⚖️" : "💪"} {opt.title}</h3>
                  <p>{opt.desc}</p>
                </button>
              ))}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h1 className={styles.title}>Conozcámonos</h1>
            <p className={styles.subtitle}>Datos básicos para tu perfil Fitmax.</p>
            <div className={styles.formGroup}>
              <label>Tu Nombre o Apodo</label>
              <input type="text" placeholder="Ej. Alex" value={formData.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Sexo</label>
              <select value={formData.sex} onChange={(e) => updateForm("sex", e.target.value)}>
                <option value="">Selecciona...</option>
                <option value="H">Hombre</option>
                <option value="M">Mujer</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Edad</label>
              <input type="number" placeholder="Años" value={formData.age} onChange={(e) => updateForm("age", e.target.value)} />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h1 className={styles.title}>Tus Medidas</h1>
            <p className={styles.subtitle}>Sé honesto, aquí no hay juicios.</p>
            <div className={styles.formGroup}>
              <label>Estatura (cm)</label>
              <input type="number" placeholder="Ej. 175" value={formData.height} onChange={(e) => updateForm("height", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Peso Actual (kg)</label>
              <input type="number" placeholder="Ej. 80" value={formData.weight} onChange={(e) => updateForm("weight", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Meta de Peso (kg)</label>
              <input type="number" placeholder="Ej. 70" value={formData.targetWeight} onChange={(e) => updateForm("targetWeight", e.target.value)} />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h1 className={styles.title}>Nivel de Actividad</h1>
            <p className={styles.subtitle}>¿Cuánto te mueves y cuánto te puedes comprometer?</p>
            <div className={styles.optionsGrid}>
              {[
                { level: "Sedentario", desc: "Trabajo de oficina, poco movimiento" },
                { level: "Ligero", desc: "1-3 días de ejercicio suave" },
                { level: "Moderado", desc: "3-5 días de entrenamiento" },
                { level: "Intenso", desc: "Atleta o 6-7 días pesados" }
              ].map((opt) => (
                <button
                  key={opt.level}
                  className={`${styles.optionCard} ${formData.activityLevel === opt.level ? styles.selected : ""}`}
                  onClick={() => updateForm("activityLevel", opt.level)}
                >
                  <h3>{opt.level}</h3>
                  <p>{opt.desc}</p>
                </button>
              ))}
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h1 className={styles.title}>Macro-Economía</h1>
            <p className={styles.subtitle}>La dieta debe ajustarse a tu bolsillo.</p>
            <div className={styles.optionsGrid}>
              {[
                { level: "Económico", desc: "Ingredientes accesibles y básicos (pollo, arroz, huevos)." },
                { level: "Estándar", desc: "Equilibrio entre variedad y costo." },
                { level: "Premium", desc: "Cortes finos, salmón, suplementos y variedad total." }
              ].map((opt) => (
                <button
                  key={opt.level}
                  className={`${styles.optionCard} ${formData.budget === opt.level ? styles.selected : ""}`}
                  onClick={() => updateForm("budget", opt.level)}
                >
                  <h3>{opt.level}</h3>
                  <p>{opt.desc}</p>
                </button>
              ))}
            </div>
          </>
        );
    }
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <main className={styles.main}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
      </div>
      
      <div className={styles.content}>
        {renderStep()}
      </div>

      <div className={styles.navigation}>
        <button onClick={handleBack} className={styles.backButton}>Atrás</button>
        <button onClick={handleNext} className={styles.nextButton}>
          {step === totalSteps ? "Crear Perfil" : "Siguiente"}
        </button>
      </div>
    </main>
  );
}
