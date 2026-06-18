"use client";

import { motion } from "framer-motion";
import styles from "./log.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { FoodLog } from "@/context/FitmaxContext";

export default function DiaryLog() {
  const { isLoaded, loggedFoods, resetProgress } = useFitmax();

  if (!isLoaded) return null;

  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Diario</h1>
        {loggedFoods.length > 0 && (
          <button className={styles.clearButton} onClick={resetProgress}>
            Reiniciar Día
          </button>
        )}
      </header>

      {/* Daily Recovery Module */}
      <section className={styles.recoverySection} style={{
        background: "var(--bg-surface)",
        padding: "1.5rem",
        borderRadius: "16px",
        marginBottom: "2rem",
        border: "1px solid var(--border)"
      }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "white" }}>🧠 Reporte de Recuperación</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Evalúa tu fatiga y sueño. El Coach usará esta data para prevenir sobreentrenamiento.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Calidad de Sueño (1-10)</label>
            <input type="number" min="1" max="10" placeholder="Ej. 8" style={{ width: "100%", background: "var(--bg-dark)", border: "1px solid var(--border)", color: "white", padding: "0.8rem", borderRadius: "8px" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Nivel de Fatiga (1-10)</label>
            <input type="number" min="1" max="10" placeholder="Ej. 3" style={{ width: "100%", background: "var(--bg-dark)", border: "1px solid var(--border)", color: "white", padding: "0.8rem", borderRadius: "8px" }} />
          </div>
        </div>
        
        <textarea 
          placeholder="¿Cómo te sentiste hoy corriendo o levantando pesas?"
          style={{
            width: "100%",
            background: "var(--bg-dark)",
            border: "1px solid var(--border)",
            color: "white",
            padding: "0.8rem",
            borderRadius: "8px",
            resize: "none",
            height: "80px",
            marginBottom: "1rem"
          }}
        />
        <button style={{
          width: "100%",
          padding: "0.8rem",
          background: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer"
        }}>Guardar Nota Diaria</button>
      </section>

      {loggedFoods.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🍽️</span>
          <h2>Aún no has comido nada</h2>
          <p>Usa el Escáner Láser para registrar tus comidas con la hora exacta (Nutrient Timing).</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {loggedFoods.map((food, index) => (
            <motion.div 
              key={food.id}
              className={styles.foodCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.timelineDot} />
              
              <div className={styles.foodImageContainer}>
                {food.image ? (
                  <img src={food.image} alt={food.name} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                    🥩
                  </div>
                )}
              </div>

              <div className={styles.foodInfo}>
                <div className={styles.foodHeader}>
                  <h3 className={styles.foodName}>{food.name}</h3>
                  <span className={styles.foodTime}>{food.time}</span>
                </div>
                
                <div className={styles.macrosRow}>
                  <div className={styles.macroItem}>
                    <span className={styles.macroValue} style={{color: "var(--primary)"}}>{food.macros.protein}g</span>
                    <span className={styles.macroLabel}>Pro</span>
                  </div>
                  <div className={styles.macroItem}>
                    <span className={styles.macroValue} style={{color: "#00E5FF"}}>{food.macros.carbs}g</span>
                    <span className={styles.macroLabel}>Car</span>
                  </div>
                  <div className={styles.macroItem}>
                    <span className={styles.macroValue} style={{color: "#FFD700"}}>{food.macros.fats}g</span>
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
    </motion.main>
  );
}
