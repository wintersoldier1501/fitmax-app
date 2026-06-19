"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import styles from "./log.module.css";
import { useFitmax, FoodLog } from "@/context/FitmaxContext";
import { Search, Loader2 } from "lucide-react";

export default function DiaryLog() {
  const { isLoaded, loggedFoods, resetProgress, addFoodLog } = useFitmax();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const confirmAddFood = () => {
    if (selectedFood) {
      addFoodLog({
        id: Date.now().toString(),
        name: selectedFood.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        macros: selectedFood.macros,
        image: selectedFood.image
      });
      setSelectedFood(null);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

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

      {/* Real Food Search */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ position: "relative", display: "flex", gap: "0.5rem" }}>
          <input 
            type="text" 
            placeholder="Buscar alimento real (ej. Atún, Avena...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ 
              flex: 1, 
              padding: "1rem 1rem 1rem 3rem", 
              background: "var(--bg-surface)", 
              border: "1px solid var(--border)", 
              color: "white", 
              borderRadius: "16px",
              fontSize: "1rem" 
            }} 
          />
          <Search size={20} color="var(--text-muted)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
          <button onClick={handleSearch} disabled={isSearching} style={{ padding: "0 1.5rem", background: "var(--primary)", color: "white", borderRadius: "16px", fontWeight: "bold" }}>
            {isSearching ? <Loader2 size={20} className="animate-spin" /> : "Buscar"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "1rem", background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden" }}
          >
            {searchResults.map((food) => (
              <div 
                key={food.id} 
                onClick={() => setSelectedFood(food)}
                style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {food.image ? (
                  <img src={food.image} alt={food.name} style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "50px", height: "50px", borderRadius: "8px", background: "var(--bg-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🍽️</div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: "white", fontSize: "0.95rem" }}>{food.name}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{food.brand} • {food.macros.calories} kcal / 100g</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "bold" }}>{food.macros.protein}g Pro</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </section>

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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                {selectedFood.image && <img src={selectedFood.image} style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }} />}
                <div>
                  <h3 style={{ color: "white", fontSize: "1.1rem" }}>{selectedFood.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{selectedFood.brand} • 100g</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "12px" }}>
                <div style={{ textAlign: "center" }}><p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Pro</p><p style={{ fontWeight: 800, color: "var(--primary)" }}>{selectedFood.macros.protein}g</p></div>
                <div style={{ textAlign: "center" }}><p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Car</p><p style={{ fontWeight: 800, color: "#00E5FF" }}>{selectedFood.macros.carbs}g</p></div>
                <div style={{ textAlign: "center" }}><p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Gra</p><p style={{ fontWeight: 800, color: "#FFD700" }}>{selectedFood.macros.fats}g</p></div>
                <div style={{ textAlign: "center" }}><p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Kcal</p><p style={{ fontWeight: 800, color: "white" }}>{selectedFood.macros.calories}</p></div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={() => setSelectedFood(null)} style={{ flex: 1, padding: "1rem", background: "transparent", border: "1px solid var(--border)", color: "white", borderRadius: "12px", cursor: "pointer" }}>Cancelar</button>
                <button onClick={confirmAddFood} className="glow-primary" style={{ flex: 1, padding: "1rem", background: "var(--primary)", border: "none", color: "white", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>Añadir al Diario</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.main>
  );
}
