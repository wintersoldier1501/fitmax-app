"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FloatingScanner } from "./FloatingScanner";
import { Home, Dumbbell, Apple, MessageCircle } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();

  const showNav = [
    "/dashboard",
    "/workout",
    "/chat",
    "/profile",
    "/log",
    "/diet",
    "/diet/builder",
    "/science",
    "/grocery"
  ].includes(pathname);

  if (!showNav) return null;

  const isHomeActive = pathname === "/dashboard" || pathname === "/profile";
  const isWorkoutActive = pathname === "/workout" || pathname === "/science";
  const isNutritionActive =
    pathname === "/diet" ||
    pathname === "/log" ||
    pathname === "/grocery" ||
    pathname === "/diet/builder";
  const isCoachActive = pathname === "/chat";

  return (
    <motion.nav
      initial={{ y: 100, x: "-50%" }}
      animate={{ y: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        position: "fixed",
        bottom: "1.1rem",
        left: "50%",
        width: "92%",
        maxWidth: "460px",
        height: "68px",
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "var(--blur-lg)",
        WebkitBackdropFilter: "var(--blur-lg)",
        border: "1px solid var(--border)",
        borderRadius: "34px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 50,
        padding: "0 0.85rem"
      }}
    >
      <NavItem href="/dashboard" icon={<Home size={21} />} label="Inicio" isActive={isHomeActive} />
      <NavItem href="/workout" icon={<Dumbbell size={21} />} label="Entreno" isActive={isWorkoutActive} />

      <div style={{ width: "68px", display: "flex", justifyContent: "center", zIndex: 100 }}>
        <FloatingScanner />
      </div>

      <NavItem href="/diet" icon={<Apple size={21} />} label="Nutrición" isActive={isNutritionActive} />
      <NavItem href="/chat" icon={<MessageCircle size={21} />} label="Coach" isActive={isCoachActive} />
    </motion.nav>
  );
};

const NavItem = ({
  href,
  icon,
  label,
  isActive
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) => {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        width: "56px"
      }}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        style={{
          color: isActive ? "var(--primary)" : "var(--text-muted)",
          filter: isActive ? "drop-shadow(0 0 8px var(--primary-glow))" : "none",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {icon}
      </motion.div>
      <span
        style={{
          fontSize: "0.62rem",
          color: isActive ? "var(--primary)" : "var(--text-muted)",
          fontWeight: isActive ? 700 : 500,
          fontFamily: "var(--font-sans)"
        }}
      >
        {label}
      </span>
    </Link>
  );
};
