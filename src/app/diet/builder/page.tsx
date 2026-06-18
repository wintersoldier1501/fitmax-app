"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./builder.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";

// Simulated Food Database with math ratios
const foodDB = {
  economico: {
    protein: [
      { id: "e_p1", name: "Huevos Enteros", icon: "🍳", unit: "pz", ratio: 6 },
      { id: "e_p2", name: "Atún en Agua", icon: "🐟", unit: "latas", ratio: 22 },
      { id: "e_p3", name: "Pechuga de Pollo", icon: "🍗", unit: "g", ratio: 0.31 },
      { id: "e_p4", name: "Lentejas", icon: "🍲", unit: "tazas", ratio: 18 },
      { id: "e_p5", name: "Yogur Griego Nat.", icon: "🍦", unit: "tazas", ratio: 20 },
      { id: "e_p6", name: "Queso Panela", icon: "🧀", unit: "g", ratio: 0.18 },
      { id: "e_p7", name: "Pescado Tilapia", icon: "🐡", unit: "g", ratio: 0.26 },
      { id: "e_p8", name: "Carne Molida 90/10", icon: "🥩", unit: "g", ratio: 0.20 },
    ],
    carbs: [
      { id: "e_c1", name: "Avena Seca", icon: "🥣", unit: "g", ratio: 0.66 },
      { id: "e_c2", name: "Arroz Blanco", icon: "🍚", unit: "g", ratio: 0.28 },
      { id: "e_c3", name: "Tortillas de Maíz", icon: "🌮", unit: "pz", ratio: 15 },
      { id: "e_c4", name: "Frijoles Cocidos", icon: "🫘", unit: "tazas", ratio: 40 },
      { id: "e_c5", name: "Papas al Horno", icon: "🥔", unit: "g", ratio: 0.21 },
      { id: "e_c6", name: "Pasta Cocida", icon: "🍝", unit: "tazas", ratio: 43 },
      { id: "e_c7", name: "Pan Integral", icon: "🍞", unit: "rebanadas", ratio: 12 },
      { id: "e_c8", name: "Plátano", icon: "🍌", unit: "pz", ratio: 27 },
    ],
    fats: [
      { id: "e_f1", name: "Crema de Cacahuate", icon: "🥜", unit: "cdas", ratio: 8 },
      { id: "e_f2", name: "Aceite de Oliva", icon: "🫒", unit: "cdas", ratio: 14 },
      { id: "e_f3", name: "Mantequilla", icon: "🧈", unit: "cdas", ratio: 12 },
      { id: "e_f4", name: "Mayonesa Light", icon: "🥣", unit: "cdas", ratio: 5 },
      { id: "e_f5", name: "Almendras", icon: "🌰", unit: "g", ratio: 0.50 },
      { id: "e_f6", name: "Medio Aguacate", icon: "🥑", unit: "pz", ratio: 15 },
    ]
  },
  premium: {
    protein: [
      { id: "p_p1", name: "Salmón Noruego", icon: "🍣", unit: "g", ratio: 0.20 },
      { id: "p_p2", name: "Ribeye Steak", icon: "🥩", unit: "g", ratio: 0.24 },
      { id: "p_p3", name: "Whey Protein Isolate", icon: "🥤", unit: "scoops", ratio: 25 },
      { id: "p_p4", name: "Pechuga de Pavo", icon: "🦃", unit: "g", ratio: 0.29 },
      { id: "p_p5", name: "Camarones Jumbo", icon: "🦐", unit: "g", ratio: 0.24 },
      { id: "p_p6", name: "Filete Mignon", icon: "🍖", unit: "g", ratio: 0.26 },
    ],
    carbs: [
      { id: "p_c1", name: "Quinoa Cocida", icon: "🥗", unit: "tazas", ratio: 39 },
      { id: "p_c2", name: "Pan Ezequiel", icon: "🍞", unit: "rebanadas", ratio: 15 },
      { id: "p_c3", name: "Camote al Horno", icon: "🍠", unit: "g", ratio: 0.20 },
      { id: "p_c4", name: "Pasta Integral", icon: "🍝", unit: "g", ratio: 0.70 },
      { id: "p_c5", name: "Arroz Salvaje", icon: "🌾", unit: "tazas", ratio: 35 },
      { id: "p_c6", name: "Frutos Rojos", icon: "🍓", unit: "tazas", ratio: 21 },
    ],
    fats: [
      { id: "p_f1", name: "Aguacate Hass Orgánico", icon: "🥑", unit: "pz", ratio: 30 },
      { id: "p_f2", name: "Nuez de Macadamia", icon: "🌰", unit: "g", ratio: 0.75 },
      { id: "p_f3", name: "Aceite de Trufa", icon: "🫒", unit: "cdas", ratio: 14 },
      { id: "p_f4", name: "Pistaches", icon: "🥜", unit: "g", ratio: 0.45 },
    ]
  }
};

const mealStages = ["Desayuno", "Almuerzo", "Cena"];

export default function DietBuilder() {
  const router = useRouter();
  const { isLoaded, targetMacros, saveDiet } = useFitmax();
  
  const [step, setStep] = useState(0); // 0: Budget, 1: Desayuno, 2: Almuerzo, 3: Cena
  const [budget, setBudget] = useState<"economico" | "premium">("economico");
  
  const [selections, setSelections] = useState<any>({
    protein: [], carbs: [], fats: []
  });

  // Custom AI Foods State
  const [customFoods, setCustomFoods] = useState<any>({
    protein: [], carbs: [], fats: []
  });
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [modalCategory, setModalCategory] = useState<"protein"|"carbs"|"fats">("protein");
  const [customInput, setCustomInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isLoaded) return null;

  const isBudgetStep = step === 0;

  const handleSelect = (category: string, id: string) => {
    const currentSels = selections[category];
    const isSelected = currentSels.includes(id);
    
    setSelections({
      ...selections,
      [category]: isSelected 
        ? currentSels.filter((i: string) => i !== id) 
        : [...currentSels, id]
    });
  };

  const openCustomModal = (category: "protein"|"carbs"|"fats") => {
    setModalCategory(category);
    setShowModal(true);
  };

  const openScannerModal = (category: "protein"|"carbs"|"fats") => {
    setModalCategory(category);
    setShowScanner(true);
  };

  const handleCustomAnalyze = () => {
    if (!customInput) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const inputLower = customInput.toLowerCase();
      const isPiece = inputLower.includes("hotcake") || 
                      inputLower.includes("taco") || 
                      inputLower.includes("dog") || 
                      inputLower.includes("hamburguesa") ||
                      inputLower.includes("pizza") ||
                      inputLower.includes("pan") ||
                      inputLower.includes("galleta");
                      
      const unit = isPiece ? "pz" : "g";
      
      let ratio = 0.2;
      let icon = "✨";
      if (modalCategory === "protein") { 
        ratio = isPiece ? (inputLower.includes("dog") ? 10 : 15) : 0.25; 
        icon = inputLower.includes("dog") ? "🌭" : "🥩"; 
      }
      if (modalCategory === "carbs") { ratio = isPiece ? 20 : 0.60; icon = "🌾"; }
      if (modalCategory === "fats") { ratio = isPiece ? 10 : 0.40; icon = "🥑"; }

      const newFood = {
        id: `custom_${Date.now()}`,
        name: customInput.substring(0, 25) + (customInput.length > 25 ? "..." : ""),
        icon,
        unit,
        ratio
      };

      setCustomFoods({
        ...customFoods,
        [modalCategory]: [...customFoods[modalCategory], newFood]
      });

      setIsAnalyzing(false);
      setShowModal(false);
      setCustomInput("");
      
      handleSelect(modalCategory, newFood.id);
    }, 2000);
  };

  const handleScan = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const newFood = {
        id: `scanned_${Date.now()}`,
        name: "Producto Escaneado",
        icon: "🏷️",
        unit: "g",
        ratio: modalCategory === "protein" ? 0.15 : modalCategory === "carbs" ? 0.5 : 0.3
      };
      setCustomFoods({
        ...customFoods,
        [modalCategory]: [...customFoods[modalCategory], newFood]
      });
      handleSelect(modalCategory, newFood.id);
      setIsAnalyzing(false);
      setShowScanner(false);
    }, 3000);
  };

  const currentSelection = isBudgetStep ? null : selections;
  
  const getProgress = (category: string) => {
    if (isBudgetStep) return 0;
    return currentSelection[category].length > 0 ? 100 : 0;
  };

  const canProceed = () => {
    if (isBudgetStep) return true;
    return currentSelection.protein.length > 0 && 
           currentSelection.carbs.length > 0 && 
           currentSelection.fats.length > 0;
  };

  const nextStep = () => {
    if (step === 0) {
      setStep(1);
    } else {
      generateProfessionalDiet();
    }
  };

  // --- SMART PORTIONS ALGORITHM (PHASE 15) ---
  const generateProfessionalDiet = () => {
    const db = foodDB[budget];
    const sel = selections;
    
    // Combine selected standard foods + custom AI foods
    const getFoods = (ids: string[], cat: string) => 
      ids.map(id => db[cat as keyof typeof db].find((f: any) => f.id === id) || customFoods[cat].find((f: any) => f.id === id)).filter(Boolean);

    const pFoods = getFoods(sel.protein, "protein");
    const cFoods = getFoods(sel.carbs, "carbs");
    const fFoods = getFoods(sel.fats, "fats");
    
    // Fallbacks if user didn't select enough
    if (pFoods.length === 0) pFoods.push(db.protein[0]);
    if (cFoods.length === 0) cFoods.push(db.carbs[0]);
    if (fFoods.length === 0) fFoods.push(db.fats[0]);

    // Randomizer helper
    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    const calcAmount = (target: number, ratio: number, unit: string) => {
      if (!ratio) return `${target}g`;
      const amt = target / ratio;
      if (unit === "g") return `${Math.round(amt)} ${unit}`;
      return `${Math.round(amt * 10) / 10} ${unit}`;
    };

    // The AI Master Chef logic: Combines foods logically per meal
    const generateMeal = (name: string, macroTarget: any, pCount: number, cCount: number, fCount: number) => {
      // Pick random ingredients from user favorites
      const mealP = Array.from({ length: pCount }).map(() => getRandom(pFoods));
      const mealC = Array.from({ length: cCount }).map(() => getRandom(cFoods));
      const mealF = Array.from({ length: fCount }).map(() => getRandom(fFoods));

      // Remove duplicates
      const uniqueP = [...new Set(mealP)];
      const uniqueC = [...new Set(mealC)];
      const uniqueF = [...new Set(mealF)];

      // Divide macros among unique items
      const mapFoods = (foods: any[], totalMacro: number) => {
        if (foods.length === 0) return [];
        const macroPerFood = totalMacro / foods.length;
        return foods.map(f => ({
          name: f.name,
          icon: f.icon,
          amount: calcAmount(macroPerFood, f.ratio || 1, f.unit || "g")
        }));
      };

      return {
        name,
        macros: macroTarget,
        foods: [
          ...mapFoods(uniqueP, macroTarget.protein),
          ...mapFoods(uniqueC, macroTarget.carbs),
          ...mapFoods(uniqueF, macroTarget.fats)
        ]
      };
    };

    // Professional Meal Distribution (3 main meals + 1 snack)
    const mP = targetMacros.protein;
    const mC = targetMacros.carbs;
    const mF = targetMacros.fats;

    const meals = [
      // Breakfast: 25% macros, 1 Protein, 1 Carb, 1 Fat
      generateMeal("Desayuno", { protein: Math.round(mP*0.25), carbs: Math.round(mC*0.25), fats: Math.round(mF*0.25) }, 1, 1, 1),
      // Lunch: 35% macros, 2 Proteins (e.g. Chicken + Beef), 1 Carb, 1 Fat
      generateMeal("Almuerzo", { protein: Math.round(mP*0.35), carbs: Math.round(mC*0.35), fats: Math.round(mF*0.35) }, 2, 1, 1),
      // Snack: 15% macros, 1 Protein (e.g. Whey), 1 Carb
      generateMeal("Snack Pre-Entreno", { protein: Math.round(mP*0.15), carbs: Math.round(mC*0.15), fats: Math.round(mF*0.15) }, 1, 1, 0),
      // Dinner: 25% macros, 1 Protein, 0 Carbs (or light carbs), 1 Fat
      generateMeal("Cena", { protein: Math.round(mP*0.25), carbs: Math.round(mC*0.25), fats: Math.round(mF*0.25) }, 1, 0, 1),
    ];

    saveDiet({
      budget: budget === "economico" ? "Económico" : "Premium",
      totalCalories: targetMacros.calories,
      meals: meals
    });

    router.push("/diet");
  };

  const renderList = (category: "protein"|"carbs"|"fats", title: string) => {
    const list = [...foodDB[budget][category], ...customFoods[category]];
    return (
      <div className={styles.foodCategory}>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>La IA creará tus platillos usando estas bases.</p>
        <div className={styles.foodGrid}>
          {list.map((f: any) => (
            <div 
              key={f.id} 
              className={`${styles.foodOption} ${currentSelection[category].includes(f.id) ? styles.selected : ""}`}
              onClick={() => handleSelect(category, f.id)}
            >
              <span className={styles.foodOptionIcon}>{f.icon}</span>
              <p className={styles.foodOptionName}>{f.name}</p>
            </div>
          ))}
          <div className={styles.customFoodButton} onClick={() => openCustomModal(category)}>
            <span className={styles.foodOptionIcon}>✨</span>
            <p className={styles.foodOptionName}>Antojo IA</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => step === 0 ? router.back() : setStep(step - 1)}>
          ←
        </button>
        <h1 className={styles.title}>Motor Nutricional IA</h1>
      </header>

      <AnimatePresence mode="wait">
        {isBudgetStep ? (
          <motion.div 
            key="budget"
            className={styles.stepContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className={styles.stepTitle}>Paso 1: Elige tu Presupuesto</h2>
            <div className={styles.budgetGrid}>
              <div 
                className={`${styles.budgetOption} ${budget === "economico" ? styles.selected : ""}`}
                onClick={() => setBudget("economico")}
              >
                <span className={styles.budgetIcon}>🟢</span>
                <div className={styles.budgetText}>
                  <h3>Económico & Eficiente</h3>
                  <p>Pollo, huevos, lentejas, arroz, avena.</p>
                </div>
              </div>
              
              <div 
                className={`${styles.budgetOption} ${budget === "premium" ? styles.selected : ""}`}
                onClick={() => setBudget("premium")}
              >
                <span className={styles.budgetIcon}>🔴</span>
                <div className={styles.budgetText}>
                  <h3>Premium & Gourmet</h3>
                  <p>Salmón, cortes finos, aguacate, suplementos.</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="preferences"
            className={styles.stepContainer}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className={styles.stepTitle}>Paso 2: Tus Ingredientes Favoritos</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Selecciona todo lo que te guste. La IA del Master Chef combinará inteligentemente estos ingredientes en platos reales calculados exactamente a tus macros.
            </p>

            <div style={{ overflowY: "auto", flex: 1, paddingBottom: "2rem" }}>
              {renderList("protein", "🥩 Proteínas")}
              {renderList("carbs", "🌾 Carbohidratos")}
              {renderList("fats", "🥑 Grasas Saludables")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.navButtons}>
        <button 
          className={styles.nextButton} 
          disabled={!canProceed()}
          onClick={nextStep}
        >
          {step === 1 ? "🪄 Auto-Generar Menú Pro" : "Siguiente"}
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {isAnalyzing ? (
              <div className={styles.loadingSpinner}>
                <span style={{ fontSize: "3rem", animation: "spin 2s linear infinite" }}>🔄</span>
                <h3>Analizando con IA...</h3>
                <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Calculando la densidad calórica de "{customInput}".</p>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Agregar Antojo</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  ¿Qué otro ingrediente quieres que la IA incluya en tus platos?
                </p>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ej: Hotcakes de proteína, Omelette..." 
                  className={styles.modalInput}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomAnalyze()}
                />
                <div className={styles.modalActions}>
                  <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className={`${styles.modalBtn} ${styles.modalBtnSubmit}`} onClick={handleCustomAnalyze}>Añadir ✨</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.main>
  );
}
