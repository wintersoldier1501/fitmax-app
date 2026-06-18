"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";
import { useFitmax } from "@/context/FitmaxContext";

interface Message {
  id: string;
  sender: "user" | "coach";
  text: string;
}

export default function Chat() {
  const { profile, currentMacros, targetMacros, isLoaded } = useFitmax();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "coach",
      text: "¡Hola! Soy tu Coach de IA. Estoy aquí para ayudarte a alcanzar tu meta. ¿En qué te puedo ayudar hoy?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isLoaded) return null;

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and generating a response based on context
    setTimeout(() => {
      const responseText = generateSimulatedResponse(userMessage.text.toLowerCase());
      const coachMessage: Message = { id: (Date.now() + 1).toString(), sender: "coach", text: responseText };
      
      setMessages(prev => [...prev, coachMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const generateSimulatedResponse = (text: string) => {
    if (text.includes("proteina") || text.includes("proteína") || text.includes("falta")) {
      const remainingProtein = targetMacros.protein - currentMacros.protein;
      if (remainingProtein > 0) {
        return `Veo en tu registro que te faltan ${remainingProtein}g de proteína para llegar a tu meta hoy. Te recomiendo cenar algo como atún o claras de huevo.`;
      } else {
        return "¡Ya cumpliste tu meta de proteína de hoy! Excelente trabajo, tus músculos lo agradecerán.";
      }
    }

    if (text.includes("calorias") || text.includes("calorías") || text.includes("comido")) {
      return `Has consumido ${currentMacros.calories} kcal de tu meta de ${targetMacros.calories} kcal. ¡Vas por buen camino!`;
    }

    if (text.includes("rutina") || text.includes("ejercicio") || text.includes("entrenar")) {
      if (profile.goal === "Perder Grasa") {
        return "Para tu objetivo de perder grasa, te sugiero 40 min de pesas intensas seguido de 20 min de cardio LISS (caminar con inclinación). ¿Quieres que te arme la rutina exacta?";
      } else {
        return "Para subir limpio, enfócate en hipertrofia. 4 series de 8-10 repeticiones pesadas en ejercicios compuestos (Sentadilla, Press de Banca).";
      }
    }

    // Default generic smart response
    return `¡Entendido, ${profile.name || "Guerrero"}! Recuerda que tu objetivo principal es ${profile.goal}. Sigue registrando tus comidas con el escáner y llegaremos ahí juntos. ¿Tienes alguna otra duda?`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <main className={styles.main}>
      <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className={styles.coachAvatar}>🤖</div>
          <div className={styles.headerInfo}>
            <h1>Coach IA</h1>
            <p><span className={styles.statusDot}></span> En línea</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = "/science"}
          style={{ 
            background: "rgba(0, 229, 255, 0.1)", 
            color: "#00E5FF", 
            border: "1px solid #00E5FF", 
            padding: "0.4rem 0.8rem", 
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🧬 Protocolos
        </button>
      </header>

      <div className={styles.chatContainer}>
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${styles.messageRow} ${styles[msg.sender]}`}
          >
            <div className={styles.messageBubble}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${styles.messageRow} ${styles.coach}`}
          >
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

      <div className={styles.inputArea}>
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Pregúntale a tu Coach..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <motion.button 
          className={styles.sendButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
        >
          ➤
        </motion.button>
      </div>
    </main>
  );
}
