"use client";

import styles from "./page.module.css";
import { HeroLogo } from "@/components/HeroLogo";
import { StaggeredText } from "@/components/StaggeredText";
import { MagneticButton } from "@/components/MagneticButton";
import { useFitmax } from "@/context/FitmaxContext";
import Link from "next/link";

export default function Home() {
  const { isLoaded, profile, streak, xp } = useFitmax();
  const hasProfile = isLoaded && Boolean(profile.name) && profile.weight > 0;

  return (
    <main className={styles.main}>
      <HeroLogo />

      <StaggeredText text="FITMAX" className={styles.title} delay={0.8} />

      {hasProfile ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.4rem",
            animation: "fadeIn 0.8s ease-out 1.1s both"
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              background: "var(--primary-subtle)",
              border: "1px solid var(--primary-border)",
              color: "var(--text-main)",
              fontSize: "0.88rem",
              fontWeight: 700
            }}
          >
            <span>Hola de nuevo, {profile.name}</span>
            <span style={{ color: "var(--primary)" }}>•</span>
            <span>🔥 {streak} días</span>
            <span style={{ color: "var(--primary)" }}>•</span>
            <span style={{ color: "var(--accent)" }}>{xp} XP</span>
          </div>

          <p className={styles.subtitle} style={{ marginBottom: "0.5rem" }}>
            Tu centro de hipertrofia científica, nutrición multimodal y mentalidad inquebrantable te espera.
          </p>

          <MagneticButton href="/dashboard">
            Entrar al Dashboard
          </MagneticButton>

          <Link
            href="/onboarding"
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              textDecoration: "underline",
              marginTop: "0.4rem"
            }}
          >
            Recalibrar metas y biometría
          </Link>
        </div>
      ) : (
        <>
          <p className={styles.subtitle} style={{ animation: "fadeIn 1s ease-out 1.5s both" }}>
            Tu entrenador personal impulsado por IA. Entrena más inteligentemente, come mejor y sube de nivel en tu vida.
          </p>

          <div style={{ animation: "fadeIn 1s ease-out 2s both" }}>
            <MagneticButton href="/onboarding">
              Comenzar Entrenamiento
            </MagneticButton>
          </div>
        </>
      )}
    </main>
  );
}
