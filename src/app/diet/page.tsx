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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={styles.budgetBadge}>Presupuesto {customDiet.budget}</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>~{customDiet.totalCalories} kcal</span>
          </div>

          <div style={{ backgroundColor: "rgba(0, 229, 255, 0.1)", borderLeft: "4px solid #00E5FF", padding: "1rem", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "1rem" }}>
            💡 <strong>¿Porciones altas?</strong> La IA calcula la cantidad exacta para que cumplas tus macros solo con ese alimento. Si te tocan 11 huevos, es porque necesitas muchísima proteína y los huevos son tu única fuente en esa comida.
          </div>

          <div className={styles.dietCard} style={{ marginTop: "1rem" }}>
            {customDiet.meals.map((meal: any, index: number) => (
              <div key={index} className={styles.mealSection}>
                <div className={styles.mealHeader}>
                  <h3 className={styles.mealName}>{meal.name}</h3>
                  <span className={styles.mealMacros}>
                    {meal.macros.protein}g P | {meal.macros.carbs}g C | {meal.macros.fats}g G
                  </span>
                </div>
                
                {meal.foods.map((food: any, fIndex: number) => (
                  <div key={fIndex} className={styles.foodItem}>
                    <div className={styles.foodInfo}>
                      <span className={styles.foodIcon}>{food.icon}</span>
                      <div>
                        <p className={styles.foodName}>{food.name}</p>
                        <p className={styles.foodAmount}>{food.amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button 
            className={styles.rebuildButton}
            onClick={() => router.push("/grocery")}
            style={{ marginBottom: "1rem", backgroundColor: "white", color: "black" }}
          >
            🛒 Ver Lista de Súper (Semanal)
          </button>

          <button 
            className={styles.rebuildButton}
            onClick={() => router.push("/diet/builder")}
          >
            🔄 Recalcular Dieta
          </button>
        </>
      )}
    </motion.main>
  );
}
