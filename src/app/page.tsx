import styles from "./page.module.css";
import { HeroLogo } from "@/components/HeroLogo";
import { StaggeredText } from "@/components/StaggeredText";
import { MagneticButton } from "@/components/MagneticButton";

export default function Home() {
  return (
    <main className={styles.main}>
      <HeroLogo />

      <StaggeredText text="FITMAX" className={styles.title} delay={0.8} />
      
      <p className={styles.subtitle} style={{ animation: "fadeIn 1s ease-out 1.5s both" }}>
        Tu entrenador personal impulsado por IA. Entrena más inteligentemente, come mejor y sube de nivel en tu vida.
      </p>

      <div style={{ animation: "fadeIn 1s ease-out 2s both" }}>
        <MagneticButton href="/onboarding">
          Comenzar Entrenamiento
        </MagneticButton>
      </div>

    </main>
  );
}
