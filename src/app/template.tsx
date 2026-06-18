"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Red flash reveal to seamlessly match the ripple from the previous screen */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "var(--bg-dark)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
      {children}
    </motion.div>
  );
}
