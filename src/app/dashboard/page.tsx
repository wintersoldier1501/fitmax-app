"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import styles from "./dashboard.module.css";
import { RankCard } from "@/components/RankCard";
import { MacroRing } from "@/components/MacroRing";
import { useFitmax } from "@/context/FitmaxContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dumbbell, ChevronRight, Camera, User, Droplets, Plus, Minus, X, Check, Scale, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { isLoaded, profile, targetMacros, currentMacros, xp, streak, waterGlasses, addWater, removeWater, setProfileAndCalculate, addXp } = useFitmax();
  const router = useRouter();

  // Check-in modal state
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weight ? profile.weight.toString() : "");
  const [checkInResult, setCheckInResult] = useState<{
    diff: number;
    advice: string;
    suggestAdjustment: boolean;
  } | null>(null);
  
  if (!isLoaded) return null; // Avoid hydration mismatch and flash of empty data

  const userName = profile.name || "Guerrero";
  const date = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });
  
  // Rank logic
  const ranks = ["Hierro I", "Hierro II", "Hierro III", "Bronce I", "Plata", "Oro", "Titán", "Leyenda Fitmax"];
  const rankIndex = Math.min(Math.floor(xp / 200), ranks.length - 1);
  const rankName = ranks[rankIndex];
  const maxXP = (rankIndex + 1) * 200;

  const macros = {
    protein: { current: currentMacros.protein, target: targetMacros.protein || 1, color: "var(--primary)" }, 
    carbs: { current: currentMacros.carbs, target: targetMacros.carbs || 1, color: "#FFA500" }, 
    fats: { current: currentMacros.fats, target: targetMacros.fats || 1, color: "#A9A9A9" }, 
  };

  return (
    <main className={styles.main}>
      
      {/* Header Section */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <p className={styles.date}>{date}</p>
          <h1 className={styles.greeting}>Hola, {userName}</h1>
        </div>
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <div className={styles.profilePic} style={{ overflow: "hidden", position: "relative", backgroundColor: "var(--bg-surface-solid)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={24} color="var(--text-muted)" />
            )}
          </div>
        </Link>
      </motion.header>

      {/* Gamification Rank Card */}
      <section>
        <RankCard 
          rankName={rankName} 
          currentXP={xp} 
          maxXP={maxXP} 
          streak={streak} 
        />
      </section>

      {/* Daily Macros Rings */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className={styles.sectionTitle}>Tus Macros de Hoy</h2>
        <div className={styles.macrosContainer}>
          <MacroRing 
            label="Proteína" 
            current={macros.protein.current} 
            total={macros.protein.target} 
            color={macros.protein.color} 
            size={90}
            strokeWidth={8}
          />
          <MacroRing 
            label="Carbos" 
            current={macros.carbs.current} 
            total={macros.carbs.target} 
            color={macros.carbs.color} 
            size={90}
            strokeWidth={8}
          />
          <MacroRing 
            label="Grasas" 
            current={macros.fats.current} 
            total={macros.fats.target} 
            color={macros.fats.color} 
            size={90}
            strokeWidth={8}
          />
        </div>
        <div className="glass-card" style={{ marginTop: "1rem", padding: "1rem", textAlign: "center", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Presupuesto Diario</span>
          <span style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold", fontFamily: "var(--font-display)" }}>
            {Math.round((macros.protein.target * 4) + (macros.carbs.target * 4) + (macros.fats.target * 9))} <span style={{ color: "var(--primary)", fontSize: "0.9rem" }}>kcal</span>
          </span>
        </div>
      </motion.section>

      {/* Water Hydration Tracker */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        style={{ marginTop: "1.5rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Droplets size={20} color="#00E5FF" /> Hidratación
          </h2>
          <span style={{ color: "#00E5FF", fontSize: "0.85rem", fontWeight: "bold" }}>
            {waterGlasses * 250} ml / 2500 ml
          </span>
        </div>

        <div className="glass-card" style={{ padding: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", border: "1px solid rgba(0, 229, 255, 0.15)" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1 }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "28px",
                  height: "36px",
                  borderRadius: "6px",
                  background: i < waterGlasses 
                    ? "linear-gradient(180deg, #00E5FF 0%, #0088FF 100%)" 
                    : "rgba(255, 255, 255, 0.05)",
                  border: i < waterGlasses ? "1px solid #00E5FF" : "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  color: "white",
                  fontWeight: "bold",
                  boxShadow: i < waterGlasses ? "0 0 10px rgba(0, 229, 255, 0.4)" : "none",
                  transition: "all 0.3s ease"
                }}
              >
                {i < waterGlasses ? "💧" : ""}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              onClick={removeWater}
              disabled={waterGlasses <= 0}
              style={{
                width: "36px",
                height: "36px",
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
              <Minus size={16} />
            </button>
            <button
              onClick={addWater}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#00E5FF",
                border: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 0 12px rgba(0, 229, 255, 0.5)"
              }}
              title="Añadir vaso (250ml)"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Workout Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ marginTop: "2rem" }}
      >
        <h2 className={styles.sectionTitle}>Tu Entrenamiento</h2>
        <div 
          onClick={() => router.push("/workout")}
          className="glass-card"
          style={{ 
            padding: "1.5rem",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: "-20px", right: "-10px", opacity: 0.05, zIndex: 0, color: "var(--text-main)" }}>
            <Dumbbell size={150} />
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontWeight: 800 }}>RUTINA DEL DÍA</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Generada por IA según tu objetivo</p>
            </div>
            <div className="glow-primary" style={{ 
              width: "40px", height: "40px", 
              backgroundColor: "var(--primary)", 
              borderRadius: "50%", 
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChevronRight color="white" size={24} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Plateau / Check-in Module */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ marginTop: "2rem", paddingBottom: "4rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Check-in Semanal</h2>
          <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "bold", background: "rgba(255, 51, 102, 0.15)", padding: "0.3rem 0.8rem", borderRadius: "12px", border: "1px solid rgba(255,51,102,0.3)" }}>Disponible Hoy</span>
        </div>
        
        <div 
          className="glass-card"
          style={{ 
            border: "1px dashed var(--primary)",
            padding: "1.5rem",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "white", fontSize: "1.1rem" }}>Evaluación de Estancamiento</h3>
            <p style={{ margin: "0 0 1.5rem 0", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Sube tus fotos y peso de la semana. La IA analizará si has llegado a un <i>Plateau</i> (estancamiento) y ajustará tus macros automáticamente si es necesario.
            </p>
            <button 
              onClick={() => {
                setNewWeight(profile.weight ? profile.weight.toString() : "");
                setCheckInResult(null);
                setShowCheckIn(true);
              }}
              style={{
                width: "100%",
                padding: "1rem",
                background: "rgba(255, 51, 102, 0.15)",
                color: "var(--primary)",
                border: "1px solid var(--primary)",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,51,102,0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 51, 102, 0.15)"}
            >
              <Scale size={20} /> Iniciar Evaluación Semanal
            </button>
          </div>
        </div>
      </motion.section>

      {/* Weekly Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "420px",
                padding: "2rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Scale size={22} color="var(--primary)" />
                  <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem" }}>Check-in Semanal</h3>
                </div>
                <button
                  onClick={() => setShowCheckIn(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {!checkInResult ? (
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                    Tu peso registrado anterior era <strong style={{ color: "white" }}>{profile.weight || 70} kg</strong>. Ingresa tu peso actual en ayunas:
                  </p>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
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
                        padding: "1rem",
                        background: "var(--bg-dark)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "1.1rem",
                        fontWeight: "bold"
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const currentW = profile.weight || 70;
                      const enteredW = parseFloat(newWeight);
                      if (!enteredW || enteredW < 30 || enteredW > 300) {
                        alert("Por favor ingresa un peso válido.");
                        return;
                      }

                      const diff = Math.round((enteredW - currentW) * 10) / 10;
                      let advice = "";
                      let suggest = false;

                      if (profile.goal === "Perder Grasa") {
                        if (diff <= -0.3) {
                          advice = `¡Gran trabajo! Has bajado ${Math.abs(diff)} kg. Tu ritmo es perfecto y seguro. No necesitas cambiar tus macros.`;
                        } else if (diff >= 0.3) {
                          advice = `Aumentaste ${diff} kg. Puede ser retención de líquidos o necesitas un ajuste calórico de -150 kcal.`;
                          suggest = true;
                        } else {
                          advice = `Tu peso se mantuvo igual (${diff} kg). Si llevas 2 semanas así, podemos ajustar -150 kcal para reactivar el déficit.`;
                          suggest = true;
                        }
                      } else if (profile.goal === "Subir de Peso Limpio") {
                        if (diff >= 0.2 && diff <= 0.6) {
                          advice = `¡Excelente hipertrofia! Subiste ${diff} kg. Estás en el rango óptimo de ganancia muscular sin acumular grasa excesiva.`;
                        } else if (diff < 0.1) {
                          advice = `Tu peso no subió (${diff} kg). Te recomendamos sumar +200 kcal diarias de carbohidratos complejos.`;
                          suggest = true;
                        } else {
                          advice = `Subiste ${diff} kg en una semana. Es un ritmo un poco rápido, vigila no acumular grasa innecesaria.`;
                        }
                      } else {
                        advice = `Diferencia de ${diff} kg. En recomposición corporal busca mantener tu fuerza en el gym mientras el peso se estabiliza.`;
                      }

                      setCheckInResult({ diff, advice, suggestAdjustment: suggest });
                    }}
                    className="glow-primary"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: "var(--primary)",
                      border: "none",
                      color: "white",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      cursor: "pointer"
                    }}
                  >
                    Evaluar Progreso
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{
                    padding: "1.2rem",
                    background: "rgba(0, 229, 255, 0.08)",
                    border: "1px solid rgba(0, 229, 255, 0.2)",
                    borderRadius: "12px",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Sparkles size={18} color="#00E5FF" />
                      <strong style={{ color: "#00E5FF" }}>Diagnóstico del Coach IA</strong>
                    </div>
                    <p style={{ margin: 0, color: "var(--text-main)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                      {checkInResult.advice}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.8rem", flexDirection: "column" }}>
                    <button
                      onClick={() => {
                        const enteredW = parseFloat(newWeight);
                        setProfileAndCalculate({
                          ...profile,
                          weight: enteredW
                        });
                        addXp(100);
                        setShowCheckIn(false);
                        alert("¡Check-in completado! +100 XP ganados.");
                      }}
                      style={{
                        padding: "1rem",
                        background: "var(--primary)",
                        border: "none",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Guardar Nuevo Peso ({newWeight} kg)
                    </button>
                    <button
                      onClick={() => setShowCheckIn(false)}
                      style={{
                        padding: "0.8rem",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        borderRadius: "12px",
                        cursor: "pointer"
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
