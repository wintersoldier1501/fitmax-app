"use client";

import { motion } from "framer-motion";
import styles from "./dashboard.module.css";
import { RankCard } from "@/components/RankCard";
import { MacroRing } from "@/components/MacroRing";
import { useFitmax } from "@/context/FitmaxContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { isLoaded, profile, targetMacros, currentMacros, xp, streak } = useFitmax();
  const router = useRouter();
  
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
          <div className={styles.profilePic} style={{ overflow: "hidden", position: "relative" }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              "👤"
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
          style={{ 
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "1.5rem",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: "-20px", right: "-10px", fontSize: "6rem", opacity: 0.1, zIndex: 0 }}>
            💪
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontWeight: 800 }}>RUTINA DEL DÍA</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Generada por IA según tu objetivo</p>
            </div>
            <div style={{ 
              width: "40px", height: "40px", 
              backgroundColor: "var(--primary)", 
              borderRadius: "50%", 
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 10px rgba(255, 69, 0, 0.4)"
            }}>
              <span style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold" }}>➔</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Plateau / Check-in Module */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ marginTop: "2rem", paddingBottom: "2rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Check-in Semanal</h2>
          <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "bold", background: "rgba(255, 69, 0, 0.2)", padding: "0.2rem 0.6rem", borderRadius: "12px" }}>Disponible Hoy</span>
        </div>
        
        <div style={{ 
            backgroundColor: "var(--bg-surface)",
            border: "1px dashed var(--primary)",
            borderRadius: "16px",
            padding: "1.5rem",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "white", fontSize: "1.1rem" }}>Evaluación de Estancamiento</h3>
            <p style={{ margin: "0 0 1rem 0", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.4 }}>
              Sube tus fotos y peso de la semana. La IA analizará si has llegado a un <i>Plateau</i> (estancamiento) y ajustará tus macros automáticamente si es necesario.
            </p>
            <button style={{
              width: "100%",
              padding: "0.8rem",
              background: "transparent",
              color: "var(--primary)",
              border: "2px solid var(--primary)",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              📸 Iniciar Evaluación
            </button>
          </div>
        </div>
      </motion.section>

    </main>
  );
}
