"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";
import { Trash2, Zap, Check, User } from "lucide-react";

interface CoachAction {
  type: "LOG_FOOD" | "ADD_WATER" | "ADJUST_CALORIES" | "SWAP_EXERCISE" | "ACTIVATE_SOCIAL_BANK" | "SET_STEPS";
  payload: any;
}

interface Message {
  id: string;
  sender: "user" | "coach";
  text: string;
  action?: CoachAction | null;
  actionApplied?: boolean;
}

const DEFAULT_WELCOME: Message[] = [
  {
    id: "welcome_1",
    sender: "coach",
    text: "¡Hola! Soy tu **Coach Agéntico Fitmax**. Tengo visibilidad de tus macros, sueño, racha y rutina activa.\n\nPuedes preguntarme cualquier duda o pedirme cosas como *\"regístrame 1 scoop de whey\"* o *\"ajusta mi entreno según mi fatiga\"*."
  }
];

const QUICK_PROMPTS = [
  "📊 Evalúa mi día de hoy",
  "🥂 Blindar 900 kcal para cena hoy",
  "⚡ Ajusta mi entreno según mi fatiga",
  "🥤 Regístrame 1 scoop de whey",
  "💀 Dame una reflexión estoica"
];

function parseCoachReply(rawText: string): { cleanText: string; action: CoachAction | null } {
  const match = rawText.match(/<<<ACTION:(\{[\s\S]*?\})>>>/);
  if (!match) {
    return { cleanText: rawText.trim(), action: null };
  }
  let action: CoachAction | null = null;
  try {
    action = JSON.parse(match[1]);
  } catch {
    action = null;
  }
  const cleanText = rawText.replace(match[0], "").trim();
  return { cleanText, action };
}

function renderInlineFormatting(line: string) {
  const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**")) {
      return <strong key={i} style={{ color: "white", fontWeight: 800 }}>{tok.slice(2, -2)}</strong>;
    }
    if (tok.startsWith("*") && tok.endsWith("*")) {
      return <em key={i} style={{ color: "var(--accent)", fontStyle: "italic" }}>{tok.slice(1, -1)}</em>;
    }
    return <span key={i}>{tok}</span>;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} style={{ height: "0.2rem" }} />;

        if (line.startsWith(">")) {
          return (
            <blockquote
              key={idx}
              style={{
                margin: "0.2rem 0",
                padding: "0.55rem 0.75rem",
                borderLeft: "3px solid #F59E0B",
                background: "rgba(245, 158, 11, 0.08)",
                borderRadius: "0 10px 10px 0",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.92)"
              }}
            >
              {renderInlineFormatting(line.replace(/^>\s*/, ""))}
            </blockquote>
          );
        }

        if (line.startsWith("### ") || line.startsWith("## ")) {
          return (
            <h4 key={idx} style={{ margin: "0.3rem 0 0 0", color: "var(--accent)", fontSize: "0.95rem", fontWeight: 800 }}>
              {renderInlineFormatting(line.replace(/^#{2,3}\s*/, ""))}
            </h4>
          );
        }

        if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
          return (
            <div key={idx} style={{ display: "flex", gap: "0.45rem", paddingLeft: "0.2rem" }}>
              <span style={{ color: "var(--primary)", fontWeight: 800 }}>
                {/^\d+\./.test(line) ? line.match(/^\d+\./)?.[0] : "•"}
              </span>
              <span style={{ flex: 1 }}>
                {renderInlineFormatting(line.replace(/^([-*]|\d+\.)\s*/, ""))}
              </span>
            </div>
          );
        }

        return <p key={idx} style={{ margin: 0 }}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

export default function Chat() {
  const router = useRouter();
  const {
    profile,
    currentMacros,
    targetMacros,
    waterGlasses,
    todayReadiness,
    customWorkoutPlan,
    streak,
    biometrics,
    dailySteps,
    stepsGoal,
    exercisePRs,
    workoutHistory,
    todaySocialBank,
    addFoodLog,
    addWater,
    adjustTargetCalories,
    saveWorkoutPlan,
    activateSocialBank,
    updateDailySteps,
    showToast,
    isLoaded
  } = useFitmax();

  const [messages, setMessages] = useState<Message[]>(DEFAULT_WELCOME);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("fitmax_chat_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore invalid stored chat
    }
    chatLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!chatLoadedRef.current) return;
    try {
      localStorage.setItem("fitmax_chat_messages", JSON.stringify(messages.slice(-40)));
    } catch {
      // ignore quota
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isLoaded) return null;

  const sendMessageText = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: textToSend.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 11000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          profile,
          currentMacros,
          targetMacros,
          waterGlasses,
          todayReadiness,
          customWorkoutPlan,
          streak,
          biometrics,
          dailySteps,
          stepsGoal,
          exercisePRs,
          recentWorkoutsCount: workoutHistory.slice(0, 7).length,
          todaySocialBank
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      const rawReply = data.response || data.error || "¡Aquí estoy! Cuéntame qué comiste o cómo te fue en tu entrenamiento hoy.";
      const { cleanText, action } = parseCoachReply(rawReply);

      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "coach",
        text: cleanText,
        action,
        actionApplied: false
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch {
      clearTimeout(timeoutId);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "coach",
        text: "Error de conexión temporal. Revisa tu internet e intenta de nuevo."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const applyAction = (msgId: string, action: CoachAction) => {
    if (action.type === "LOG_FOOD" && action.payload) {
      const p = Number(action.payload.protein) || 0;
      const c = Number(action.payload.carbs) || 0;
      const f = Number(action.payload.fats) || 0;
      const cal = Number(action.payload.calories) || p * 4 + c * 4 + f * 9;
      addFoodLog({
        id: Date.now().toString(),
        name: action.payload.name || "Alimento del Coach",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        macros: { protein: p, carbs: c, fats: f, calories: cal }
      });
    } else if (action.type === "ADD_WATER") {
      const count = Math.min(8, Math.max(1, Number(action.payload?.glasses) || 1));
      for (let i = 0; i < count; i++) addWater();
    } else if (action.type === "ADJUST_CALORIES") {
      const delta = Number(action.payload?.delta) || 0;
      adjustTargetCalories(delta, action.payload?.reason);
    } else if (action.type === "SWAP_EXERCISE" && customWorkoutPlan?.days) {
      const dayIdx = Number(action.payload?.dayIndex) || 0;
      const targetName = String(action.payload?.targetName || "").toLowerCase();
      const newEx = action.payload?.newExercise;
      if (newEx && customWorkoutPlan.days[dayIdx]) {
        const updatedPlan = {
          ...customWorkoutPlan,
          days: customWorkoutPlan.days.map((d: any, idx: number) => {
            if (idx !== dayIdx) return d;
            const exList = [...(d.exercises || [])];
            const matchIdx = exList.findIndex((ex: any) => ex.name.toLowerCase().includes(targetName));
            if (matchIdx >= 0) {
              exList[matchIdx] = newEx;
            } else {
              exList.push(newEx);
            }
            return { ...d, exercises: exList };
          })
        };
        saveWorkoutPlan(updatedPlan);
        showToast(`Rutina actualizada: ${newEx.name}`, "success");
      }
    } else if (action.type === "ACTIVATE_SOCIAL_BANK") {
      activateSocialBank(
        Number(action.payload?.reservedCalories) || 900,
        action.payload?.eventName || "Cena Social"
      );
    } else if (action.type === "SET_STEPS") {
      updateDailySteps(Number(action.payload?.steps) || 8000);
    }

    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, actionApplied: true } : m)));
  };

  const getActionLabel = (action: CoachAction) => {
    if (action.type === "LOG_FOOD") {
      return `Registrar "${action.payload?.name}" (${action.payload?.calories || 0} kcal)`;
    }
    if (action.type === "ADD_WATER") {
      return `Sumar ${action.payload?.glasses || 1} vasos de agua`;
    }
    if (action.type === "ADJUST_CALORIES") {
      const d = Number(action.payload?.delta) || 0;
      return `Ajustar meta diaria (${d > 0 ? "+" : ""}${d} kcal)`;
    }
    if (action.type === "SWAP_EXERCISE") {
      return `Cambiar ejercicio a "${action.payload?.newExercise?.name || "Nuevo"}"`;
    }
    if (action.type === "ACTIVATE_SOCIAL_BANK") {
      return `🛡️ Blindar ${action.payload?.reservedCalories || 900} kcal (${action.payload?.eventName || "Evento"})`;
    }
    if (action.type === "SET_STEPS") {
      return `👟 Registrar ${(Number(action.payload?.steps) || 8000).toLocaleString()} pasos hoy`;
    }
    return "Aplicar acción";
  };

  const clearChat = () => {
    setMessages(DEFAULT_WELCOME);
    localStorage.removeItem("fitmax_chat_messages");
    showToast("Conversación reiniciada", "warning");
  };

  return (
    <main className={styles.main}>
      <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className={styles.coachAvatar}>🤖</div>
          <div className={styles.headerInfo}>
            <h1 style={{ fontSize: "1.1rem" }}>Coach IA</h1>
            <p><span className={styles.statusDot}></span> Agente Activo</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <button
            onClick={() => router.push("/diet")}
            style={{
              background: "var(--primary-subtle)",
              color: "var(--primary)",
              border: "1px solid var(--primary-border)",
              padding: "0.35rem 0.6rem",
              borderRadius: "20px",
              fontSize: "0.74rem",
              fontWeight: "bold"
            }}
          >
            🍳 Chef
          </button>
          <button
            onClick={clearChat}
            title="Limpiar chat"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              padding: "0.35rem 0.5rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => router.push("/profile")}
            title="Perfil"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid var(--primary-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-dark)"
            }}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={15} color="var(--text-muted)" />
            )}
          </button>
        </div>
      </header>

      <div className={styles.chatContainer} style={{ paddingBottom: "165px" }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${styles.messageRow} ${styles[msg.sender]}`}
            style={{ flexDirection: "column", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}
          >
            <div className={styles.messageBubble}>
              {msg.sender === "coach" ? <MarkdownMessage content={msg.text} /> : msg.text}
            </div>

            {/* Agentic Action Card */}
            {msg.sender === "coach" && msg.action && (
              <div
                className="glass-card"
                style={{
                  marginTop: "0.5rem",
                  maxWidth: "82%",
                  padding: "0.85rem",
                  borderRadius: "14px",
                  border: "1px solid var(--accent-border)",
                  background: "var(--accent-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem"
                }}
              >
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Zap size={13} /> Acción Sugerida en Fitmax
                </span>
                <p style={{ margin: 0, fontSize: "0.84rem", color: "white", fontWeight: 600 }}>
                  {getActionLabel(msg.action)}
                </p>
                <button
                  disabled={msg.actionApplied}
                  onClick={() => applyAction(msg.id, msg.action!)}
                  style={{
                    padding: "0.55rem 0.85rem",
                    borderRadius: "10px",
                    background: msg.actionApplied ? "rgba(16, 185, 129, 0.2)" : "var(--accent)",
                    border: msg.actionApplied ? "1px solid #10b981" : "none",
                    color: msg.actionApplied ? "#10b981" : "#000",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem"
                  }}
                >
                  {msg.actionApplied ? <><Check size={14} /> ¡Aplicado en tu Cuenta!</> : <>⚡ Aplicar en Fitmax</>}
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.messageRow} ${styles.coach}`}>
            <div className={styles.messageBubble} style={{ backgroundColor: "transparent", border: "none" }}>
              <div className={styles.typingIndicator}>
                <motion.div className={styles.dot} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className={styles.dot} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className={styles.dot} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Input + Quick Prompt Chips */}
      <div
        style={{
          position: "fixed",
          bottom: "92px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "520px",
          zIndex: 20,
          backgroundColor: "var(--bg-surface-solid)",
          borderTop: "1px solid var(--border)"
        }}
      >
        <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", padding: "0.55rem 0.9rem 0.2rem" }}>
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessageText(q)}
              style={{
                flexShrink: 0,
                padding: "0.32rem 0.65rem",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "0.72rem",
                fontWeight: 600
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div className={styles.inputArea} style={{ position: "static", borderTop: "none", padding: "0.6rem 1rem 0.85rem" }}>
          <input
            type="text"
            className={styles.input}
            placeholder="Pregúntale o pídele una acción al Coach..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessageText(inputValue)}
          />
          <motion.button
            className={styles.sendButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessageText(inputValue)}
            disabled={!inputValue.trim() || isTyping}
          >
            ➤
          </motion.button>
        </div>
      </div>
    </main>
  );
}
