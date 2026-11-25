"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFitmax, compressThumbnail } from "@/context/FitmaxContext";
import {
  X,
  Camera,
  Sparkles,
  Loader2,
  Plus,
  Check,
  Shield,
  Utensils,
  MessageSquareQuote,
  GlassWater,
  RefreshCw,
  Trash2,
  Wine
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "scanner" | "banking";
}

interface DishRecommendation {
  badge: string;
  dishName: string;
  waiterHack: string;
  whyItFits: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

interface RestaurantResult {
  venueTitle: string;
  tacticalRule: string;
  drinkHack: string;
  recommendations: DishRecommendation[];
}

const VENUE_CHIPS = [
  "🌮 Taquería",
  "🍣 Sushi / Poke",
  "🥩 Cortes / Parrilla",
  "🍕 Pizza / Italiano",
  "🍔 Burgers / Fast Food",
  "🍗 Alitas / Bar",
  "🦐 Mariscos",
  "☕ Brunch / Café"
];

export function RestaurantInfiltratorModal({ isOpen, onClose, initialTab = "scanner" }: Props) {
  const {
    targetMacros,
    currentMacros,
    profile,
    todaySocialBank,
    activateSocialBank,
    releaseSocialBank,
    cancelSocialBank,
    addFoodLog,
    showToast
  } = useFitmax();

  const [activeTab, setActiveTab] = useState<"scanner" | "banking">(initialTab);
  const [query, setQuery] = useState("");
  const [menuImage, setMenuImage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RestaurantResult | null>(null);
  const [loggedIndices, setLoggedIndices] = useState<number[]>([]);

  // Banking state
  const [eventNameInput, setEventNameInput] = useState("Cena / Salida Social");
  const [reserveInput, setReserveInput] = useState<number>(900);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (todaySocialBank?.active) {
        setEventNameInput(todaySocialBank.eventName || "Cena / Salida Social");
        setReserveInput(todaySocialBank.reservedCalories || 900);
      }
    }
  }, [isOpen, initialTab, todaySocialBank]);

  if (!isOpen) return null;

  const targetCal =
    targetMacros.calories ||
    Math.round((targetMacros.protein || 140) * 4 + (targetMacros.carbs || 180) * 4 + (targetMacros.fats || 60) * 9);
  const rawCalRemain = Math.max(0, targetCal - (currentMacros.calories || 0));
  const lockedCal = todaySocialBank?.active && !todaySocialBank.released ? todaySocialBank.reservedCalories : 0;
  const effectiveCalRemain = Math.max(0, rawCalRemain - lockedCal);

  const pRemain = Math.max(0, (targetMacros.protein || 140) - (currentMacros.protein || 0));
  const cRemain = Math.max(0, (targetMacros.carbs || 180) - (currentMacros.carbs || 0));
  const fRemain = Math.max(0, (targetMacros.fats || 60) - (currentMacros.fats || 0));

  // If bank is released or scanner is opened with low daytime remaining while bank was locked, give realistic budget
  const scannerCalBudget = todaySocialBank?.active && todaySocialBank.released
    ? Math.max(effectiveCalRemain, todaySocialBank.reservedCalories)
    : effectiveCalRemain || 600;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressThumbnail(reader.result as string, 960, 0.72);
      setMenuImage(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (customQuery?: string) => {
    const activeQuery = (customQuery ?? query).trim();
    if (!activeQuery && !menuImage) {
      showToast("Elige un tipo de restaurante, escribe el menú o sube una foto", "warning");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setLoggedIndices([]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("/api/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: activeQuery,
          image: menuImage,
          goal: profile.goal || "Recomposición Corporal",
          remainingMacros: {
            protein: pRemain,
            carbs: cRemain,
            fats: fRemain,
            calories: scannerCalBudget
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.recommendations?.length) {
        setResult(data);
      } else {
        throw new Error(data.error || "Respuesta inválida");
      }
    } catch {
      clearTimeout(timeoutId);
      const prot = Math.max(32, Math.min(70, pRemain || 45));
      const carbs = Math.max(25, Math.min(80, cRemain || 45));
      const fats = Math.max(12, Math.min(35, fRemain || 18));
      setResult({
        venueTitle: `Infiltración Táctica: ${activeQuery || "Menú del Lugar"}`,
        tacticalRule: "Prioriza proteína a la plancha/carbón, pide salsas aparte y evita bebidas azucaradas.",
        drinkHack: "Agua mineral con limón o refresco sin calorías.",
        recommendations: [
          {
            badge: "🥇 Opción Óptima (Alta Proteína)",
            dishName: "Corte Magro o Pechuga a la Plancha + Guarnición Limpia",
            waiterHack: "Pide 'sellado sin mantequilla ni aceite extra y con las salsas servidas aparte'.",
            whyItFits: "Encaja directo con tu meta proteica del día sin grasa oculta.",
            macros: {
              protein: prot,
              carbs,
              fats,
              calories: prot * 4 + carbs * 4 + fats * 9
            }
          }
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogDish = (rec: DishRecommendation, idx: number) => {
    if (loggedIndices.includes(idx)) return;
    addFoodLog({
      id: `${Date.now()}_${idx}`,
      name: `🍽️ ${rec.dishName}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      macros: {
        protein: Math.round(rec.macros.protein || 0),
        carbs: Math.round(rec.macros.carbs || 0),
        fats: Math.round(rec.macros.fats || 0),
        calories: Math.round(rec.macros.calories || 0)
      }
    });
    setLoggedIndices((prev) => [...prev, idx]);
  };

  const daytimeRemain = Math.max(300, rawCalRemain - reserveInput);

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.86)",
          backdropFilter: "blur(10px)",
          zIndex: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.9rem"
        }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 18 }}
          className="glass-card"
          style={{
            width: "100%",
            maxWidth: "470px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "1.35rem",
            background: "var(--bg-surface-solid)",
            border: "1px solid var(--border)",
            borderRadius: "24px"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, var(--primary), #F59E0B)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}
              >
                🕵️‍♂️
              </div>
              <div>
                <h3 style={{ margin: 0, color: "white", fontSize: "1.08rem", fontFamily: "var(--font-display)" }}>
                  Infiltrador & Escudo Social
                </h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.74rem" }}>
                  Come fuera sin perder tu progreso semanal
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ color: "var(--text-muted)", padding: "0.3rem" }}>
              <X size={20} />
            </button>
          </div>

          {/* 2-Tab Switcher */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.35rem",
              background: "var(--bg-dark)",
              padding: "0.28rem",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              marginBottom: "1rem"
            }}
          >
            <button
              onClick={() => setActiveTab("scanner")}
              style={{
                padding: "0.55rem 0.4rem",
                borderRadius: "9px",
                fontSize: "0.78rem",
                fontWeight: activeTab === "scanner" ? 800 : 600,
                background: activeTab === "scanner" ? "var(--primary)" : "transparent",
                color: activeTab === "scanner" ? "white" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <Utensils size={14} /> Escáner Menú
            </button>
            <button
              onClick={() => setActiveTab("banking")}
              style={{
                padding: "0.55rem 0.4rem",
                borderRadius: "9px",
                fontSize: "0.78rem",
                fontWeight: activeTab === "banking" ? 800 : 600,
                background: activeTab === "banking" ? "#F59E0B" : "transparent",
                color: activeTab === "banking" ? "#000" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <Shield size={14} /> Escudo Social
            </button>
          </div>

          {activeTab === "scanner" ? (
            <div>
              {/* Live Macro Budget Strip */}
              <div
                style={{
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--accent-border)",
                  padding: "0.75rem 0.9rem",
                  borderRadius: "14px",
                  marginBottom: "0.95rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    Presupuesto Disponible Para Ordenar:
                  </span>
                  <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "0.86rem" }}>
                    ~{scannerCalBudget} kcal
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.78rem", fontWeight: 700, flexWrap: "wrap" }}>
                  <span style={{ color: "var(--primary)" }}>🍗 {pRemain}g Prot.</span>
                  <span style={{ color: "#FFA500" }}>🍚 {cRemain}g Carb.</span>
                  <span style={{ color: "#A9A9A9" }}>🥑 {fRemain}g Grasas</span>
                </div>

                {lockedCal > 0 && (
                  <button
                    onClick={() => releaseSocialBank()}
                    style={{
                      marginTop: "0.6rem",
                      width: "100%",
                      padding: "0.48rem 0.65rem",
                      borderRadius: "9px",
                      background: "rgba(245, 158, 11, 0.2)",
                      border: "1px solid rgba(245, 158, 11, 0.45)",
                      color: "#FBBF24",
                      fontSize: "0.75rem",
                      fontWeight: 800
                    }}
                  >
                    🥂 ¿Ya estás en tu evento? Liberar tus {lockedCal} kcal reservadas ahora
                  </button>
                )}
              </div>

              {!result ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  {/* Photo Menu Upload */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    {menuImage ? (
                      <div
                        style={{
                          position: "relative",
                          borderRadius: "14px",
                          overflow: "hidden",
                          border: "1px solid var(--accent-border)"
                        }}
                      >
                        <img
                          src={menuImage}
                          alt="Menú capturado"
                          style={{ width: "100%", maxHeight: "150px", objectFit: "cover", display: "block" }}
                        />
                        <button
                          onClick={() => setMenuImage("")}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            background: "rgba(0,0,0,0.75)",
                            color: "white",
                            borderRadius: "999px",
                            padding: "0.35rem"
                          }}
                          title="Quitar foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: "100%",
                          padding: "0.85rem",
                          borderRadius: "14px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px dashed var(--accent-border)",
                          color: "var(--accent)",
                          fontWeight: 700,
                          fontSize: "0.84rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem"
                        }}
                      >
                        <Camera size={17} /> Fotografiar / Subir Carta del Restaurante (IA)
                      </button>
                    )}
                  </div>

                  {/* Quick Venue Chips */}
                  <div>
                    <span style={{ display: "block", fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.45rem" }}>
                      O toca el tipo de restaurante donde estás:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {VENUE_CHIPS.map((chip) => {
                        const labelClean = chip.replace(/^[^\w\s]+\s*/, "").trim();
                        const selected = query.toLowerCase() === labelClean.toLowerCase();
                        return (
                          <button
                            key={chip}
                            onClick={() => {
                              setQuery(labelClean);
                              handleAnalyze(labelClean);
                            }}
                            style={{
                              padding: "0.38rem 0.65rem",
                              borderRadius: "10px",
                              fontSize: "0.76rem",
                              fontWeight: 600,
                              background: selected ? "var(--primary)" : "rgba(255,255,255,0.06)",
                              border: "1px solid var(--border)",
                              color: "white"
                            }}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                      ¿Qué lugar es o qué platillos ves en la carta?
                    </label>
                    <textarea
                      rows={2}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ej. Sonora Grill, Chili's, tacos de sirloin, pasta al pesto o hamburguesa..."
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "12px",
                        background: "var(--bg-dark)",
                        border: "1px solid var(--border)",
                        color: "white",
                        fontSize: "0.86rem",
                        resize: "none"
                      }}
                    />
                  </div>

                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing || (!query.trim() && !menuImage)}
                    className="glow-primary"
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      borderRadius: "14px",
                      background: isAnalyzing ? "var(--bg-surface-hover)" : "var(--primary)",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: isAnalyzing ? "not-allowed" : "pointer"
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={17} className="animate-spin" /> Infiltrando Menú...
                      </>
                    ) : (
                      <>
                        <Sparkles size={17} /> Decir Qué Pedir al Mesero
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {/* Strategy Summary */}
                  <div
                    style={{
                      background: "rgba(245, 158, 11, 0.08)",
                      border: "1px solid rgba(245, 158, 11, 0.28)",
                      padding: "0.85rem",
                      borderRadius: "14px"
                    }}
                  >
                    <h4 style={{ margin: "0 0 0.3rem 0", color: "#FBBF24", fontSize: "0.95rem" }}>
                      {result.venueTitle}
                    </h4>
                    <p style={{ margin: "0 0 0.45rem 0", color: "var(--text-main)", fontSize: "0.8rem", lineHeight: 1.45 }}>
                      <strong>Regla de Oro:</strong> {result.tacticalRule}
                    </p>
                    <p style={{ margin: 0, color: "var(--accent)", fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <GlassWater size={13} /> <strong>Bebida táctica:</strong> {result.drinkHack}
                    </p>
                  </div>

                  {/* 3 Tactical Dishes */}
                  {result.recommendations.map((rec, idx) => {
                    const isLogged = loggedIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: idx === 0 ? "1px solid var(--primary-border)" : "1px solid var(--border)",
                          borderRadius: "14px",
                          padding: "0.9rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.55rem"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: idx === 0 ? "var(--primary)" : "var(--accent)" }}>
                            {rec.badge}
                          </span>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#FFD700" }}>
                            🔥 {rec.macros.calories} kcal
                          </span>
                        </div>

                        <h5 style={{ margin: 0, color: "white", fontSize: "0.96rem", fontWeight: 800 }}>
                          {rec.dishName}
                        </h5>

                        <div style={{ display: "flex", gap: "0.45rem", fontSize: "0.72rem", fontWeight: 700 }}>
                          <span style={{ background: "var(--primary-subtle)", color: "var(--primary)", padding: "0.18rem 0.45rem", borderRadius: "6px" }}>
                            {rec.macros.protein}g P
                          </span>
                          <span style={{ background: "var(--accent-subtle)", color: "var(--accent)", padding: "0.18rem 0.45rem", borderRadius: "6px" }}>
                            {rec.macros.carbs}g C
                          </span>
                          <span style={{ background: "rgba(255,215,0,0.12)", color: "#FBBF24", padding: "0.18rem 0.45rem", borderRadius: "6px" }}>
                            {rec.macros.fats}g G
                          </span>
                        </div>

                        <div
                          style={{
                            background: "rgba(0, 229, 255, 0.07)",
                            borderLeft: "3px solid var(--accent)",
                            padding: "0.55rem 0.7rem",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                            color: "white",
                            lineHeight: 1.4
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--accent)", fontWeight: 800, fontSize: "0.72rem", marginBottom: "0.15rem" }}>
                            <MessageSquareQuote size={12} /> Díselo así al mesero:
                          </div>
                          {rec.waiterHack}
                        </div>

                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
                          {rec.whyItFits}
                        </p>

                        <button
                          onClick={() => handleLogDish(rec, idx)}
                          disabled={isLogged}
                          style={{
                            padding: "0.62rem",
                            borderRadius: "10px",
                            background: isLogged ? "rgba(16, 185, 129, 0.16)" : "var(--primary)",
                            border: isLogged ? "1px solid #10b981" : "none",
                            color: isLogged ? "#10b981" : "white",
                            fontWeight: 800,
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35rem"
                          }}
                        >
                          {isLogged ? (
                            <>
                              <Check size={15} /> Registrado en Diario Hoy (+50 XP)
                            </>
                          ) : (
                            <>
                              <Plus size={15} /> Pedir Esto y Registrar (+50 XP)
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setResult(null)}
                    style={{
                      padding: "0.7rem",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      borderRadius: "12px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <RefreshCw size={14} /> Analizar otro restaurante o foto
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Social Event Calorie Banking */
            <div style={{ display: "flex", flexDirection: "column", gap: "0.95rem" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(255, 51, 102, 0.08))",
                  border: "1px solid rgba(245, 158, 11, 0.32)",
                  borderRadius: "14px",
                  padding: "0.9rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#FBBF24", fontWeight: 800, fontSize: "0.88rem", marginBottom: "0.3rem" }}>
                  <Wine size={16} /> Blindaje Metabólico (Calorie Banking)
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                  Reserva un colchón calórico para tu cena o evento nocturno sin castigar tu meta proteica diaria. Durante el día priorizas proteína magra + fibra y llegas con presupuesto de sobra a la mesa.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                  Nombre del evento de hoy:
                </label>
                <input
                  type="text"
                  value={eventNameInput}
                  onChange={(e) => setEventNameInput(e.target.value)}
                  placeholder="Ej. Cena de cumpleaños, Tacos con amigos..."
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.85rem",
                    borderRadius: "12px",
                    background: "var(--bg-dark)",
                    border: "1px solid var(--border)",
                    color: "white",
                    fontSize: "0.88rem"
                  }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Reserva para el evento:</span>
                  <span style={{ fontSize: "0.98rem", fontWeight: 800, color: "#FBBF24" }}>{reserveInput} kcal</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem", marginBottom: "0.55rem" }}>
                  {[600, 900, 1200].map((val) => (
                    <button
                      key={val}
                      onClick={() => setReserveInput(val)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        background: reserveInput === val ? "#F59E0B" : "rgba(255,255,255,0.05)",
                        color: reserveInput === val ? "#000" : "white",
                        border: "1px solid var(--border)"
                      }}
                    >
                      {val} kcal
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setReserveInput((v) => Math.max(400, v - 100))}
                    style={{
                      flex: 1,
                      padding: "0.42rem",
                      borderRadius: "9px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      fontSize: "0.76rem",
                      fontWeight: 700
                    }}
                  >
                    -100 kcal
                  </button>
                  <button
                    onClick={() => setReserveInput((v) => Math.min(1500, v + 100))}
                    style={{
                      flex: 1,
                      padding: "0.42rem",
                      borderRadius: "9px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      fontSize: "0.76rem",
                      fontWeight: 700
                    }}
                  >
                    +100 kcal
                  </button>
                </div>
              </div>

              {/* Daytime Strategy Preview */}
              <div
                style={{
                  background: "var(--bg-dark)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "0.9rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem"
                }}
              >
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase" }}>
                  Estrategia Táctica Diurna vs Nocturna
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.6rem", borderRadius: "10px" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "block" }}>Durante el Día (Restante)</span>
                    <strong style={{ color: "white", fontSize: "1rem" }}>{daytimeRemain} kcal</strong>
                  </div>
                  <div style={{ background: "rgba(245,158,11,0.1)", padding: "0.6rem", borderRadius: "10px", border: "1px solid rgba(245,158,11,0.25)" }}>
                    <span style={{ fontSize: "0.68rem", color: "#FBBF24", display: "block" }}>Blindado para Evento</span>
                    <strong style={{ color: "#FBBF24", fontSize: "1rem" }}>{reserveInput} kcal</strong>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                  • Tu meta de <strong style={{ color: "var(--primary)" }}>{targetMacros.protein || 140}g de Proteína</strong> NO se recorta (faltan {pRemain}g): usa claras, pechuga, atún o yogurt griego con verduras antes del evento.<br />
                  • Llega hidratado con electrolitos y usa el Escáner de Menú al sentarte.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                <button
                  onClick={() => activateSocialBank(reserveInput, eventNameInput)}
                  className="glow-primary"
                  style={{
                    width: "100%",
                    padding: "0.88rem",
                    borderRadius: "12px",
                    background: "var(--primary)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.45rem"
                  }}
                >
                  <Shield size={17} />
                  {todaySocialBank?.active
                    ? `Actualizar Colchón (${reserveInput} kcal)`
                    : `Activar Escudo Social (${reserveInput} kcal) +25 XP`}
                </button>

                {todaySocialBank?.active && !todaySocialBank.released && (
                  <button
                    onClick={() => {
                      releaseSocialBank();
                      setActiveTab("scanner");
                    }}
                    style={{
                      width: "100%",
                      padding: "0.82rem",
                      borderRadius: "12px",
                      background: "rgba(16, 185, 129, 0.16)",
                      border: "1px solid #10b981",
                      color: "#10b981",
                      fontWeight: 800,
                      fontSize: "0.84rem"
                    }}
                  >
                    🥂 ¡Llegué al Evento! Liberar {todaySocialBank.reservedCalories} kcal y Escanear Menú
                  </button>
                )}

                {todaySocialBank?.active && todaySocialBank.released && (
                  <button
                    onClick={() => setActiveTab("scanner")}
                    style={{
                      width: "100%",
                      padding: "0.78rem",
                      borderRadius: "12px",
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--accent-border)",
                      color: "var(--accent)",
                      fontWeight: 800,
                      fontSize: "0.84rem"
                    }}
                  >
                    ✅ Reserva Liberada • Ir al Escáner de Menú
                  </button>
                )}

                {todaySocialBank?.active && (
                  <button
                    onClick={cancelSocialBank}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "10px",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      fontSize: "0.78rem"
                    }}
                  >
                    Desactivar reserva de hoy
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
