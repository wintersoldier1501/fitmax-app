"use client";

import { motion } from "framer-motion";
import styles from "./profile.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

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
    // ... [code unchanged]
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
    >
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backButton}>←</Link>
        <h1 className={styles.title}>Mi Perfil</h1>
      </header>

      <section className={styles.avatarContainer}>
        {/* Avatar stuff... */}
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
          style={{ cursor: "pointer" }}
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" />
          ) : (
            "👤"
          )}
          <div className={styles.editBadge}>EDITAR</div>
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
                textTransform: "uppercase"
              }}
            />
          </div>
        ) : (
          <h2 
            className={styles.userName} 
            onClick={startEditingName}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {profile.name || "Guerrero"} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>✏️</span>
          </h2>
        )}
      </section>

      <section className={styles.statsGrid}>
        <div className={styles.statCard} style={{ background: "linear-gradient(135deg, rgba(0, 229, 255, 0.1), transparent)" }}>
          <span className={styles.statLabel}>Grasa Corporal (US Navy)</span>
          <span className={styles.statValue} style={{ color: "#00E5FF" }}>
            {biometrics.bodyFatPercentage ? `${biometrics.bodyFatPercentage}%` : "Faltan Medidas"}
          </span>
        </div>
        <div className={styles.statCard} style={{ background: "linear-gradient(135deg, rgba(255, 0, 85, 0.1), transparent)" }}>
          <span className={styles.statLabel}>Masa Magra</span>
          <span className={styles.statValue} style={{ color: "var(--primary)" }}>
            {biometrics.leanMass ? `${biometrics.leanMass} kg` : "-"}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Peso Actual</span>
          <span className={styles.statValue}>{profile.weight ? `${profile.weight} kg` : "-"}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Objetivo</span>
          <span className={styles.statValue} style={{ fontSize: "1rem" }}>{profile.goal || "-"}</span>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.2rem", color: "white" }}>Medidas Corporales</h3>
          <button 
            onClick={() => isEditingMetrics ? saveMetrics() : setIsEditingMetrics(true)}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}
          >
            {isEditingMetrics ? "Guardar" : "✏️ Editar"}
          </button>
        </div>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Estatura (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.height} onChange={e => setMetrics({...metrics, height: e.target.value})} style={{ width: "100%", background: "var(--bg-dark)", border: "1px solid var(--border)", color: "white", padding: "0.5rem", borderRadius: "8px", marginTop: "0.5rem" }} />
            ) : (
              <span className={styles.statValue}>{profile.height || "-"}</span>
            )}
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Peso (kg)</span>
            {isEditingMetrics ? (
              <input type="number" step="0.1" value={metrics.weight} onChange={e => setMetrics({...metrics, weight: e.target.value})} style={{ width: "100%", background: "var(--bg-dark)", border: "1px solid var(--border)", color: "white", padding: "0.5rem", borderRadius: "8px", marginTop: "0.5rem" }} />
            ) : (
              <span className={styles.statValue}>{profile.weight || "-"}</span>
            )}
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Cuello (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.neck} onChange={e => setMetrics({...metrics, neck: e.target.value})} style={{ width: "100%", background: "var(--bg-dark)", border: "1px solid var(--border)", color: "white", padding: "0.5rem", borderRadius: "8px", marginTop: "0.5rem" }} />
            ) : (
              <span className={styles.statValue}>{profile.neck || "-"}</span>
            )}
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Cintura (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.waist} onChange={e => setMetrics({...metrics, waist: e.target.value})} style={{ width: "100%", background: "var(--bg-dark)", border: "1px solid var(--border)", color: "white", padding: "0.5rem", borderRadius: "8px", marginTop: "0.5rem" }} />
            ) : (
              <span className={styles.statValue}>{profile.waist || "-"}</span>
            )}
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Cadera (cm)</span>
            {isEditingMetrics ? (
              <input type="number" value={metrics.hip} onChange={e => setMetrics({...metrics, hip: e.target.value})} style={{ width: "100%", background: "var(--bg-dark)", border: "1px solid var(--border)", color: "white", padding: "0.5rem", borderRadius: "8px", marginTop: "0.5rem" }} />
            ) : (
              <span className={styles.statValue}>{profile.hip || "-"}</span>
            )}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", color: "white", marginBottom: "1rem" }}>🎨 Personalización (Rango & XP)</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Desbloquea nuevos colores para la aplicación entrenando y registrando tus comidas. Tienes <strong>{xp} XP</strong>.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Default Theme */}
          <div 
            onClick={() => saveTheme("light")}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              border: `2px solid ${activeTheme === "light" ? "#FF0055" : "var(--border)"}`,
              background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#FF0055", margin: "0 auto 0.5rem" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>Base (Rojo)</span>
          </div>

          {/* Midnight Theme (Unlocks at 200 XP) */}
          <div 
            onClick={() => xp >= 200 ? saveTheme("midnight") : alert("Necesitas 200 XP (Rango Hierro II) para desbloquear este tema.")}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              border: `2px solid ${activeTheme === "midnight" ? "#00E5FF" : "var(--border)"}`,
              background: "linear-gradient(135deg, #0B192C, #050B14)",
              cursor: xp >= 200 ? "pointer" : "not-allowed",
              textAlign: "center",
              opacity: xp >= 200 ? 1 : 0.5
            }}
          >
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#00E5FF", margin: "0 auto 0.5rem" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>Midnight</span>
            {xp < 200 && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>🔒 200 XP</div>}
          </div>

          {/* Cyberpunk Theme (Unlocks at 800 XP) */}
          <div 
            onClick={() => xp >= 800 ? saveTheme("cyberpunk") : alert("Necesitas 800 XP (Rango Plata) para desbloquear este tema.")}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              border: `2px solid ${activeTheme === "cyberpunk" ? "#B100FF" : "var(--border)"}`,
              background: "linear-gradient(135deg, #25003e, #12001c)",
              cursor: xp >= 800 ? "pointer" : "not-allowed",
              textAlign: "center",
              opacity: xp >= 800 ? 1 : 0.5
            }}
          >
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#B100FF", margin: "0 auto 0.5rem" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>Cyberpunk</span>
            {xp < 800 && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>🔒 800 XP</div>}
          </div>
        </div>
      </section>

      <section>
        <Link href="/onboarding" className={styles.actionButton}>
          <span>⚙️ Recalcular Macros (Nuevo Cuestionario)</span>
          <span>→</span>
        </Link>
      </section>

    </motion.main>
  );
}
