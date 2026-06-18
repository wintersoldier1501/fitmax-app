"use client";

import { motion } from "framer-motion";
import styles from "./diet.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";

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
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Nutrición</h1>
      </header>

      {!customDiet ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🤖</span>
          <h2 className={styles.emptyTitle}>Sin Plan Activo</h2>
          <p className={styles.emptyDesc}>
            La IA necesita estructurar tu menú diario basándose en tus macros y presupuesto.
          </p>
          <button 
            className={styles.buildButton}
            onClick={() => router.push("/diet/builder")}
          >
            Construir Mi Dieta
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>Plan Activo</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>~{customDiet.totalCalories} kcal (Nivel {customDiet.budget})</span>
            </div>
            <button 
              className={styles.buildButton}
              onClick={() => router.push("/diet/builder")}
              style={{ width: "auto", padding: "0.5rem 1rem", margin: 0, fontSize: "0.9rem", background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)" }}
            >
              🪄 Regenerar
            </button>
          </div>

          <div style={{ backgroundColor: "rgba(0, 229, 255, 0.1)", borderLeft: "4px solid #00E5FF", padding: "1rem", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            👨‍🍳 <strong>Generado por IA:</strong> Tus porciones y comidas han sido calculadas inteligentemente para cuadrar tus requerimientos exactos de hipertrofia o recomposición.
          </div>

          <div className={styles.dietCard} style={{ marginTop: "1rem", background: "transparent", padding: 0 }}>
            {customDiet.meals.map((meal: any, index: number) => (
              <div key={index} className={styles.mealSection} style={{ background: "var(--bg-surface)", padding: "1.5rem", borderRadius: "16px", marginBottom: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className={styles.mealHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                  <h3 className={styles.mealName} style={{ fontSize: "1.2rem", margin: 0 }}>{meal.name}</h3>
                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                    <span style={{ background: "rgba(255,69,0,0.1)", color: "var(--primary)", padding: "0.2rem 0.5rem", borderRadius: "8px" }}>{meal.macros.protein}g P</span>
                    <span style={{ background: "rgba(0,229,255,0.1)", color: "#00E5FF", padding: "0.2rem 0.5rem", borderRadius: "8px" }}>{meal.macros.carbs}g C</span>
                    <span style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", padding: "0.2rem 0.5rem", borderRadius: "8px" }}>{meal.macros.fats}g G</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {meal.foods.map((food: any, fIndex: number) => (
                    <div key={fIndex} className={styles.foodItem} style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)" }}>
                      <div className={styles.foodInfo} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className={styles.foodIcon} style={{ fontSize: "2rem", background: "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "12px" }}>{food.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p className={styles.foodName} style={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}>{food.name}</p>
                          <p className={styles.foodAmount} style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>Porción exacta: {food.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            className={styles.rebuildButton}
            onClick={() => router.push("/grocery")}
            style={{ marginBottom: "2rem", backgroundColor: "white", color: "black", width: "100%", padding: "1rem", borderRadius: "12px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
          >
            🛒 Ver Lista de Súper (Generada)
          </button>
        </>
      )}
    </motion.main>
  );
}
