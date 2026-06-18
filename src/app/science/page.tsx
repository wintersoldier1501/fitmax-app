"use client";

import { motion } from "framer-motion";
import styles from "./science.module.css";

export default function SciencePage() {
  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Ciencia y Protocolos</h1>
        <p className={styles.subtitle}>El motor científico detrás de Fitmax</p>
      </header>

      <section className={styles.moduleCard}>
        <div className={styles.moduleHeader}>
          <span className={styles.moduleIcon}>🧬</span>
          <h2 className={styles.moduleTitle}>Interferencia Concurrente</h2>
        </div>
        <p className={styles.moduleText}>
          Correr activa la vía <strong>AMPK</strong> (resistencia), mientras que levantar pesas activa la vía <strong>mTOR</strong> (hipertrofia). Estas vías son biológicamente incompatibles al mismo tiempo.
        </p>
        <div className={styles.scienceAlert}>
          <span className={styles.scienceAlertTitle}>Protocolo Óptimo:</span>
          Si corres 5km, hazlo en un día separado de tu sesión de pesas o con al menos <strong>6 horas de separación</strong>. Si debes hacerlo en la misma sesión, <strong>NUNCA</strong> corras antes de las pesas, o agotarás el glucógeno necesario para la fuerza.
        </div>
      </section>

      <section className={styles.moduleCard}>
        <div className={styles.moduleHeader}>
          <span className={styles.moduleIcon}>⚖️</span>
          <h2 className={styles.moduleTitle}>Volumen Semanal (RIR)</h2>
        </div>
        <p className={styles.moduleText}>
          La ciencia actual (Schoenfeld, 2021) dicta que el volumen óptimo es de <strong>10 a 20 series efectivas semanales</strong> por grupo muscular.
        </p>
        <p className={styles.moduleText}>
          No llegues al fallo en cada serie. Utiliza la metodología <strong>RIR (Reps in Reserve) 1-3</strong>. Detente 2 repeticiones antes de que no puedas más. Esto maximiza la hipertrofia sin freír tu sistema nervioso central (crucial si además corres 15km semanales).
        </p>
      </section>

      <section className={styles.moduleCard}>
        <div className={styles.moduleHeader}>
          <span className={styles.moduleIcon}>💊</span>
          <h2 className={styles.moduleTitle}>Suplementación Grado A</h2>
        </div>
        <p className={styles.moduleText} style={{ marginBottom: "1.5rem" }}>
          Suplementos con evidencia científica irrefutable para la recomposición corporal y rendimiento concurrente.
        </p>
        
        <div className={styles.supplementGrid}>
          <div className={styles.suppCard}>
            <span className={styles.suppIcon}>⚡</span>
            <div className={styles.suppInfo}>
              <h4>Creatina Monohidrato</h4>
              <p>El suplemento más estudiado del mundo. Mejora la fuerza, potencia y resíntesis de ATP.</p>
              <span className={styles.suppDose}>Dosis: 5g diarios (Toda la vida)</span>
            </div>
          </div>

          <div className={styles.suppCard}>
            <span className={styles.suppIcon}>🥤</span>
            <div className={styles.suppInfo}>
              <h4>Proteína Whey (Aislada)</h4>
              <p>Alta biodisponibilidad y rica en leucina. Ideal para alcanzar los 2.0g/kg de proteína diarios.</p>
              <span className={styles.suppDose}>Dosis: 30-40g Post-Entreno</span>
            </div>
          </div>

          <div className={styles.suppCard}>
            <span className={styles.suppIcon}>☕</span>
            <div className={styles.suppInfo}>
              <h4>Cafeína Anhidra</h4>
              <p>Retrasa la fatiga del sistema nervioso central. Excelente para los días que combinas running y pesas.</p>
              <span className={styles.suppDose}>Dosis: 3-6mg/kg (45 min antes)</span>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
