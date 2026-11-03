"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./diet.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";
import { Bot, Wand2, ChefHat, ShoppingCart, Sparkles, X, Clock, Plus, Check, Loader2, Utensils, Flame } from "lucide-react";

const quickTags = [
  "🥚 Huevos", "🍗 Pollo", "🐟 Atún", "🍚 Arroz", 
  "🥑 Aguacate", "🧀 Queso", "🍞 Pan", "🥣 Avena", 
  "🌮 Tortillas", "🍅 Jitomate", "🥛 Leche", "🍌 Plátano"
];

export default function DietCenter() {
  const { isLoaded, customDiet, currentMacros, targetMacros, profile, addFoodLog } = useFitmax();
  const router = useRouter();

  // Chef IA State
  const [showChefModal, setShowChefModal] = useState(false);
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [prepTime, setPrepTime] = useState("10 min");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [isLogged, setIsLogged] = useState(false);

  if (!isLoaded) return null;

  const pRemain = Math.max(0, (targetMacros.protein || 0) - (currentMacros.protein || 0));
  const cRemain = Math.max(0, (targetMacros.carbs || 0) - (currentMacros.carbs || 0));
  const fRemain = Math.max(0, (targetMacros.fats || 0) - (currentMacros.fats || 0));
  const calRemain = Math.max(0, (targetMacros.calories || 0) - (currentMacros.calories || 0));

  const addTag = (tagText: string) => {
    const clean = tagText.replace(/^[^\w\s]+/, "").trim(); // Remove leading emoji
    if (!ingredientsInput.includes(clean)) {
      setIngredientsInput(prev => prev ? `${prev}, ${clean}` : clean);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!ingredientsInput.trim()) {
      alert("Por favor selecciona o escribe los ingredientes que tienes en casa.");
      return;
    }

    setIsGenerating(true);
    setRecipe(null);
    setIsLogged(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    try {
      const res = await fetch("/api/chef", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredientsInput,
          profile,
          remainingMacros: {
            protein: pRemain,
            carbs: cRemain,
            fats: fRemain,
            calories: calRemain
          },
          prepTime
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.recipe) {
        setRecipe(data.recipe);
      } else {
        throw new Error(data.error || "No recipe returned");
      }
    } catch (e: any) {
      console.warn("Chef fetch issue, creating instant backup recipe...", e);
      clearTimeout(timeoutId);
      // Instant Client-side Fallback so the user NEVER hangs!
      const items = ingredientsInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      const p = Math.max(25, Math.round(pRemain * 0.5));
      const c = Math.max(30, Math.round(cRemain * 0.5));
      const f = Math.max(10, Math.round(fRemain * 0.5));
      setRecipe({
        title: `Platillo Fitness Express (${items.slice(0, 2).join(" & ") || "Ingredientes Caseros"})`,
        prepTime: prepTime || "10 min",
        difficulty: "Fácil",
        ingredientsWithPortions: [
          `Base seleccionada: ${ingredientsInput}`,
          "Porción proteica principal (huevo, atún o pollo a tu elección)",
          "Acompañamiento de carbohidratos (tortillas, avena o arroz)",
          "Grasas saludables (aguacate o aceite de oliva)"
        ],
        steps: [
          "Calienta una sartén antiadherente a fuego medio con unas gotas de aceite.",
          "Cocina primero la fuente de proteína hasta que esté en su punto jugoso.",
          "Agrega los demás ingredientes y saltea durante 3 a 5 minutos a fuego medio.",
          "Sirve caliente y disfruta una comida balanceada."
        ],
        macros: {
          protein: p,
          carbs: c,
          fats: f,
          calories: (p * 4) + (c * 4) + (f * 9)
        },
        chefTip: "Usa hierbas aromáticas y especias (ajo en polvo, orégano, pimienta) para añadir gran sabor sin sumar calorías."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogRecipe = () => {
    if (recipe) {
      addFoodLog({
        id: Date.now().toString(),
        name: recipe.title,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        macros: {
          protein: Number(recipe.macros?.protein) || 0,
          carbs: Number(recipe.macros?.carbs) || 0,
          fats: Number(recipe.macros?.fats) || 0,
          calories: Number(recipe.macros?.calories) || 0
        }
      });
      setIsLogged(true);
    }
  };

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

      {/* Chef IA Hero Banner */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setShowChefModal(true)}
        className="glass-card" 
        style={{ 
          background: "linear-gradient(135deg, rgba(255, 51, 102, 0.18), rgba(0, 229, 255, 0.12))", 
          border: "1px solid rgba(255, 51, 102, 0.4)",
          padding: "1.2rem",
          borderRadius: "16px",
          marginBottom: "1.5rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(255, 51, 102, 0.15)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #FF3366, #FF6B8B)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            boxShadow: "0 0 16px rgba(255, 51, 102, 0.4)"
          }}>
            🍳
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>
                Chef IA
              </h3>
              <span style={{ fontSize: "0.7rem", background: "rgba(0, 229, 255, 0.2)", color: "#00E5FF", border: "1px solid rgba(0, 229, 255, 0.4)", padding: "0.15rem 0.4rem", borderRadius: "6px", fontWeight: "bold" }}>
                NUEVO
              </span>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              ¿Qué cocino hoy con lo que tengo en casa?
            </p>
          </div>
        </div>
        <div style={{ 
          background: "var(--primary)", 
          color: "white", 
          borderRadius: "10px", 
          padding: "0.5rem 0.9rem", 
          fontWeight: "bold", 
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem"
        }}>
          <Sparkles size={14} /> Abrir
        </div>
      </motion.div>

      {!customDiet ? (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", textAlign: "center", marginTop: "1rem" }}>
          <Bot size={64} color="var(--primary)" style={{ marginBottom: "1.5rem", opacity: 0.8 }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "white" }}>Sin Plan Fijo Activo</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "2rem" }}>
            Puedes usar el Chef IA arriba para recetas rápidas o construir tu plan de comidas semanal.
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

      {/* Chef IA Interactive Modal */}
      <AnimatePresence>
        {showChefModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
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
                maxWidth: "460px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "1.8rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "24px"
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.8rem" }}>🍳</span>
                  <div>
                    <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontFamily: "var(--font-display)" }}>
                      Chef IA
                    </h3>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      Recetas a la medida de tus macros restantes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChefModal(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.4rem" }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Remaining Macros Card */}
              <div style={{
                background: "rgba(0, 229, 255, 0.08)",
                border: "1px solid rgba(0, 229, 255, 0.2)",
                padding: "0.9rem 1rem",
                borderRadius: "14px",
                marginBottom: "1.2rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Macros que te faltan hoy:
                  </span>
                  <span style={{ color: "#00E5FF", fontWeight: "bold", fontSize: "0.85rem" }}>
                    ~{calRemain} kcal
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.8rem", fontSize: "0.85rem", fontWeight: "bold" }}>
                  <span style={{ color: "var(--primary)" }}>🍗 {pRemain}g Proteína</span>
                  <span style={{ color: "#FFA500" }}>🍚 {cRemain}g Carbos</span>
                  <span style={{ color: "#A9A9A9" }}>🥑 {fRemain}g Grasas</span>
                </div>
              </div>

              {!recipe ? (
                <div>
                  {/* Quick Ingredient Tags */}
                  <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    Toca los ingredientes que tengas en casa:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.2rem" }}>
                    {quickTags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => addTag(tag)}
                        style={{
                          background: ingredientsInput.includes(tag.replace(/^[^\w\s]+/, "").trim()) 
                            ? "var(--primary)" 
                            : "rgba(255, 255, 255, 0.06)",
                          border: "1px solid var(--border)",
                          color: "white",
                          borderRadius: "10px",
                          padding: "0.4rem 0.7rem",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Free text input */}
                  <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    O escribe lo que tienes (separado por comas):
                  </label>
                  <textarea
                    placeholder="Ej. 3 huevos, 1 lata de atún, arroz cocido, jitomate, cebolla..."
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      background: "var(--bg-dark)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "0.95rem",
                      marginBottom: "1.2rem",
                      resize: "none"
                    }}
                  />

                  {/* Prep Time Selector */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Tiempo disponible:</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {["5-10 min", "15-20 min"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setPrepTime(t)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            background: prepTime === t ? "rgba(0, 229, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
                            border: prepTime === t ? "1px solid #00E5FF" : "1px solid var(--border)",
                            color: prepTime === t ? "#00E5FF" : "var(--text-muted)",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          ⚡ {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleGenerateRecipe}
                    disabled={isGenerating || !ingredientsInput.trim()}
                    className="glow-primary"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: isGenerating ? "var(--bg-surface-solid)" : "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "14px",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      cursor: isGenerating ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem"
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Creando Receta Inteligente...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Crear Receta a la Medida
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Generated Recipe View */
                <div>
                  <div style={{ marginBottom: "1.2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", background: "rgba(0, 229, 255, 0.15)", color: "#00E5FF", border: "1px solid rgba(0, 229, 255, 0.3)", padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: "bold" }}>
                        ⏱️ {recipe.prepTime || "10 min"}
                      </span>
                      <span style={{ fontSize: "0.75rem", background: "rgba(255, 215, 0, 0.15)", color: "#FFD700", border: "1px solid rgba(255, 215, 0, 0.3)", padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: "bold" }}>
                        🔥 {recipe.macros?.calories || 0} kcal
                      </span>
                      <span style={{ fontSize: "0.75rem", background: "rgba(255, 51, 102, 0.15)", color: "var(--primary)", border: "1px solid rgba(255, 51, 102, 0.3)", padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: "bold" }}>
                        💪 {recipe.macros?.protein || 0}g Proteína
                      </span>
                    </div>

                    <h2 style={{ color: "white", fontSize: "1.3rem", margin: "0.5rem 0", fontFamily: "var(--font-display)" }}>
                      {recipe.title}
                    </h2>

                    {/* Macro Details Row */}
                    <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.8rem", background: "rgba(0,0,0,0.3)", padding: "0.8rem", borderRadius: "10px", justifyContent: "space-around" }}>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", color: "var(--primary)", fontWeight: "bold", fontSize: "1rem" }}>{recipe.macros?.protein || 0}g</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Proteína</span>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", color: "#FFA500", fontWeight: "bold", fontSize: "1rem" }}>{recipe.macros?.carbs || 0}g</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Carbos</span>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", color: "#A9A9A9", fontWeight: "bold", fontSize: "1rem" }}>{recipe.macros?.fats || 0}g</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Grasas</span>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients with portions */}
                  <div style={{ marginBottom: "1.2rem" }}>
                    <h4 style={{ color: "white", fontSize: "0.95rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Utensils size={16} color="var(--primary)" /> Ingredientes y Porciones exactas:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                      {recipe.ingredientsWithPortions?.map((ing: string, i: number) => (
                        <li key={i} style={{ marginBottom: "0.3rem" }}>
                          <span style={{ color: "white" }}>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div style={{ marginBottom: "1.2rem" }}>
                    <h4 style={{ color: "white", fontSize: "0.95rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Clock size={16} color="#00E5FF" /> Preparación paso a paso:
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                      {recipe.steps?.map((step: string, i: number) => (
                        <li key={i} style={{ marginBottom: "0.4rem" }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Chef Tip */}
                  {recipe.chefTip && (
                    <div style={{
                      background: "rgba(255, 215, 0, 0.08)",
                      border: "1px solid rgba(255, 215, 0, 0.25)",
                      padding: "0.8rem 1rem",
                      borderRadius: "12px",
                      marginBottom: "1.5rem",
                      fontSize: "0.85rem",
                      color: "var(--text-main)",
                      lineHeight: 1.5
                    }}>
                      <strong style={{ color: "#FFD700" }}>💡 Tip del Chef Fitmax: </strong>
                      {recipe.chefTip}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.8rem", flexDirection: "column" }}>
                    <button
                      onClick={handleLogRecipe}
                      disabled={isLogged}
                      style={{
                        padding: "1rem",
                        background: isLogged ? "rgba(0, 229, 255, 0.2)" : "var(--primary)",
                        border: isLogged ? "1px solid #00E5FF" : "none",
                        color: isLogged ? "#00E5FF" : "white",
                        borderRadius: "14px",
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                        cursor: isLogged ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem"
                      }}
                    >
                      {isLogged ? (
                        <>
                          <Check size={18} /> ¡Añadida a tus Macros de Hoy! (+50 XP)
                        </>
                      ) : (
                        <>
                          <Plus size={18} /> Añadir esta comida a mi Diario de hoy
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setRecipe(null)}
                      style={{
                        padding: "0.8rem",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        borderRadius: "12px",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      Probar con otros ingredientes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

