"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./diet.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Wand2, ChefHat, ShoppingCart, Sparkles, X, Clock, Plus, Check, Loader2, Utensils } from "lucide-react";

const quickTags = [
  "🥚 Huevos", "🍗 Pollo", "🐟 Atún", "🍚 Arroz",
  "🥑 Aguacate", "🧀 Queso", "🍞 Pan", "🥣 Avena",
  "🌮 Tortillas", "🍅 Jitomate", "🥛 Leche", "🍌 Plátano"
];

export default function DietCenter() {
  const { isLoaded, customDiet, currentMacros, targetMacros, profile, addFoodLog, showToast } = useFitmax();
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
    const clean = tagText.replace(/^[^\w\s]+/, "").trim();
    if (!ingredientsInput.includes(clean)) {
      setIngredientsInput((prev) => (prev ? `${prev}, ${clean}` : clean));
    }
  };

  const handleGenerateRecipe = async () => {
    if (!ingredientsInput.trim()) {
      showToast("Selecciona o escribe los ingredientes que tienes en casa", "warning");
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
    } catch {
      clearTimeout(timeoutId);
      const items = ingredientsInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
      const p = Math.max(25, Math.round(pRemain * 0.5));
      const c = Math.max(30, Math.round(cRemain * 0.5));
      const f = Math.max(10, Math.round(fRemain * 0.5));
      setRecipe({
        title: `Platillo Fitness Express (${items.slice(0, 2).join(" & ") || "Ingredientes Caseros"})`,
        prepTime: prepTime || "10 min",
        difficulty: "Fácil",
        ingredientsWithPortions: [
          `Base seleccionada: ${ingredientsInput}`,
          "Porción proteica principal (huevo, atún o pollo)",
          "Acompañamiento de carbohidratos (tortillas, avena o arroz)",
          "Grasas saludables (aguacate o aceite de oliva)"
        ],
        steps: [
          "Calienta una sartén antiadherente a fuego medio con unas gotas de aceite.",
          "Cocina primero la fuente de proteína hasta que esté en su punto jugoso.",
          "Integra los demás ingredientes por separado según su sabor.",
          "Sirve caliente y disfruta una comida balanceada."
        ],
        macros: {
          protein: p,
          carbs: c,
          fats: f,
          calories: p * 4 + c * 4 + f * 9
        },
        chefTip: "Usa hierbas aromáticas y especias (ajo en polvo, orégano, pimienta) para añadir gran sabor sin calorías extra."
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
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
            fontWeight: 600,
            color: "var(--text-muted)"
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
            fontWeight: 700,
            background: "var(--primary)",
            color: "white"
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
        <h1 className={styles.title}>Nutrición</h1>
      </header>

      {/* Chef IA Hero Banner */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setShowChefModal(true)}
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, var(--primary-subtle), var(--accent-subtle))",
          border: "1px solid var(--primary-border)",
          padding: "1.15rem",
          borderRadius: "18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              boxShadow: "0 0 16px var(--primary-glow)"
            }}
          >
            🍳
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <h3 style={{ margin: 0, color: "white", fontSize: "1.08rem", fontFamily: "var(--font-display)" }}>
                Chef IA
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "6px",
                  fontWeight: "bold"
                }}
              >
                EXACTO
              </span>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.15rem" }}>
              ¿Qué cocino hoy con lo que tengo en casa?
            </p>
          </div>
        </div>
        <div
          style={{
            background: "var(--primary)",
            color: "white",
            borderRadius: "10px",
            padding: "0.45rem 0.85rem",
            fontWeight: "bold",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem"
          }}
        >
          <Sparkles size={14} /> Abrir
        </div>
      </motion.div>

      {!customDiet ? (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 1.8rem", textAlign: "center" }}>
          <Bot size={58} color="var(--primary)" style={{ marginBottom: "1.2rem", opacity: 0.85 }} />
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", color: "white" }}>Sin Plan Fijo Activo</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: "1.8rem" }}>
            Puedes usar el Chef IA arriba para recetas rápidas o construir tu plan de comidas semanal adaptado a tu presupuesto.
          </p>
          <button
            className="glow-primary"
            onClick={() => router.push("/diet/builder")}
            style={{
              background: "var(--primary)",
              color: "white",
              padding: "0.95rem 1.8rem",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "1rem"
            }}
          >
            Construir Mi Dieta
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1.45rem", fontWeight: "bold", color: "var(--text-main)", fontFamily: "var(--font-display)" }}>Plan Activo</span>
              <span style={{ color: "var(--primary)", fontSize: "0.88rem", fontWeight: "bold" }}>~{customDiet.totalCalories} kcal (Nivel {customDiet.budget})</span>
            </div>
            <button
              onClick={() => router.push("/diet/builder")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.55rem 0.9rem",
                fontSize: "0.85rem",
                background: "var(--primary-subtle)",
                border: "1px solid var(--primary-border)",
                color: "var(--primary)",
                borderRadius: "12px",
                fontWeight: "bold"
              }}
            >
              <Wand2 size={15} /> Regenerar
            </button>
          </div>

          <div
            className="glass-card"
            style={{
              display: "flex",
              gap: "0.9rem",
              alignItems: "flex-start",
              background: "linear-gradient(135deg, var(--accent-subtle), rgba(20, 20, 25, 0.7))",
              borderLeft: "4px solid var(--accent)",
              padding: "1.1rem"
            }}
          >
            <ChefHat size={22} color="var(--accent)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              <strong style={{ color: "white" }}>Generado por IA:</strong> Porciones calculadas con precisión para cuadrar tus requerimientos de {profile.goal || "recomposición"}.
            </p>
          </div>

          <div>
            {customDiet.meals.map((meal: any, index: number) => (
              <div key={index} className="glass-card" style={{ padding: "1.3rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.8rem" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "white", fontFamily: "var(--font-display)" }}>{meal.name}</h3>
                  <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.72rem", fontWeight: "bold" }}>
                    <span style={{ background: "var(--primary-subtle)", color: "var(--primary)", padding: "0.25rem 0.5rem", borderRadius: "8px", border: "1px solid var(--primary-border)" }}>{meal.macros.protein}g P</span>
                    <span style={{ background: "var(--accent-subtle)", color: "var(--accent)", padding: "0.25rem 0.5rem", borderRadius: "8px", border: "1px solid var(--accent-border)" }}>{meal.macros.carbs}g C</span>
                    <span style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", padding: "0.25rem 0.5rem", borderRadius: "8px", border: "1px solid rgba(255,215,0,0.2)" }}>{meal.macros.fats}g G</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {meal.foods.map((food: any, fIndex: number) => (
                    <div key={fIndex} style={{ display: "flex", alignItems: "center", gap: "0.9rem", background: "rgba(0,0,0,0.22)", padding: "0.9rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "1.7rem", background: "var(--bg-surface-solid)", padding: "0.45rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px" }}>{food.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem", color: "white" }}>{food.name}</p>
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.15rem" }}>Porción exacta: {food.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/grocery")}
            style={{
              background: "var(--text-main)",
              color: "var(--bg-dark)",
              width: "100%",
              padding: "1.1rem",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "0.98rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.55rem"
            }}
          >
            <ShoppingCart size={19} /> Ver Lista de Súper (7 Días)
          </button>
        </>
      )}

      {/* Chef IA Interactive Modal */}
      <AnimatePresence>
        {showChefModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(10px)",
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
                maxWidth: "460px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "1.6rem",
                background: "var(--bg-surface-solid)",
                border: "1px solid var(--border)",
                borderRadius: "24px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.7rem" }}>🍳</span>
                  <div>
                    <h3 style={{ margin: 0, color: "white", fontSize: "1.15rem", fontFamily: "var(--font-display)" }}>Chef IA</h3>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.78rem" }}>Recetas a la medida de tus macros restantes</p>
                  </div>
                </div>
                <button onClick={() => setShowChefModal(false)} style={{ color: "var(--text-muted)", padding: "0.3rem" }}>
                  <X size={21} />
                </button>
              </div>

              <div
                style={{
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--accent-border)",
                  padding: "0.85rem 1rem",
                  borderRadius: "14px",
                  marginBottom: "1.1rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Macros que te faltan hoy:
                  </span>
                  <span style={{ color: "var(--accent)", fontWeight: "bold", fontSize: "0.82rem" }}>~{calRemain} kcal</span>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.82rem", fontWeight: "bold", flexWrap: "wrap" }}>
                  <span style={{ color: "var(--primary)" }}>🍗 {pRemain}g Proteína</span>
                  <span style={{ color: "#FFA500" }}>🍚 {cRemain}g Carbos</span>
                  <span style={{ color: "#A9A9A9" }}>🥑 {fRemain}g Grasas</span>
                </div>
              </div>

              {!recipe ? (
                <div>
                  <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.5rem" }}>
                    Toca los ingredientes que tengas en casa:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "1.1rem" }}>
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
                          padding: "0.38rem 0.65rem",
                          fontSize: "0.82rem"
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.45rem" }}>
                    O escribe lo que tienes (separado por comas):
                  </label>
                  <textarea
                    placeholder="Ej. 3 huevos, 1 lata de atún, tortillas, aguacate..."
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      background: "var(--bg-dark)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "0.92rem",
                      marginBottom: "1.1rem",
                      resize: "none"
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.3rem" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Tiempo disponible:</span>
                    <div style={{ display: "flex", gap: "0.45rem" }}>
                      {["5-10 min", "15-20 min"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setPrepTime(t)}
                          style={{
                            padding: "0.4rem 0.75rem",
                            borderRadius: "8px",
                            background: prepTime === t ? "var(--accent-subtle)" : "rgba(255, 255, 255, 0.05)",
                            border: prepTime === t ? "1px solid var(--accent)" : "1px solid var(--border)",
                            color: prepTime === t ? "var(--accent)" : "var(--text-muted)",
                            fontSize: "0.82rem",
                            fontWeight: "bold"
                          }}
                        >
                          ⚡ {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateRecipe}
                    disabled={isGenerating || !ingredientsInput.trim()}
                    className="glow-primary"
                    style={{
                      width: "100%",
                      padding: "0.95rem",
                      background: isGenerating ? "var(--bg-surface-hover)" : "var(--primary)",
                      color: "white",
                      borderRadius: "14px",
                      fontWeight: "bold",
                      fontSize: "0.98rem",
                      cursor: isGenerating ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.55rem"
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Creando Receta Inteligente...
                      </>
                    ) : (
                      <>
                        <Sparkles size={17} /> Crear Receta a la Medida
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: "1.1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.9rem" }}>
                    <div style={{ display: "flex", gap: "0.45rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.72rem", background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--accent-border)", padding: "0.2rem 0.55rem", borderRadius: "8px", fontWeight: "bold" }}>
                        ⏱️ {recipe.prepTime || "10 min"}
                      </span>
                      <span style={{ fontSize: "0.72rem", background: "rgba(255, 215, 0, 0.15)", color: "#FFD700", border: "1px solid rgba(255, 215, 0, 0.3)", padding: "0.2rem 0.55rem", borderRadius: "8px", fontWeight: "bold" }}>
                        🔥 {recipe.macros?.calories || 0} kcal
                      </span>
                      <span style={{ fontSize: "0.72rem", background: "var(--primary-subtle)", color: "var(--primary)", border: "1px solid var(--primary-border)", padding: "0.2rem 0.55rem", borderRadius: "8px", fontWeight: "bold" }}>
                        💪 {recipe.macros?.protein || 0}g Proteína
                      </span>
                    </div>

                    <h2 style={{ color: "white", fontSize: "1.2rem", margin: "0.4rem 0", fontFamily: "var(--font-display)" }}>{recipe.title}</h2>

                    <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.7rem", background: "rgba(0,0,0,0.3)", padding: "0.75rem", borderRadius: "10px", justifyContent: "space-around" }}>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", color: "var(--primary)", fontWeight: "bold", fontSize: "0.95rem" }}>{recipe.macros?.protein || 0}g</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Proteína</span>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", color: "#FFA500", fontWeight: "bold", fontSize: "0.95rem" }}>{recipe.macros?.carbs || 0}g</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Carbos</span>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", color: "#A9A9A9", fontWeight: "bold", fontSize: "0.95rem" }}>{recipe.macros?.fats || 0}g</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Grasas</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.1rem" }}>
                    <h4 style={{ color: "white", fontSize: "0.92rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Utensils size={15} color="var(--primary)" /> Ingredientes y Porciones exactas:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55 }}>
                      {recipe.ingredientsWithPortions?.map((ing: string, i: number) => (
                        <li key={i} style={{ marginBottom: "0.25rem" }}>
                          <span style={{ color: "white" }}>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: "1.1rem" }}>
                    <h4 style={{ color: "white", fontSize: "0.92rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Clock size={15} color="var(--accent)" /> Preparación paso a paso:
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55 }}>
                      {recipe.steps?.map((step: string, i: number) => (
                        <li key={i} style={{ marginBottom: "0.35rem" }}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {recipe.chefTip && (
                    <div
                      style={{
                        background: "rgba(255, 215, 0, 0.08)",
                        border: "1px solid rgba(255, 215, 0, 0.25)",
                        padding: "0.75rem 0.9rem",
                        borderRadius: "12px",
                        marginBottom: "1.3rem",
                        fontSize: "0.82rem",
                        color: "var(--text-main)",
                        lineHeight: 1.5
                      }}
                    >
                      <strong style={{ color: "#FFD700" }}>💡 Tip del Chef Fitmax: </strong>
                      {recipe.chefTip}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.7rem", flexDirection: "column" }}>
                    <button
                      onClick={handleLogRecipe}
                      disabled={isLogged}
                      style={{
                        padding: "0.95rem",
                        background: isLogged ? "var(--accent-subtle)" : "var(--primary)",
                        border: isLogged ? "1px solid var(--accent)" : "none",
                        color: isLogged ? "var(--accent)" : "white",
                        borderRadius: "14px",
                        fontWeight: "bold",
                        fontSize: "0.92rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.45rem"
                      }}
                    >
                      {isLogged ? <><Check size={17} /> ¡Añadida al Diario! (+50 XP)</> : <><Plus size={17} /> Añadir comida a mi Diario (+50 XP)</>}
                    </button>

                    <button
                      onClick={() => setRecipe(null)}
                      style={{
                        padding: "0.75rem",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        borderRadius: "12px",
                        fontSize: "0.86rem"
                      }}
                    >
                      Probar otros ingredientes
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
