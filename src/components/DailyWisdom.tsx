"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote as QuoteIcon, RefreshCw, Copy, Check, Sparkles, Brain, Lightbulb, Gamepad2, BookOpen, Film, Sword, Zap } from "lucide-react";
import { Quote, getDailyQuote, getRandomQuote, quotesLibrary } from "@/data/quotes";
import { useFitmax } from "@/context/FitmaxContext";

interface DailyWisdomProps {
  compact?: boolean;
}

const filterCategories = [
  { label: "Todos", key: "Todos", icon: Sparkles },
  { label: "Videojuegos", key: "Videojuegos", icon: Gamepad2 },
  { label: "Literatura", key: "Literatura", icon: BookOpen },
  { label: "Anime & Manga", key: "Anime & Manga", icon: Sword },
  { label: "Filosofía", key: "Filosofía", icon: Brain },
  { label: "Cine & Culto", key: "Cine & Culto", icon: Film },
  { label: "Disciplina", key: "Disciplina", icon: Zap }
];

export function DailyWisdom({ compact = false }: DailyWisdomProps) {
  const { addXp } = useFitmax();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [currentQuote, setCurrentQuote] = useState<Quote>(getDailyQuote());
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check if daily wisdom XP already claimed today
    const claimedDate = localStorage.getItem("fitmax_wisdom_xp_date");
    const today = new Date().toDateString();
    if (claimedDate !== today) {
      // Don't claim immediately, but when user interacts or reads
    }
  }, []);

  const handleNextQuote = (cat?: string) => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 400);

    const targetCat = cat !== undefined ? cat : selectedCategory;
    const next = getRandomQuote(currentQuote.id, targetCat);
    setCurrentQuote(next);

    // Give daily reflection XP if first time today
    const today = new Date().toDateString();
    const claimedDate = localStorage.getItem("fitmax_wisdom_xp_date");
    if (claimedDate !== today) {
      localStorage.setItem("fitmax_wisdom_xp_date", today);
      addXp(15);
    }
  };

  const handleSelectCategory = (catKey: string) => {
    setSelectedCategory(catKey);
    handleNextQuote(catKey);
  };

  const handleCopy = async () => {
    const textToCopy = `"${currentQuote.text}"\n— ${currentQuote.author} (${currentQuote.role})\n\nVía Fitmax App`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.warn("Could not copy to clipboard", e);
    }
  };

  const categoryColorMap: Record<string, { bg: string; color: string; border: string }> = {
    Videojuegos: { bg: "rgba(0, 229, 255, 0.12)", color: "#00E5FF", border: "rgba(0, 229, 255, 0.3)" },
    Literatura: { bg: "rgba(255, 170, 0, 0.12)", color: "#FFAA00", border: "rgba(255, 170, 0, 0.3)" },
    "Anime & Manga": { bg: "rgba(255, 51, 102, 0.12)", color: "#FF3366", border: "rgba(255, 51, 102, 0.3)" },
    Filosofía: { bg: "rgba(168, 85, 247, 0.12)", color: "#A855F7", border: "rgba(168, 85, 247, 0.3)" },
    "Cine & Culto": { bg: "rgba(234, 179, 8, 0.12)", color: "#EAB308", border: "rgba(234, 179, 8, 0.3)" },
    Disciplina: { bg: "rgba(34, 197, 94, 0.12)", color: "#22C55E", border: "rgba(34, 197, 94, 0.3)" },
  };

  const catStyle = categoryColorMap[currentQuote.category] || categoryColorMap.Disciplina;

  return (
    <div 
      className="glass-card"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: compact ? "1.2rem" : "1.4rem",
        borderRadius: "18px",
        background: "linear-gradient(135deg, rgba(255, 180, 0, 0.05), rgba(15, 23, 42, 0.75))",
        border: "1px solid rgba(255, 180, 0, 0.2)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)"
      }}
    >
      {/* Background Decorative Large Quote Watermark */}
      <div 
        style={{
          position: "absolute",
          right: "-10px",
          top: "-15px",
          color: "rgba(255, 180, 0, 0.04)",
          pointerEvents: "none",
          zIndex: 0
        }}
      >
        <QuoteIcon size={140} />
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        
        {/* Top Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span 
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                padding: "0.2rem 0.55rem",
                borderRadius: "6px",
                background: catStyle.bg,
                color: catStyle.color,
                border: `1px solid ${catStyle.border}`
              }}
            >
              {currentQuote.category === "Videojuegos" && "🎮 "}
              {currentQuote.category === "Literatura" && "📚 "}
              {currentQuote.category === "Anime & Manga" && "⚔️ "}
              {currentQuote.category === "Filosofía" && "🧠 "}
              {currentQuote.category === "Cine & Culto" && "🎬 "}
              {currentQuote.category === "Disciplina" && "⚡ "}
              {currentQuote.sourceTag || currentQuote.category}
            </span>

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "0.72rem",
                color: showFilters ? "#FFAA00" : "var(--text-muted)",
                cursor: "pointer",
                padding: "0.1rem 0.3rem",
                textDecoration: "underline"
              }}
            >
              {showFilters ? "Cerrar filtros" : "Filtrar por origen"}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              onClick={handleCopy}
              title="Copiar reflexión"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.35rem 0.6rem",
                color: copied ? "#00E5FF" : "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.72rem",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {copied ? <Check size={13} color="#00E5FF" /> : <Copy size={13} />}
              <span>{copied ? "Copiada" : "Copiar"}</span>
            </button>

            <button
              onClick={() => handleNextQuote()}
              title="Leer otra reflexión"
              style={{
                background: "rgba(255, 180, 0, 0.1)",
                border: "1px solid rgba(255, 180, 0, 0.3)",
                borderRadius: "8px",
                padding: "0.35rem 0.65rem",
                color: "#FFAA00",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                transition: "all 0.2s"
              }}
            >
              <motion.span
                animate={{ rotate: isSpinning ? 360 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", alignItems: "center" }}
              >
                <RefreshCw size={13} />
              </motion.span>
              <span>Otra Frase</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar (Expandable) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", padding: "0.4rem 0" }}>
                {filterCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleSelectCategory(cat.key)}
                      style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: "8px",
                        border: isSelected ? "1px solid #FFAA00" : "1px solid var(--border)",
                        background: isSelected ? "rgba(255, 170, 0, 0.2)" : "rgba(255,255,255,0.03)",
                        color: isSelected ? "#FFAA00" : "var(--text-muted)",
                        fontSize: "0.7rem",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <Icon size={12} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Quote Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {/* Quote Text */}
            <p 
              style={{
                margin: 0,
                fontSize: compact ? "0.95rem" : "1.05rem",
                lineHeight: "1.55",
                color: "#FFFFFF",
                fontWeight: 600,
                fontStyle: "italic",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)"
              }}
            >
              "{currentQuote.text}"
            </p>

            {/* Author Attribution */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#FFAA00" }}>
                — {currentQuote.author}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                • {currentQuote.role}
              </span>
            </div>

            {/* Practical Insight Box */}
            {currentQuote.insight && (
              <div 
                style={{
                  marginTop: "0.2rem",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderLeft: "3px solid #FFAA00",
                  fontSize: "0.78rem",
                  color: "rgba(255, 255, 255, 0.85)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem"
                }}
              >
                <Lightbulb size={16} color="#FFAA00" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong style={{ color: "white" }}>Para reflexionar hoy:</strong> {currentQuote.insight}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
