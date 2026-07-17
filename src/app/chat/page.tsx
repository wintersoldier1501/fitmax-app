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

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: userText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          profile,
          currentMacros,
          targetMacros
        })
      });

      const data = await res.json();
      
      const coachMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: "coach", 
        text: data.response || "Hubo un error al procesar mi respuesta." 
      };
      
      setMessages(prev => [...prev, coachMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: "coach", 
        text: "Error de conexión. Revisa tu internet e intenta de nuevo." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
