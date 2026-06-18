"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface MagneticButtonProps {
  children: React.ReactNode;
  href: string;
}

export const MagneticButton = ({ children, href }: MagneticButtonProps) => {
  const router = useRouter();
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleClick = () => {
    setIsNavigating(true);
    // Wait for the animation to cover the screen, then route
    setTimeout(() => {
      router.push(href);
    }, 1000); // Route after 1000ms
  };

  return (
    <>
      <motion.button
        ref={ref}
        onMouseMove={handleMouse}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={reset}
        onClick={handleClick}
        animate={{
          x: isHovered ? position.x * 0.2 : 0, // Move 20% towards the mouse
          y: isHovered ? position.y * 0.2 : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
        style={{
          backgroundColor: "var(--primary)",
          color: "white",
          fontSize: "1.1rem",
          fontWeight: 600,
          padding: "1rem 2.5rem",
          borderRadius: "50px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          border: "none",
          cursor: "pointer",
          position: "relative",
          zIndex: 10,
          boxShadow: isHovered
            ? "0 8px 30px rgba(230, 0, 0, 0.6)"
            : "0 4px 15px rgba(230, 0, 0, 0.4)",
        }}
      >
        {/* Breathing effect when not hovered */}
        {!isHovered && !isNavigating && (
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "50px",
              boxShadow: "0 0 20px var(--primary)",
              zIndex: -1,
            }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        
        {children}
      </motion.button>

      {/* Running Logo Transition Effect */}
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "var(--bg-dark)",
            zIndex: 9999, // Cover everything
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          {/* Base Logo (Empty State) */}
          <img
            src="/logo_transparent.png"
            alt="Loading Base"
            style={{ 
              width: "200px", 
              height: "auto", 
              filter: "grayscale(1) brightness(0.2)",
              position: "absolute"
            }}
          />

          {/* Filled Logo (Loading State) */}
          <motion.img
            src="/logo_transparent.png"
            alt="Loading Fill"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ 
              width: "200px", 
              height: "auto", 
              filter: "drop-shadow(0 0 20px rgba(230,0,0,0.8))",
              position: "absolute"
            }}
          />
        </motion.div>
      )}
    </>
  );
};
