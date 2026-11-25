"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import styles from "./log.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { Search, Loader2, Trash2, Mic, MicOff, Sparkles, Brain, Check, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function DiaryLog() {
  const {
    isLoaded,
    loggedFoods,
    resetProgress,
    addFoodLog,
    removeFoodLog,
    todayReadiness,
    saveReadinessLog,
    showToast
  } = useFitmax();

  // Food Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [gramAmount, setGramAmount] = useState<number>(100);

  // Magic Natural Language / Voice Meal Parser State
  const [nlInput, setNlInput] = useState("");
  const [isParsingMeal, setIsParsingMeal] = useState(false);
  const [parsedMeal, setParsedMeal] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Readiness Form State
  const [sleepHours, setSleepHours] = useState<number>(todayReadiness?.sleepHours ?? 7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(todayReadiness?.sleepQuality ?? 8);
  const [fatigue, setFatigue] = useState<number>(todayReadiness?.fatigue ?? 4);
  const [soreness, setSoreness] = useState<number>(todayReadiness?.soreness ?? 4);
  const [readinessNote, setReadinessNote] = useState<string>(todayReadiness?.note ?? "");

  // Inline Delete / Reset confirmation state
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(Boolean(SR));
    }
  }, []);

  useEffect(() => {
    if (todayReadiness) {
      setSleepHours(todayReadiness.sleepHours);
      setSleepQuality(todayReadiness.sleepQuality);
      setFatigue(todayReadiness.fatigue);
      setSoreness(todayReadiness.soreness);
      setReadinessNote(todayReadiness.note);
    }
  }, [todayReadiness]);

  const toggleVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      showToast("Dictado por voz no soportado en este navegador", "warning");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = "es-MX";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setNlInput((prev) => (prev ? `${prev}, ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      showToast("No se pudo captar audio. Intenta escribirlo.", "warning");
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleParseMeal = async () => {
    if (!nlInput.trim()) {
      showToast("Describe primero lo que comiste", "warning");
      return;
    }
    setIsParsingMeal(true);
    setParsedMeal(null);
    try {
      const res = await fetch("/api/food/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nlInput })
      });
      const data = await res.json();
      if (data.items && data.totalMacros) {
        setParsedMeal(data);
      } else {
        showToast(data.error || "No se pudo interpretar la comida", "error");
      }
    } catch {
      showToast("Error de conexión al analizar comida", "error");
    } finally {
      setIsParsingMeal(false);
    }
  };

  const confirmParsedMeal = () => {
    if (!parsedMeal) return;
    const summaryName =
      parsedMeal.items.length === 1
        ? `${parsedMeal.items[0].name} (${parsedMeal.items[0].portion})`
        : parsedMeal.items.map((i: any) => i.name).slice(0, 3).join(" + ");

    addFoodLog({
      id: Date.now().toString(),
      name: summaryName,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      macros: {
        protein: Math.round(parsedMeal.totalMacros.protein || 0),
        carbs: Math.round(parsedMeal.totalMacros.carbs || 0),
        fats: Math.round(parsedMeal.totalMacros.fats || 0),
        calories: Math.round(parsedMeal.totalMacros.calories || 0)
      }
    });
    setParsedMeal(null);
    setNlInput("");
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      if (!data.results || data.results.length === 0) {
        showToast("Sin resultados en OpenFoodFacts. Prueba la Barra IA arriba.", "warning");
      }
    } catch {
      showToast("Error buscando alimento", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const openFoodModal = (food: any) => {
    setSelectedFood(food);
    setGramAmount(100);
  };

  const confirmAddFood = () => {
    if (!selectedFood) return;
    const scale = Math.max(1, gramAmount) / 100;
    const scaledP = Math.round(selectedFood.macros.protein * scale);
    const scaledC = Math.round(selectedFood.macros.carbs * scale);
    const scaledF = Math.round(selectedFood.macros.fats * scale);
    const scaledCal = Math.round(selectedFood.macros.calories * scale) || scaledP * 4 + scaledC * 4 + scaledF * 9;

    addFoodLog({
      id: Date.now().toString(),
      name: `${selectedFood.name} (${gramAmount}g)`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      macros: {
        protein: scaledP,
        carbs: scaledC,
        fats: scaledF,
        calories: scaledCal
      },
      image: selectedFood.image
    });
    setSelectedFood(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSaveReadiness = () => {
    saveReadinessLog({
      sleepHours,
      sleepQuality,
      fatigue,
      soreness,
      note: readinessNote
    });
  };

  // Live preview of Readiness Score before saving
  const liveSleepScore = Math.min(100, (sleepHours / 8) * 50 + sleepQuality * 5);
  const liveReadinessScore = Math.round(
    Math.max(10, Math.min(100, liveSleepScore * 0.4 + (11 - fatigue) * 10 * 0.35 + (11 - soreness) * 10 * 0.25))
  );

  if (!isLoaded) return null;

  return (
    <motion.main
      className={styles.main}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ paddingBottom: "7rem" }}
    >
      {/* Top Segmented Sub-Nav */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.4rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "0.3rem"
        }}
      >
        <Link
          href="/log"
          style={{
            padding: "0.55rem 0.4rem",
            textAlign: "center",
            borderRadius: "10px",
            fontSize: "0.78rem",
            fontWeight: 700,
            background: "var(--primary)",
            color: "white"
          }}
        >
          📋 Diario Hoy
        </Link>
        <Link
          href="/diet"
          style={{
            padding: "0.55rem 0.4rem",
            textAlign: "center",
            borderRadius: "10px",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-muted)"
          }}
        >
          🍳 Plan & Chef IA
        </Link>
        <Link
          href="/grocery"
          style={{
            padding: "0.55rem 0.4rem",
            textAlign: "center",
            borderRadius: "10px",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-muted)"
          }}
        >
          🛒 Súper
        </Link>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Diario</h1>
        {loggedFoods.length > 0 && (
          confirmReset ? (
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
                style={{
                  background: "var(--primary)",
                  color: "white",
                  padding: "0.35rem 0.7rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 700
                }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text-muted)",
                  padding: "0.35rem 0.6rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem"
                }}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className={styles.clearButton}
              onClick={() => setConfirmReset(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <RotateCcw size={14} /> Reiniciar Día
            </button>
          )
        )}
      </header>

      {/* Magic Natural Language & Voice Meal Logger */}
      <section
        className="glass-card"
        style={{
          padding: "1.2rem",
          background: "linear-gradient(135deg, var(--primary-subtle), var(--accent-subtle))",
          border: "1px solid var(--primary-border)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Sparkles size={15} color="var(--primary)" /> Registro Mágico por Texto o Voz
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700 }}>IA INSTANTÁNEA</span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Ej. 3 huevos revueltos, 2 tortillas y 1 scoop de whey..."
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleParseMeal()}
            style={{ flex: 1, fontSize: "0.9rem", background: "var(--bg-dark)" }}
          />
          {speechSupported && (
            <button
              onClick={toggleVoiceInput}
              title="Dictar comida por voz"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: isListening ? "var(--primary)" : "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} color="var(--accent)" />}
            </button>
          )}
        </div>

        <button
          onClick={handleParseMeal}
          disabled={isParsingMeal || !nlInput.trim()}
          className="glow-primary"
          style={{
            marginTop: "0.7rem",
            width: "100%",
            padding: "0.8rem",
            background: "var(--primary)",
            color: "white",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: isParsingMeal || !nlInput.trim() ? 0.6 : 1
          }}
        >
          {isParsingMeal ? <><Loader2 size={17} className="animate-spin" /> Desglosando macros...</> : <>Calcular y Desglosar Comida ✨</>}
        </button>

        <AnimatePresence>
          {parsedMeal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: "0.9rem",
                padding: "0.9rem",
                background: "var(--bg-dark)",
                border: "1px solid var(--accent-border)",
                borderRadius: "14px"
              }}
            >
              <p style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700, marginBottom: "0.5rem" }}>
                Desglose detectado ({parsedMeal.totalMacros.calories} kcal):
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.8rem" }}>
                {parsedMeal.items.map((it: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ color: "white" }}>• {it.name} ({it.portion})</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {it.macros.protein}P · {it.macros.carbs}C · {it.macros.fats}G
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={confirmParsedMeal}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  background: "var(--accent)",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "0.86rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                <Plus size={16} /> Registrar Todo en Mi Diario (+50 XP)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Real Food Search */}
      <section>
        <div style={{ position: "relative", display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Buscar alimento en base (ej. Atún, Avena...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              padding: "0.9rem 1rem 0.9rem 2.8rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "white",
              borderRadius: "14px",
              fontSize: "0.95rem"
            }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "0.95rem", top: "50%", transform: "translateY(-50%)" }} />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            style={{ padding: "0 1.2rem", background: "var(--primary)", color: "white", borderRadius: "14px", fontWeight: "bold" }}
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : "Buscar"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "0.8rem", background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden" }}
          >
            {searchResults.map((food) => (
              <div
                key={food.id}
                onClick={() => openFoodModal(food)}
                style={{ padding: "0.9rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.9rem", cursor: "pointer" }}
              >
                {food.image ? (
                  <img src={food.image} alt={food.name} style={{ width: "46px", height: "46px", borderRadius: "8px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "var(--bg-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>🍽️</div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: "white", fontSize: "0.9rem" }}>{food.name}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{food.brand} • {food.macros.calories} kcal / 100g</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "var(--primary)", fontSize: "0.82rem", fontWeight: "bold" }}>{food.macros.protein}g P</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Functional Daily Recovery & Readiness Module */}
      <section className="glass-card" style={{ padding: "1.3rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
          <h2 style={{ fontSize: "1.05rem", color: "white", display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Brain size={18} color="var(--accent)" /> Readiness & Recuperación
          </h2>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              padding: "0.25rem 0.65rem",
              borderRadius: "999px",
              background: liveReadinessScore >= 70 ? "rgba(16,185,129,0.16)" : liveReadinessScore >= 50 ? "rgba(245,158,11,0.16)" : "var(--primary-subtle)",
              color: liveReadinessScore >= 70 ? "#10b981" : liveReadinessScore >= 50 ? "#f59e0b" : "var(--primary)"
            }}
          >
            {liveReadinessScore}% Disposición
          </span>
        </div>

        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Si tu disposición baja de 55%, Fitmax autorregula tu rutina en Entreno para evitar sobreentrenar tu SNC.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
              Horas de Sueño ({sleepHours}h)
            </label>
            <input
              type="number"
              step="0.5"
              min="3"
              max="12"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value) || 0)}
              style={{ width: "100%", padding: "0.65rem", background: "var(--bg-dark)", fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
              Calidad Sueño (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
              style={{ width: "100%", padding: "0.65rem", background: "var(--bg-dark)", fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
              Fatiga SNC (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={fatigue}
              onChange={(e) => setFatigue(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
              style={{ width: "100%", padding: "0.65rem", background: "var(--bg-dark)", fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
              Dolor Muscular (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={soreness}
              onChange={(e) => setSoreness(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
              style={{ width: "100%", padding: "0.65rem", background: "var(--bg-dark)", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        <textarea
          placeholder="Nota opcional (ej. Me sentí con mucha energía en el press...)"
          value={readinessNote}
          onChange={(e) => setReadinessNote(e.target.value)}
          style={{
            width: "100%",
            background: "var(--bg-dark)",
            padding: "0.75rem",
            borderRadius: "10px",
            resize: "none",
            height: "68px",
            marginBottom: "0.85rem",
            fontSize: "0.85rem"
          }}
        />
        <button
          onClick={handleSaveReadiness}
          style={{
            width: "100%",
            padding: "0.8rem",
            background: todayReadiness ? "var(--accent-subtle)" : "var(--primary)",
            border: todayReadiness ? "1px solid var(--accent-border)" : "none",
            color: todayReadiness ? "var(--accent)" : "white",
            borderRadius: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem"
          }}
        >
          <Check size={16} /> {todayReadiness ? "Actualizar Readiness Hoy" : "Guardar Reporte (+25 XP)"}
        </button>
      </section>

      {/* Food Timeline */}
      {loggedFoods.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🍽️</span>
          <h2>Aún no has registrado comidas</h2>
          <p>Usa el Registro Mágico de arriba o el Escáner Central para sumar tus macros con exactitud.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {loggedFoods.map((food, index) => (
            <motion.div
              key={food.id}
              className={styles.foodCard}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.06, 0.3) }}
            >
              <div className={styles.timelineDot} />

              <div className={styles.foodImageContainer}>
                {food.image ? (
                  <img src={food.image} alt={food.name} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                    🥩
                  </div>
                )}
              </div>

              <div className={styles.foodInfo}>
                <div className={styles.foodHeader}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <h3 className={styles.foodName}>{food.name}</h3>
                    <span className={styles.foodTime}>{food.time}</span>
                  </div>
                  {confirmDeleteId === food.id ? (
                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      <button
                        onClick={() => {
                          removeFoodLog(food.id);
                          setConfirmDeleteId(null);
                        }}
                        style={{
                          background: "var(--primary)",
                          color: "white",
                          borderRadius: "6px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.72rem",
                          fontWeight: 700
                        }}
                      >
                        Borrar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--text-muted)",
                          borderRadius: "6px",
                          padding: "0.25rem 0.45rem",
                          fontSize: "0.72rem"
                        }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(food.id);
                      }}
                      style={{
                        background: "var(--primary-subtle)",
                        border: "1px solid var(--primary-border)",
                        color: "var(--primary)",
                        borderRadius: "8px",
                        padding: "0.35rem 0.55rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Eliminar comida"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className={styles.macrosRow}>
                  <div className={styles.macroItem}>
                    <span className={styles.macroValue} style={{ color: "var(--primary)" }}>{food.macros.protein}g</span>
                    <span className={styles.macroLabel}>Pro</span>
                  </div>
                  <div className={styles.macroItem}>
                    <span className={styles.macroValue} style={{ color: "var(--accent)" }}>{food.macros.carbs}g</span>
                    <span className={styles.macroLabel}>Car</span>
                  </div>
                  <div className={styles.macroItem}>
                    <span className={styles.macroValue} style={{ color: "#FFD700" }}>{food.macros.fats}g</span>
                    <span className={styles.macroLabel}>Gra</span>
                  </div>
                  <div className={styles.macroItem}>
                    <span className={styles.macroValue}>{food.macros.calories}</span>
                    <span className={styles.macroLabel}>kcal</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dynamic Gram Portion Confirmation Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(6px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card"
              style={{ width: "100%", maxWidth: "400px", padding: "1.6rem", background: "var(--bg-surface-solid)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "1.1rem" }}>
                {selectedFood.image && (
                  <img src={selectedFood.image} alt={selectedFood.name} style={{ width: "54px", height: "54px", borderRadius: "12px", objectFit: "cover" }} />
                )}
                <div>
                  <h3 style={{ color: "white", fontSize: "1.05rem" }}>{selectedFood.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{selectedFood.brand} • Base 100g</p>
                </div>
              </div>

              {/* Gram Selector */}
              <div style={{ marginBottom: "1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cantidad consumida (g / ml):</label>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={gramAmount}
                    onChange={(e) => setGramAmount(Math.max(1, Number(e.target.value) || 0))}
                    style={{ width: "85px", textAlign: "center", padding: "0.4rem", fontWeight: 800, fontSize: "0.95rem" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {[30, 50, 100, 150, 200, 300].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGramAmount(g)}
                      style={{
                        flex: 1,
                        minWidth: "48px",
                        padding: "0.35rem",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: gramAmount === g ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: gramAmount === g ? "var(--primary-subtle)" : "rgba(255,255,255,0.03)",
                        color: gramAmount === g ? "white" : "var(--text-muted)"
                      }}
                    >
                      {g}g
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.4rem", background: "rgba(0,0,0,0.35)", padding: "0.9rem", borderRadius: "12px" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>PRO</p>
                  <p style={{ fontWeight: 800, color: "var(--primary)" }}>{Math.round(selectedFood.macros.protein * (gramAmount / 100))}g</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>CAR</p>
                  <p style={{ fontWeight: 800, color: "var(--accent)" }}>{Math.round(selectedFood.macros.carbs * (gramAmount / 100))}g</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>GRA</p>
                  <p style={{ fontWeight: 800, color: "#FFD700" }}>{Math.round(selectedFood.macros.fats * (gramAmount / 100))}g</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>KCAL</p>
                  <p style={{ fontWeight: 800, color: "white" }}>{Math.round(selectedFood.macros.calories * (gramAmount / 100))}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.8rem" }}>
                <button
                  onClick={() => setSelectedFood(null)}
                  style={{ flex: 1, padding: "0.9rem", background: "transparent", border: "1px solid var(--border)", color: "white", borderRadius: "12px" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAddFood}
                  className="glow-primary"
                  style={{ flex: 1, padding: "0.9rem", background: "var(--primary)", color: "white", borderRadius: "12px", fontWeight: "bold" }}
                >
                  Añadir ({gramAmount}g)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
