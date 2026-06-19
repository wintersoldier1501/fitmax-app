"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import styles from "./profile.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import Link from "next/link";
import { Camera, Edit2, Settings, Lock, ChevronRight, User } from "lucide-react";

export default function Profile() {
  const { isLoaded, profile, biometrics, xp, activeTheme, updateAvatar, updateName, setProfileAndCalculate, saveTheme } = useFitmax();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  
  // Biometrics editing
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [metrics, setMetrics] = useState({ neck: "", waist: "", hip: "", height: "", weight: "" });

  useEffect(() => {
    if (isLoaded) {
      setMetrics({
        neck: profile.neck?.toString() || "",
        waist: profile.waist?.toString() || "",
        hip: profile.hip?.toString() || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || ""
      });
    }
  }, [isLoaded, profile]);

  if (!isLoaded) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateAvatar(base64String);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const startEditingName = () => {
    setTempName(profile.name || "Guerrero");
    setIsEditingName(true);
  };

  const saveName = () => {
    if (tempName.trim()) {
      updateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") setIsEditingName(false);
  };

  const saveMetrics = () => {
    setProfileAndCalculate({
      ...profile,
      neck: parseFloat(metrics.neck) || undefined,
      waist: parseFloat(metrics.waist) || undefined,
      hip: parseFloat(metrics.hip) || undefined,
      height: parseFloat(metrics.height) || profile.height,
      weight: parseFloat(metrics.weight) || profile.weight
    });
    setIsEditingMetrics(false);
  };

  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ paddingBottom: "6rem" }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Mi Perfil</h1>
      </header>

      <section className={styles.avatarContainer}>
        <input 
          type="file" 
          accept="image/*"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />
        <motion.div 
          className={styles.avatar} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer", backgroundColor: "var(--bg-surface-solid)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" />
          ) : (
            <User size={40} color="var(--text-muted)" />
          )}
          <div className={styles.editBadge}><Camera size={14} color="white" /></div>
        </motion.div>
        
        {isEditingName ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input 
              autoFocus
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={saveName}
              onKeyDown={handleKeyDown}
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                textAlign: "center",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "2px solid var(--primary)",
                color: "var(--text-main)",
                outline: "none",
                width: "150px",
                textTransform: "uppercase",
                fontFamily: "var(--font-display)"
              }}
            />
          </div>
        ) : (
          <h2 
            className={styles.userName} 
            onClick={startEditingName}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-display)" }}
          >
            {profile.name || "Guerrero"} <Edit2 size={16} color="var(--text-muted)" />
          </h2>
        )}
      </section>

      <section className={styles.statsGrid}>
        <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(24, 24, 27, 0.6))" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Grasa Corporal</span>
          <span style={{ color: "#00E5FF", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)" }}>
            {biometrics.bodyFatPercentage ? `${biometrics.bodyFatPercentage}%` : "-"}
          </span>
        </div>
        <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, rgba(255, 51, 102, 0.1), rgba(24, 24, 27, 0.6))" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Masa Magra</span>
          <span style={{ color: "var(--primary)", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)" }}>
            {biometrics.leanMass ? `${biometrics.leanMass} kg` : "-"}
          </span>
        </div>
        <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Peso Actual</span>
          <span style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)" }}>{profile.weight ? `${profile.weight} kg` : "-"}</span>
        </div>
        <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Objetivo</span>
          <span style={{ color: "white", fontSize: "0.9rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.4rem" }}>{profile.goal || "-"}</span>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.2rem", color: "white" }}>Medidas Corporales</h3>
          <button 
            onClick={() => isEditingMetrics ? saveMetrics() : setIsEditingMetrics(true)}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            {isEditingMetrics ? "Guardar" : <><Edit2 size={14} /> Editar</>}
          </button>
        </div>
        
        <div className={styles.statsGrid}>
          <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Estatura (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.height} onChange={e => setMetrics({...metrics, height: e.target.value})} style={{ width: "100%", marginTop: "0.5rem" }} />
            ) : (
              <span style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.5rem" }}>{profile.height || "-"}</span>
            )}
          </div>
          <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Peso (kg)</span>
            {isEditingMetrics ? (
              <input type="number" step="0.1" value={metrics.weight} onChange={e => setMetrics({...metrics, weight: e.target.value})} style={{ width: "100%", marginTop: "0.5rem" }} />
            ) : (
              <span style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.5rem" }}>{profile.weight || "-"}</span>
            )}
          </div>
          <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Cuello (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.neck} onChange={e => setMetrics({...metrics, neck: e.target.value})} style={{ width: "100%", marginTop: "0.5rem" }} />
            ) : (
              <span style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.5rem" }}>{profile.neck || "-"}</span>
            )}
          </div>
          <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Cintura (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.waist} onChange={e => setMetrics({...metrics, waist: e.target.value})} style={{ width: "100%", marginTop: "0.5rem" }} />
            ) : (
              <span style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.5rem" }}>{profile.waist || "-"}</span>
            )}
          </div>
          <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Cadera (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.hip} onChange={e => setMetrics({...metrics, hip: e.target.value})} style={{ width: "100%", marginTop: "0.5rem" }} />
            ) : (
              <span style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.5rem" }}>{profile.hip || "-"}</span>
            )}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", color: "white", marginBottom: "1rem" }}>Personalización (Rango & XP)</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Desbloquea nuevos colores para la aplicación entrenando y registrando tus comidas. Tienes <strong>{xp} XP</strong>.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Default Theme */}
          <div 
            className="glass-card"
            onClick={() => saveTheme("light")}
            style={{
              padding: "1rem",
              border: `2px solid ${activeTheme === "light" ? "#FF3366" : "var(--border)"}`,
              cursor: "pointer",
              textAlign: "center",
              background: activeTheme === "light" ? "rgba(255, 51, 102, 0.1)" : "var(--bg-surface)",
              transition: "all 0.3s"
            }}
          >
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#FF3366", margin: "0 auto 0.5rem", boxShadow: "0 0 10px rgba(255,51,102,0.5)" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>Base (Rojo)</span>
          </div>

          {/* Midnight Theme */}
          <div 
            className="glass-card"
            onClick={() => xp >= 200 ? saveTheme("midnight") : alert("Necesitas 200 XP (Rango Hierro II) para desbloquear este tema.")}
            style={{
              padding: "1rem",
              border: `2px solid ${activeTheme === "midnight" ? "#00E5FF" : "var(--border)"}`,
              cursor: xp >= 200 ? "pointer" : "not-allowed",
              textAlign: "center",
              opacity: xp >= 200 ? 1 : 0.5,
              background: activeTheme === "midnight" ? "rgba(0, 229, 255, 0.1)" : "var(--bg-surface)",
              transition: "all 0.3s"
            }}
          >
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#00E5FF", margin: "0 auto 0.5rem", boxShadow: "0 0 10px rgba(0,229,255,0.5)" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>Midnight</span>
            {xp < 200 && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Lock size={12} /> 200 XP</div>}
          </div>

          {/* Cyberpunk Theme */}
          <div 
            className="glass-card"
            onClick={() => xp >= 800 ? saveTheme("cyberpunk") : alert("Necesitas 800 XP (Rango Plata) para desbloquear este tema.")}
            style={{
              padding: "1rem",
              border: `2px solid ${activeTheme === "cyberpunk" ? "#B100FF" : "var(--border)"}`,
              cursor: xp >= 800 ? "pointer" : "not-allowed",
              textAlign: "center",
              opacity: xp >= 800 ? 1 : 0.5,
              background: activeTheme === "cyberpunk" ? "rgba(177, 0, 255, 0.1)" : "var(--bg-surface)",
              transition: "all 0.3s"
            }}
          >
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#B100FF", margin: "0 auto 0.5rem", boxShadow: "0 0 10px rgba(177,0,255,0.5)" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>Cyberpunk</span>
            {xp < 800 && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Lock size={12} /> 800 XP</div>}
          </div>
        </div>
      </section>

      <section>
        <Link href="/onboarding" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.2rem",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
          marginTop: "1rem"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}><Settings size={20} color="var(--primary)" /> Recalcular Macros (Cuestionario)</span>
          <ChevronRight size={20} />
        </Link>
      </section>

    </motion.main>
  );
}
