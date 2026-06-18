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
    0: { protein: [], carbs: [], fats: [] },
    1: { protein: [], carbs: [], fats: [] },
    2: { protein: [], carbs: [], fats: [] }
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

  const currentMealIndex = step - 1;
  const isBudgetStep = step === 0;

  const mealTarget = {
    protein: Math.round(targetMacros.protein / 3),
    carbs: Math.round(targetMacros.carbs / 3),
    fats: Math.round(targetMacros.fats / 3),
  };

  const handleSelect = (category: string, id: string) => {
    const currentSels = selections[currentMealIndex][category];
    const isSelected = currentSels.includes(id);
    
    setSelections({
      ...selections,
      [currentMealIndex]: {
        ...selections[currentMealIndex],
        [category]: isSelected 
          ? currentSels.filter((i: string) => i !== id) 
          : [...currentSels, id]
      }
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

  const currentSelection = isBudgetStep ? null : selections[currentMealIndex];
  
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
    if (step < 3) {
      setStep(step + 1);
    } else {
      const db = foodDB[budget];
      const meals = [0, 1, 2].map((mIdx) => {
        const sel = selections[mIdx];
        
        const getFoods = (ids: string[], cat: string) => 
          ids.map(id => db[cat as keyof typeof db].find((f: any) => f.id === id) || customFoods[cat].find((f: any) => f.id === id)).filter(Boolean);

        const pFoods = getFoods(sel.protein, "protein");
        const cFoods = getFoods(sel.carbs, "carbs");
        const fFoods = getFoods(sel.fats, "fats");
        
        const calcAmount = (target: number, ratio: number, unit: string) => {
          if (!ratio) return `${target}g`;
          const amt = target / ratio;
          if (unit === "g") return `${Math.round(amt)} ${unit}`;
          return `${Math.round(amt * 10) / 10} ${unit}`;
        };

        const mapFoods = (foods: any[], totalTarget: number) => {
          const targetPerFood = totalTarget / foods.length;
          return foods.map(f => ({
            name: f.name,
            icon: f.icon,
            amount: calcAmount(targetPerFood, f.ratio || 1, f.unit || "g")
          }));
        };

        return {
          name: mealStages[mIdx],
          macros: mealTarget,
          foods: [
            ...mapFoods(pFoods, mealTarget.protein),
            ...mapFoods(cFoods, mealTarget.carbs),
            ...mapFoods(fFoods, mealTarget.fats)
          ]
        };
      });

      saveDiet({
        budget: budget === "economico" ? "Económico" : "Premium",
        totalCalories: targetMacros.calories,
        meals: meals
      });

      router.push("/diet");
    }
  };

  const renderList = (category: "protein"|"carbs"|"fats", title: string) => {
    const list = [...foodDB[budget][category], ...customFoods[category]];
    return (
      <div className={styles.foodCategory}>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Puedes seleccionar varias opciones para dividir la porción.</p>
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
            <p className={styles.foodOptionName}>Texto IA</p>
          </div>
          <div className={styles.customFoodButton} onClick={() => openScannerModal(category)}>
            <span className={styles.foodOptionIcon}>📸</span>
            <p className={styles.foodOptionName}>Escanear</p>
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
        <h1 className={styles.title}>Constructor de Dieta</h1>
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
            key={`meal-${step}`}
            className={styles.stepContainer}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className={styles.stepTitle}>Paso {step + 1}: {mealStages[currentMealIndex]}</h2>
            
            <div className={styles.progressContainer}>
              <div className={styles.progressBarCol}>
                <div className={styles.progressLabel}><span>Proteína</span><span>{mealTarget.protein}g</span></div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${getProgress('protein')}%`, backgroundColor: "var(--primary)" }} />
                </div>
              </div>
              <div className={styles.progressBarCol}>
                <div className={styles.progressLabel}><span>Carbos</span><span>{mealTarget.carbs}g</span></div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${getProgress('carbs')}%`, backgroundColor: "#00E5FF" }} />
                </div>
              </div>
              <div className={styles.progressBarCol}>
                <div className={styles.progressLabel}><span>Grasas</span><span>{mealTarget.fats}g</span></div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${getProgress('fats')}%`, backgroundColor: "#FFD700" }} />
                </div>
              </div>
            </div>

            <div style={{ overflowY: "auto", flex: 1, paddingBottom: "2rem" }}>
              {renderList("protein", "Elige tus Proteínas")}
              {renderList("carbs", "Elige tus Carbohidratos")}
              {renderList("fats", "Elige tus Grasas")}
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
          {step === 3 ? "Generar Plan Maestro" : "Siguiente"}
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {isAnalyzing ? (
              <div className={styles.loadingSpinner}>
                <span style={{ fontSize: "3rem", animation: "spin 2s linear infinite" }}>🔄</span>
                <h3>Analizando con IA...</h3>
                <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Buscando "{customInput}" en la base de datos global y extrayendo macros.</p>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Buscador de Texto IA</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Escribe lo que quieres agregar como {modalCategory === "protein" ? "proteína" : modalCategory === "carbs" ? "carbohidrato" : "grasa"}.
                </p>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ej: Hotcakes de proteína..." 
                  className={styles.modalInput}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomAnalyze()}
                />
                <div className={styles.modalActions}>
                  <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className={`${styles.modalBtn} ${styles.modalBtnSubmit}`} onClick={handleCustomAnalyze}>Buscar 🔍</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showScanner && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {isAnalyzing ? (
              <div className={styles.loadingSpinner}>
                <span style={{ fontSize: "3rem", animation: "spin 2s linear infinite" }}>🔄</span>
                <h3>Extrayendo Tabla Nutricional...</h3>
                <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Convirtiendo imagen a datos de macros.</p>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Escáner Láser de Etiquetas</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Apunta a la etiqueta nutricional del producto.
                </p>
                
                <div className={styles.cameraView}>
                  <div className={styles.scannerLine}></div>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>Cámara Activa</span>
                </div>

                <div className={styles.modalActions}>
                  <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setShowScanner(false)}>Cancelar</button>
                  <button className={`${styles.modalBtn} ${styles.modalBtnSubmit}`} onClick={handleScan}>Capturar 📸</button>
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
