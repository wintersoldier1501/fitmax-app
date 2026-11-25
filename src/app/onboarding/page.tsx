"use client";

import { useState } from "react";
import styles from "./onboarding.module.css";
import { useRouter } from "next/navigation";
import { useFitmax } from "@/context/FitmaxContext";

export default function Onboarding() {
  const router = useRouter();
  const { setProfileAndCalculate, showToast, profile } = useFitmax();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    goal: profile.goal || "",
    name: profile.name || "",
    sex: profile.sex || "",
    age: profile.age ? String(profile.age) : "",
    height: profile.height ? String(profile.height) : "",
    weight: profile.weight ? String(profile.weight) : "",
    targetWeight: profile.targetWeight ? String(profile.targetWeight) : "",
    activityLevel: profile.activityLevel || "",
    budget: profile.budget || ""
  });

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateCurrentStep = (): boolean => {
    if (step === 1 && !formData.goal) {
      showToast("Selecciona tu objetivo principal para continuar", "warning");
      return false;
    }
    if (step === 2) {
      if (!formData.name.trim()) {
        showToast("Ingresa tu nombre o apodo", "warning");
        return false;
      }
      if (!formData.sex) {
        showToast("Selecciona tu sexo biológico para calibrar la fórmula", "warning");
        return false;
      }
      const ageNum = Number(formData.age);
      if (!ageNum || ageNum < 12 || ageNum > 100) {
        showToast("Ingresa una edad válida (12–100 años)", "warning");
        return false;
      }
    }
    if (step === 3) {
      const h = Number(formData.height);
      const w = Number(formData.weight);
      if (!h || h < 100 || h > 240) {
        showToast("Ingresa tu estatura en cm (ej. 175)", "warning");
        return false;
      }
      if (!w || w < 30 || w > 280) {
        showToast("Ingresa tu peso actual en kg (ej. 75)", "warning");
        return false;
      }
    }
    if (step === 4 && !formData.activityLevel) {
      showToast("Selecciona tu nivel de actividad semanal", "warning");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const finalWeight = Number(formData.weight);
      const finalTarget = Number(formData.targetWeight) || finalWeight;
      setProfileAndCalculate({
        name: formData.name.trim(),
        sex: formData.sex,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: finalWeight,
        targetWeight: finalTarget,
        goal: formData.goal as any,
        activityLevel: formData.activityLevel as any,
        budget: (formData.budget || "Económico") as any
      });
      showToast("¡Perfil calibrado con precisión científica!", "success");
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
            <p className={styles.subtitle}>Esto calibrará el algoritmo calórico y de entrenamiento.</p>
            <div className={styles.optionsGrid}>
              {[
                { title: "Perder Grasa", desc: "Déficit calórico inteligente para preservar músculo y eliminar grasa." },
                { title: "Recomposición Corporal", desc: "Bajar grasa y aumentar músculo simultáneamente en mantenimiento." },
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
              <input type="number" step="0.1" placeholder="Ej. 80" value={formData.weight} onChange={(e) => updateForm("weight", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Meta de Peso (kg)</label>
              <input type="number" step="0.1" placeholder="Ej. 74" value={formData.targetWeight} onChange={(e) => updateForm("targetWeight", e.target.value)} />
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
                { level: "Sedentario", desc: "Trabajo de oficina, poco movimiento diario" },
                { level: "Ligero", desc: "1-3 días de ejercicio suave o caminata" },
                { level: "Moderado", desc: "3-5 días de entrenamiento de fuerza" },
                { level: "Intenso", desc: "Atleta o 6-7 días pesados a la semana" }
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
            <p className={styles.subtitle}>La dieta debe ajustarse a tu bolsillo y despensa.</p>
            <div className={styles.optionsGrid}>
              {[
                { level: "Económico", desc: "Ingredientes accesibles y básicos (pollo, arroz, huevos, atún)." },
                { level: "Estándar", desc: "Equilibrio entre variedad cotidiana y costo." },
                { level: "Premium", desc: "Cortes finos, salmón, whey protein y variedad gourmet." }
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
