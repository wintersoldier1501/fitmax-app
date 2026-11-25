"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import styles from "./dashboard.module.css";
import { RankCard } from "@/components/RankCard";
import { MacroRing } from "@/components/MacroRing";
import { DailyWisdom } from "@/components/DailyWisdom";
import { HybridCardioWidget } from "@/components/HybridCardioWidget";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { useFitmax, RANKS, getLocalISODate, SupplementKey } from "@/context/FitmaxContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dumbbell,
  ChevronRight,
  User,
  Droplets,
  Plus,
  Minus,
  X,
  Scale,
  Sparkles,
  Brain,
  TrendingUp,
  Gift,
  CheckCircle2,
  Pill
} from "lucide-react";

export default function Dashboard() {
  const {
    isLoaded,
    profile,
    targetMacros,
    currentMacros,
    xp,
    streak,
    streakShields,
    waterGlasses,
    addWater,
    removeWater,
    setProfileAndCalculate,
    adjustTargetCalories,
    addXp,
    customWorkoutPlan,
    todayReadiness,
    todaySupplements,
    creatineStreak,
    toggleSupplement,
    dailySteps,
    stepsGoal,
    workoutHistory,
    trifectaClaimedDate,
    claimDailyTrifecta,
    showToast
  } = useFitmax();
  const router = useRouter();

  // Check-in modal state
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weight ? profile.weight.toString() : "");
  const [checkInResult, setCheckInResult] = useState<{
    diff: number;
    advice: string;
    suggestAdjustment: boolean;
    recommendedDelta: number;
  } | null>(null);

  if (!isLoaded) return null;

  const userName = profile.name || "Guerrero";
  const date = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });

  // Exact Tier XP Logic
  const rankIndex = Math.min(Math.floor(xp / 200), RANKS.length - 1);
  const rankName = RANKS[rankIndex];
  const isMaxRank = rankIndex === RANKS.length - 1;
  const xpInRank = isMaxRank ? 200 : xp % 200;
  const maxTierXP = 200;

  const macros = {
    protein: { current: currentMacros.protein, target: targetMacros.protein || 1, color: "var(--primary)" },
    carbs: { current: currentMacros.carbs, target: targetMacros.carbs || 1, color: "var(--accent)" },
    fats: { current: currentMacros.fats, target: targetMacros.fats || 1, color: "#F59E0B" }
  };

  const targetCalBudget =
    targetMacros.calories ||
    Math.round(macros.protein.target * 4 + macros.carbs.target * 4 + macros.fats.target * 9);
  const consumedCal = currentMacros.calories || 0;
  const remainingCal = Math.max(0, targetCalBudget - consumedCal);
  const calPercent = Math.min(100, Math.round((consumedCal / Math.max(1, targetCalBudget)) * 100));

  return (
    <main className={styles.main}>
      {/* Header Section */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <p className={styles.date}>{date}</p>
          <h1 className={styles.greeting}>Hola, {userName}</h1>
        </div>
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <div
            className={styles.profilePic}
            style={{
              overflow: "hidden",
              position: "relative",
              backgroundColor: "var(--bg-surface-solid)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={24} color="var(--text-muted)" />
            )}
          </div>
        </Link>
      </motion.header>

      {/* PWA Install Guide Banner */}
      <PwaInstallBanner />

      {/* Gamification Rank Card */}
      <section>
        <RankCard
          rankName={rankName}
          currentXP={xp}
          maxXP={maxTierXP}
          xpInRank={xpInRank}
          streak={streak}
          streakShields={streakShields}
        />
      </section>

      {/* Daily Trifecta Quests */}
      {(() => {
        const todayISO = getLocalISODate();
        const proteinQuestDone = (targetMacros.protein || 100) > 0 && currentMacros.protein >= (targetMacros.protein || 100) * 0.85;
        const hydrationQuestDone = waterGlasses >= 8;
        const trainedToday = workoutHistory.some((w) => w.date === todayISO);
        const movementQuestDone = trainedToday || dailySteps >= stepsGoal;
        const completedCount = [proteinQuestDone, hydrationQuestDone, movementQuestDone].filter(Boolean).length;
        const allDone = completedCount === 3;
        const alreadyClaimed = trifectaClaimedDate === todayISO;

        return (
          <section className="glass-card" style={{ padding: "1.1rem", border: allDone ? "1px solid var(--accent-border)" : "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.7rem" }}>
              <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Gift size={16} color="var(--primary)" /> Trifecta Diaria ({completedCount}/3)
              </span>
              <span style={{ fontSize: "0.72rem", color: allDone ? "#10b981" : "var(--text-muted)", fontWeight: 700 }}>
                {alreadyClaimed ? "✓ Cofre reclamado" : "+150 XP + 1 Escudo"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
              {[
                { label: "85% Proteína", done: proteinQuestDone },
                { label: "2L Agua (8💧)", done: hydrationQuestDone },
                { label: "Entreno o 10k", done: movementQuestDone }
              ].map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "0.5rem 0.35rem",
                    borderRadius: "10px",
                    background: q.done ? "rgba(16, 185, 129, 0.12)" : "var(--bg-dark)",
                    border: q.done ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid var(--border)",
                    textAlign: "center",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: q.done ? "#10b981" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.25rem"
                  }}
                >
                  {q.done && <CheckCircle2 size={12} />} {q.label}
                </div>
              ))}
            </div>

            {allDone && !alreadyClaimed && (
              <button
                onClick={claimDailyTrifecta}
                className="glow-primary"
                style={{
                  marginTop: "0.75rem",
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: "10px",
                  background: "var(--primary)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.85rem"
                }}
              >
                🎁 Abrir Cofre Trifecta (+150 XP + 🛡️ Escudo)
              </button>
            )}
          </section>
        );
      })()}

      {/* Daily Wisdom & Stoic Reflection */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        <DailyWisdom />
      </motion.section>

      {/* Daily Macros Rings + Master Calorie Bar */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Tus Macros de Hoy</h2>
          <Link href="/log" style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700 }}>
            + Registrar Comida
          </Link>
        </div>

        <div className={styles.macrosContainer}>
          <MacroRing label="Proteína" current={macros.protein.current} total={macros.protein.target} color={macros.protein.color} size={88} strokeWidth={8} />
          <MacroRing label="Carbos" current={macros.carbs.current} total={macros.carbs.target} color={macros.carbs.color} size={88} strokeWidth={8} />
          <MacroRing label="Grasas" current={macros.fats.current} total={macros.fats.target} color={macros.fats.color} size={88} strokeWidth={8} />
        </div>

        {/* Master Caloric Progress Card */}
        <div
          className="glass-card"
          style={{
            marginTop: "0.85rem",
            padding: "1rem 1.15rem",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", display: "block" }}>
                Presupuesto Calórico
              </span>
              <span style={{ color: "white", fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                {consumedCal} <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>/ {targetCalBudget} kcal</span>
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Restantes</span>
              <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--accent)" }}>{remainingCal} kcal</span>
            </div>
          </div>

          <div style={{ width: "100%", height: "7px", background: "var(--bg-dark)", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${calPercent}%`,
                height: "100%",
                background: consumedCal > targetCalBudget ? "#EF4444" : "linear-gradient(90deg, var(--primary), var(--accent))",
                transition: "width 0.4s ease"
              }}
            />
          </div>
        </div>
      </motion.section>

      {/* Quick Readiness & Analytics Strip */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}
      >
        <Link
          href="/log"
          className="glass-card"
          style={{ padding: "1rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.35rem" }}
        >
          <span style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Brain size={14} /> READINESS HOY
          </span>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>
            {todayReadiness ? `${todayReadiness.score}%` : "Evaluar"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {todayReadiness ? `Sueño: ${todayReadiness.sleepHours}h` : "Registra sueño y fatiga"}
          </span>
        </Link>

        <Link
          href="/profile"
          className="glass-card"
          style={{ padding: "1rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.35rem" }}
        >
          <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <TrendingUp size={14} /> EVOLUCIÓN
          </span>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>
            {profile.weight ? `${profile.weight} kg` : "Ver Gráficas"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Mapa muscular y tendencias
          </span>
        </Link>
      </motion.section>

      {/* Grade-A Daily Supplements Stack */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.28 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.7rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Pill size={18} color="var(--primary)" /> Stack Diario
          </h2>
          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent)", background: "var(--accent-subtle)", padding: "0.2rem 0.55rem", borderRadius: "999px" }}>
            ⚡ Creatina: {creatineStreak} {creatineStreak === 1 ? "día" : "días"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
          {[
            { key: "creatine", label: "⚡ Creatina 5g", sub: "+15 XP diario" },
            { key: "caffeine", label: "☕ Pre-Entreno", sub: "Foco neural" },
            { key: "omega3", label: "🐟 Omega-3", sub: "Recuperación" },
            { key: "electrolytes", label: "💧 Electrolitos", sub: "Sodio/Potasio" }
          ].map((sup) => {
            const active = todaySupplements[sup.key as SupplementKey];
            return (
              <button
                key={sup.key}
                onClick={() => toggleSupplement(sup.key as SupplementKey)}
                className="glass-card"
                style={{
                  padding: "0.75rem 0.85rem",
                  borderRadius: "14px",
                  border: active ? "1px solid #10b981" : "1px solid var(--border)",
                  background: active ? "rgba(16, 185, 129, 0.12)" : "var(--bg-surface)",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <span style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: active ? "#10b981" : "white" }}>
                    {sup.label}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{sup.sub}</span>
                </div>
                <CheckCircle2 size={16} color={active ? "#10b981" : "rgba(255,255,255,0.18)"} />
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Hybrid Athlete Widget (Steps NEAT + Cardio Logger) */}
      <HybridCardioWidget />

      {/* Water Hydration Tracker */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Droplets size={19} color="var(--accent)" /> Hidratación
          </h2>
          <span style={{ color: "var(--accent)", fontSize: "0.84rem", fontWeight: "bold" }}>
            {waterGlasses * 250} ml / 2500 ml
          </span>
        </div>

        <div className="glass-card" style={{ padding: "1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.9rem", border: "1px solid var(--accent-border)" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1 }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "26px",
                  height: "34px",
                  borderRadius: "6px",
                  background: i < waterGlasses
                    ? "linear-gradient(180deg, var(--accent) 0%, #0077FF 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                  border: i < waterGlasses ? "1px solid var(--accent)" : "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.68rem",
                  color: "white",
                  boxShadow: i < waterGlasses ? "0 0 10px var(--accent-subtle)" : "none",
                  transition: "all 0.3s ease"
                }}
              >
                {i < waterGlasses ? "💧" : ""}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
            <button
              onClick={removeWater}
              disabled={waterGlasses <= 0}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: waterGlasses <= 0 ? "not-allowed" : "pointer",
                opacity: waterGlasses <= 0 ? 0.3 : 1
              }}
              title="Quitar vaso"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={addWater}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                boxShadow: "0 0 12px var(--accent-subtle)"
              }}
              title="Añadir vaso (250ml)"
            >
              <Plus size={17} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Workout Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Tu Entrenamiento</h2>
          {customWorkoutPlan ? (
            <span style={{ fontSize: "0.74rem", color: "var(--accent)", fontWeight: "bold", background: "var(--accent-subtle)", padding: "0.2rem 0.6rem", borderRadius: "10px", border: "1px solid var(--accent-border)" }}>
              ⚡ Split Activo ({customWorkoutPlan.daysPerWeek}D)
            </span>
          ) : (
            <span style={{ fontSize: "0.74rem", color: "var(--primary)", fontWeight: "bold", background: "var(--primary-subtle)", padding: "0.2rem 0.6rem", borderRadius: "10px", border: "1px solid var(--primary-border)" }}>
              ✨ Generador IA
            </span>
          )}
        </div>
        <div
          onClick={() => router.push("/workout")}
          className="glass-card"
          style={{
            padding: "1.25rem 1.4rem",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            border: customWorkoutPlan ? "1px solid var(--accent-border)" : undefined
          }}
        >
          <div style={{ position: "absolute", top: "-20px", right: "-10px", opacity: 0.05, zIndex: 0, color: "var(--text-main)" }}>
            <Dumbbell size={140} />
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--text-main)", fontSize: "1.12rem", fontWeight: 800 }}>
                {customWorkoutPlan ? customWorkoutPlan.splitTitle : "IRON LOG PRO"}
              </h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.84rem" }}>
                {customWorkoutPlan
                  ? `${customWorkoutPlan.days?.[0]?.dayName || "Sesión de Hipertrofia"} • ${customWorkoutPlan.equipment}`
                  : "Registra pesos, timer de descanso y genera tu split IA"}
              </p>
            </div>
            <div
              className="glow-primary"
              style={{
                width: "38px",
                height: "38px",
                backgroundColor: customWorkoutPlan ? "var(--accent)" : "var(--primary)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ChevronRight color={customWorkoutPlan ? "black" : "white"} size={22} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Plateau / Check-in Module */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        style={{ paddingBottom: "2rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Check-in Semanal</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "bold", background: "var(--primary-subtle)", padding: "0.25rem 0.7rem", borderRadius: "12px", border: "1px solid var(--primary-border)" }}>
            Disponible Hoy
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            border: "1px dashed var(--primary)",
            padding: "1.35rem",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <h3 style={{ margin: "0 0 0.45rem 0", color: "white", fontSize: "1.05rem" }}>Evaluación de Estancamiento</h3>
          <p style={{ margin: "0 0 1.2rem 0", color: "var(--text-muted)", fontSize: "0.86rem", lineHeight: 1.5 }}>
            Actualiza tu peso semanal en ayunas. Fitmax detectará si estás en un <i>Plateau</i> y recalibrará tus calorías automáticamente.
          </p>
          <button
            onClick={() => {
              setNewWeight(profile.weight ? profile.weight.toString() : "");
              setCheckInResult(null);
              setShowCheckIn(true);
            }}
            style={{
              width: "100%",
              padding: "0.95rem",
              background: "var(--primary-subtle)",
              color: "var(--primary)",
              border: "1px solid var(--primary)",
              borderRadius: "12px",
              fontWeight: "700",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Scale size={19} /> Iniciar Evaluación Semanal
          </button>
        </div>
      </motion.section>

      {/* Weekly Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "410px",
                padding: "1.8rem",
                background: "var(--bg-surface-solid)",
                border: "1px solid var(--border)",
                borderRadius: "20px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Scale size={21} color="var(--primary)" />
                  <h3 style={{ margin: 0, color: "white", fontSize: "1.15rem" }}>Check-in Semanal</h3>
                </div>
                <button onClick={() => setShowCheckIn(false)} style={{ color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              {!checkInResult ? (
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1.2rem" }}>
                    Tu peso registrado anterior era <strong style={{ color: "white" }}>{profile.weight || 70} kg</strong>. Ingresa tu peso actual en ayunas:
                  </p>

                  <div style={{ marginBottom: "1.3rem" }}>
                    <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.45rem" }}>
                      Peso actual (kg):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ej. 74.2"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        background: "var(--bg-dark)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "1.05rem",
                        fontWeight: "bold"
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const currentW = profile.weight || 70;
                      const enteredW = parseFloat(newWeight);
                      if (!enteredW || enteredW < 30 || enteredW > 300) {
                        showToast("Por favor ingresa un peso válido (30–300 kg)", "warning");
                        return;
                      }

                      const diff = Math.round((enteredW - currentW) * 10) / 10;
                      let advice = "";
                      let suggest = false;
                      let delta = 0;

                      if (profile.goal === "Perder Grasa") {
                        if (diff <= -0.3) {
                          advice = `¡Gran trabajo! Has bajado ${Math.abs(diff)} kg. Tu ritmo de déficit es óptimo y seguro.`;
                        } else if (diff >= 0.3) {
                          advice = `Subiste ${diff} kg. Puede ser retención hídrica o conviene un ajuste de -150 kcal.`;
                          suggest = true;
                          delta = -150;
                        } else {
                          advice = `Peso estable (${diff} kg). Si llevas 2 semanas así, ajustamos -150 kcal para reactivar la pérdida de grasa.`;
                          suggest = true;
                          delta = -150;
                        }
                      } else if (profile.goal === "Subir de Peso Limpio") {
                        if (diff >= 0.2 && diff <= 0.6) {
                          advice = `¡Excelente superávit limpio! Subiste ${diff} kg sin grasa excesiva.`;
                        } else if (diff < 0.1) {
                          advice = `Tu peso no subió (${diff} kg). Te conviene sumar +200 kcal de carbohidratos complejos.`;
                          suggest = true;
                          delta = 200;
                        } else {
                          advice = `Subiste ${diff} kg en una semana. Ritmo rápido: vigila el porcentaje graso.`;
                        }
                      } else {
                        advice = `Variación de ${diff} kg. En recomposición busca subir marcas en el gym mientras el peso oscila poco.`;
                      }

                      setCheckInResult({ diff, advice, suggestAdjustment: suggest, recommendedDelta: delta });
                    }}
                    className="glow-primary"
                    style={{
                      width: "100%",
                      padding: "0.95rem",
                      background: "var(--primary)",
                      color: "white",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontSize: "0.98rem"
                    }}
                  >
                    Evaluar Progreso
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      padding: "1.1rem",
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--accent-border)",
                      borderRadius: "12px",
                      marginBottom: "1.2rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.45rem" }}>
                      <Sparkles size={17} color="var(--accent)" />
                      <strong style={{ color: "var(--accent)" }}>Diagnóstico del Coach IA</strong>
                    </div>
                    <p style={{ margin: 0, color: "var(--text-main)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {checkInResult.advice}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.7rem", flexDirection: "column" }}>
                    <button
                      onClick={() => {
                        const enteredW = parseFloat(newWeight);
                        setProfileAndCalculate({
                          ...profile,
                          weight: enteredW
                        });
                        if (checkInResult.suggestAdjustment && checkInResult.recommendedDelta !== 0) {
                          adjustTargetCalories(checkInResult.recommendedDelta, `Peso y calorías recalibrados (${enteredW} kg)`);
                        }
                        addXp(100, "Check-in semanal");
                        setShowCheckIn(false);
                      }}
                      className="glow-primary"
                      style={{
                        padding: "0.95rem",
                        background: "var(--primary)",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "bold"
                      }}
                    >
                      {checkInResult.suggestAdjustment
                        ? `Guardar Peso (${newWeight} kg) y Ajustar ${checkInResult.recommendedDelta > 0 ? "+" : ""}${checkInResult.recommendedDelta} kcal`
                        : `Guardar Nuevo Peso (${newWeight} kg)`}
                    </button>
                    <button
                      onClick={() => setShowCheckIn(false)}
                      style={{
                        padding: "0.75rem",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        borderRadius: "12px"
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
