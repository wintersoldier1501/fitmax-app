"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import styles from "./profile.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { ProgressCharts } from "@/components/ProgressCharts";
import { MuscleMap } from "@/components/MuscleMap";
import { PhysiqueVault } from "@/components/PhysiqueVault";
import { TrophyVault } from "@/components/TrophyVault";
import { NotificationSettingsCard } from "@/components/PwaInstallBanner";
import Link from "next/link";
import { Camera, Edit2, Settings, Lock, ChevronRight, User, BarChart2, Sliders, Trophy } from "lucide-react";

const THEMES = [
  { id: "light", label: "Obsidian Crimson", color: "#FF3366", reqXp: 0, rank: "Inicial" },
  { id: "ember", label: "Solaris Orange", color: "#FF4500", reqXp: 100, rank: "100 XP" },
  { id: "midnight", label: "Midnight Cyan", color: "#00E5FF", reqXp: 200, rank: "200 XP" },
  { id: "cyberpunk", label: "Cyberpunk Neon", color: "#B100FF", reqXp: 600, rank: "600 XP" },
  { id: "imperial", label: "Imperial Gold 40K", color: "#F59E0B", reqXp: 1000, rank: "1000 XP" }
];

export default function Profile() {
  const {
    isLoaded,
    profile,
    biometrics,
    xp,
    activeTheme,
    updateAvatar,
    updateName,
    setProfileAndCalculate,
    saveTheme,
    user,
    loginWithGoogle,
    logout,
    showToast
  } = useFitmax();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"analytics" | "physique" | "settings">("analytics");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
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
        updateAvatar(reader.result as string);
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
    showToast("Biometría y macros actualizados", "success");
  };

  return (
    <motion.main
      className={styles.main}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ paddingBottom: "7rem" }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Mi Perfil & Evolución</h1>
      </header>

      <section className={styles.avatarContainer}>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: "none" }} />
        <motion.div
          className={styles.avatar}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            cursor: "pointer",
            backgroundColor: "var(--bg-surface-solid)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {profile.avatar ? <img src={profile.avatar} alt="Avatar" /> : <User size={40} color="var(--text-muted)" />}
          <div className={styles.editBadge}>
            <Camera size={14} color="white" />
          </div>
        </motion.div>

        {isEditingName ? (
          <input
            autoFocus
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={saveName}
            onKeyDown={handleKeyDown}
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              textAlign: "center",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "2px solid var(--primary)",
              borderRadius: 0,
              color: "var(--text-main)",
              width: "180px",
              textTransform: "uppercase",
              fontFamily: "var(--font-display)"
            }}
          />
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

      {/* 3-Tab Segmented Navigation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.35rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "0.3rem"
        }}
      >
        <button
          onClick={() => setTab("analytics")}
          style={{
            padding: "0.55rem 0.3rem",
            borderRadius: "10px",
            fontSize: "0.75rem",
            fontWeight: tab === "analytics" ? 800 : 600,
            background: tab === "analytics" ? "var(--primary)" : "transparent",
            color: tab === "analytics" ? "white" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem"
          }}
        >
          <BarChart2 size={14} /> Evolución
        </button>
        <button
          onClick={() => setTab("physique")}
          style={{
            padding: "0.55rem 0.3rem",
            borderRadius: "10px",
            fontSize: "0.75rem",
            fontWeight: tab === "physique" ? 800 : 600,
            background: tab === "physique" ? "var(--primary)" : "transparent",
            color: tab === "physique" ? "white" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem"
          }}
        >
          <Trophy size={14} /> Físico & Logros
        </button>
        <button
          onClick={() => setTab("settings")}
          style={{
            padding: "0.55rem 0.3rem",
            borderRadius: "10px",
            fontSize: "0.75rem",
            fontWeight: tab === "settings" ? 800 : 600,
            background: tab === "settings" ? "var(--primary)" : "transparent",
            color: tab === "settings" ? "white" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem"
          }}
        >
          <Sliders size={14} /> Ajustes
        </button>
      </div>

      {tab === "analytics" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <ProgressCharts />
          <MuscleMap />
        </div>
      ) : tab === "physique" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <PhysiqueVault />
          <TrophyVault />
        </div>
      ) : (
        <>
          <section className={styles.statsGrid}>
            <div className="glass-card" style={{ padding: "1.1rem", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, var(--accent-subtle), var(--bg-surface-solid))" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.35rem" }}>Grasa Corporal</span>
              <span style={{ color: "var(--accent)", fontSize: "1.45rem", fontWeight: "bold", fontFamily: "var(--font-display)" }}>
                {biometrics.bodyFatPercentage ? `${biometrics.bodyFatPercentage}%` : "-"}
              </span>
            </div>
            <div className="glass-card" style={{ padding: "1.1rem", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, var(--primary-subtle), var(--bg-surface-solid))" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.35rem" }}>Masa Magra</span>
              <span style={{ color: "var(--primary)", fontSize: "1.45rem", fontWeight: "bold", fontFamily: "var(--font-display)" }}>
                {biometrics.leanMass ? `${biometrics.leanMass} kg` : "-"}
              </span>
            </div>
            <div className="glass-card" style={{ padding: "1.1rem", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.35rem" }}>Peso Actual</span>
              <span style={{ color: "white", fontSize: "1.45rem", fontWeight: "bold", fontFamily: "var(--font-display)" }}>
                {profile.weight ? `${profile.weight} kg` : "-"}
              </span>
            </div>
            <div className="glass-card" style={{ padding: "1.1rem", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.35rem" }}>Objetivo</span>
              <span style={{ color: "white", fontSize: "0.88rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.3rem" }}>
                {profile.goal || "-"}
              </span>
            </div>
          </section>

          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "white" }}>Medidas Corporales (US Navy)</h3>
                {profile.sex === "M" && (
                  <p style={{ fontSize: "0.74rem", color: "var(--accent)", margin: "0.15rem 0 0 0" }}>
                    En mujeres, ingresa Cuello, Cintura y Cadera para cálculo exacto.
                  </p>
                )}
              </div>
              <button
                onClick={() => (isEditingMetrics ? saveMetrics() : setIsEditingMetrics(true))}
                style={{ color: "var(--primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                {isEditingMetrics ? "Guardar" : <><Edit2 size={14} /> Editar</>}
              </button>
            </div>

            <div className={styles.statsGrid}>
              {[
                { key: "height", label: "Estatura (cm)", val: profile.height },
                { key: "weight", label: "Peso (kg)", val: profile.weight, step: "0.1" },
                { key: "neck", label: "Cuello (cm)", val: profile.neck },
                { key: "waist", label: "Cintura (cm)", val: profile.waist },
                { key: "hip", label: "Cadera (cm)", val: profile.hip }
              ].map((m) => (
                <div key={m.key} className="glass-card" style={{ padding: "1.05rem", display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{m.label}</span>
                  {isEditingMetrics ? (
                    <input
                      type="number"
                      step={m.step || "1"}
                      value={(metrics as any)[m.key]}
                      onChange={(e) => setMetrics({ ...metrics, [m.key]: e.target.value })}
                      style={{ width: "100%", marginTop: "0.45rem", padding: "0.55rem" }}
                    />
                  ) : (
                    <span style={{ color: "white", fontSize: "1.35rem", fontWeight: "bold", fontFamily: "var(--font-display)", marginTop: "0.4rem" }}>
                      {m.val || "-"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: "1.1rem", color: "white", marginBottom: "0.5rem" }}>Temas Obsidian Carbon ({xp} XP)</h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: "0.9rem" }}>
              Sube de rango entrenando y registrando comidas para desbloquear estéticas exclusivas.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {THEMES.map((t) => {
                const unlocked = xp >= t.reqXp;
                const isSelected = activeTheme === t.id;
                return (
                  <div
                    key={t.id}
                    className="glass-card"
                    onClick={() =>
                      unlocked
                        ? saveTheme(t.id)
                        : showToast(`Necesitas ${t.reqXp} XP para desbloquear ${t.label}`, "warning")
                    }
                    style={{
                      padding: "0.95rem",
                      border: isSelected ? `2px solid ${t.color}` : "1px solid var(--border)",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      textAlign: "center",
                      opacity: unlocked ? 1 : 0.48,
                      background: isSelected ? `${t.color}1A` : "var(--bg-surface)"
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: t.color,
                        margin: "0 auto 0.45rem",
                        boxShadow: `0 0 12px ${t.color}99`
                      }}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "white", display: "block" }}>{t.label}</span>
                    {!unlocked && (
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.3rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        <Lock size={11} /> {t.rank}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <NotificationSettingsCard />

          <section>
            <h3 style={{ fontSize: "1.1rem", color: "white", marginBottom: "0.75rem" }}>Sincronización en la Nube</h3>
            <div className="glass-card" style={{ padding: "1.3rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {user ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                    <img src={user.photoURL || ""} alt="Google Avatar" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                    <div>
                      <p style={{ color: "white", fontWeight: "bold", margin: 0 }}>{user.displayName}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: 0 }}>{user.email}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--accent)", margin: 0 }}>
                    Tus macros, rutinas, PRs e historial están sincronizados en tiempo real.
                  </p>
                  <button
                    onClick={logout}
                    style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "0.75rem", borderRadius: "10px", fontWeight: "bold" }}
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", margin: 0 }}>
                    Inicia sesión con Google para respaldar tu historial, rachas y récords entre dispositivos.
                  </p>
                  <button
                    onClick={loginWithGoogle}
                    style={{
                      background: "white",
                      color: "black",
                      padding: "0.9rem",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                  >
                    Continuar con Google
                  </button>
                </>
              )}
            </div>
          </section>

          <section>
            <Link
              href="/onboarding"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.1rem",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                color: "white",
                fontWeight: "bold"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Settings size={19} color="var(--primary)" /> Recalibrar Macros (Cuestionario)
              </span>
              <ChevronRight size={19} />
            </Link>
          </section>
        </>
      )}
    </motion.main>
  );
}
