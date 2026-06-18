"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const HeroLogo = () => {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 180, height: 180, marginBottom: "2rem" }}>
      {/* Background Pulse Glow */}
      <motion.div
        style={{
          position: "absolute",
          width: "140%",
          height: "140%",
          borderRadius: "50%",
          zIndex: -1,
          pointerEvents: "none",
          background: "radial-gradient(circle, rgba(230,0,0,0.15) 0%, transparent 60%)",
        }}
        animate={{
          scale: [0.8, 1.2],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Logo with Materialization Reveal */}
      <motion.div
        initial={{ 
          clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", 
          filter: "brightness(2) drop-shadow(0 0 20px rgba(230,0,0,1))" 
        }}
        animate={{ 
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          filter: "brightness(1) drop-shadow(0 15px 25px rgba(230, 0, 0, 0.5))"
        }}
        transition={{
          duration: 1.5,
          ease: [0.25, 1, 0.5, 1], // Custom cubic bezier for energetic sweep
        }}
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5, // Start floating after materialization
          }}
        >
          <Image
            src="/logo_transparent.png"
            alt="Fitmax Logo"
            width={180}
            height={180}
            priority
          />
        </motion.div>
      </motion.div>

      {/* Shockwave effect */}
      <motion.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "2px solid var(--primary)",
          zIndex: -1,
          pointerEvents: "none",
        }}
        initial={{ scale: 1, opacity: 0.8, borderWidth: "3px" }}
        animate={{ scale: 2.2, opacity: 0, borderWidth: "0px" }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1, // Start a bit after load
        }}
      />
    </div>
  );
};
