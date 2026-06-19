"use client";

import { motion } from "framer-motion";
import styles from "./diet.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";
import { Bot, Wand2, ChefHat, ShoppingCart } from "lucide-react";

export default function DietCenter() {
  const { isLoaded, customDiet } = useFitmax();
  const router = useRouter();

  if (!isLoaded) return null;

  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ paddingBottom: "6rem" }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Nutrición</h1>
      </header>

      {!customDiet ? (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", textAlign: "center", marginTop: "2rem" }}>
          <Bot size={64} color="var(--primary)" style={{ marginBottom: "1.5rem", opacity: 0.8 }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "white" }}>Sin Plan Activo</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "2rem" }}>
            La IA necesita estructurar tu menú diario basándose en tus macros y presupuesto.
          </p>
          <button 
            className="glow-primary"
            onClick={() => router.push("/diet/builder")}
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
          >
            Construir Mi Dieta
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-main)", fontFamily: "var(--font-display)" }}>Plan Activo</span>
              <span style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: "bold" }}>~{customDiet.totalCalories} kcal (Nivel {customDiet.budget})</span>
            </div>
            <button 
              onClick={() => router.push("/diet/builder")}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", fontSize: "0.9rem", background: "rgba(255, 51, 102, 0.1)", border: "1px solid rgba(255, 51, 102, 0.3)", color: "var(--primary)", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}
            >
              <Wand2 size={16} /> Regenerar
            </button>
          </div>

          <div className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(24, 24, 27, 0.6))", borderLeft: "4px solid #00E5FF", padding: "1.2rem", marginBottom: "1.5rem" }}>
            <ChefHat size={24} color="#00E5FF" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              <strong style={{ color: "white" }}>Generado por IA:</strong> Tus porciones y comidas han sido calculadas inteligentemente para cuadrar tus requerimientos exactos de hipertrofia o recomposición.
            </p>
          </div>

          <div style={{ marginTop: "1rem" }}>
            {customDiet.meals.map((meal: any, index: number) => (
              <div key={index} className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", margin: 0, color: "white", fontFamily: "var(--font-display)" }}>{meal.name}</h3>
                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                    <span style={{ background: "rgba(255,51,102,0.1)", color: "var(--primary)", padding: "0.3rem 0.6rem", borderRadius: "8px", border: "1px solid rgba(255,51,102,0.2)" }}>{meal.macros.protein}g P</span>
                    <span style={{ background: "rgba(0,229,255,0.1)", color: "#00E5FF", padding: "0.3rem 0.6rem", borderRadius: "8px", border: "1px solid rgba(0,229,255,0.2)" }}>{meal.macros.carbs}g C</span>
                    <span style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", padding: "0.3rem 0.6rem", borderRadius: "8px", border: "1px solid rgba(255,215,0,0.2)" }}>{meal.macros.fats}g G</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {meal.foods.map((food: any, fIndex: number) => (
                    <div key={fIndex} style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)" }}>
                      <span style={{ fontSize: "2rem", background: "var(--bg-surface)", padding: "0.5rem", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", width: "50px", height: "50px" }}>{food.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "1rem", color: "white" }}>{food.name}</p>
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>Porción exacta: {food.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => router.push("/grocery")}
            style={{ marginBottom: "2rem", background: "var(--text-main)", color: "var(--bg-dark)", width: "100%", padding: "1.2rem", borderRadius: "12px", fontWeight: "800", fontSize: "1rem", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem", transition: "all 0.2s" }}
          >
            <ShoppingCart size={20} /> Ver Lista de Súper (Generada)
          </button>
        </>
      )}
    </motion.main>
  );
}
