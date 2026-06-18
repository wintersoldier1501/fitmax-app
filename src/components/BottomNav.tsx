"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FloatingScanner } from "./FloatingScanner";

export const BottomNav = () => {
  const pathname = usePathname();

  const showNav = ["/dashboard", "/chat", "/profile", "/log", "/diet", "/diet/builder", "/science", "/grocery"].includes(pathname);

  if (!showNav) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "70px",
        backgroundColor: "rgba(18, 18, 18, 0.8)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
        padding: "0 1rem"
      }}
    >
      <NavItem href="/dashboard" icon="🏠" label="Inicio" isActive={pathname === "/dashboard"} />
      <NavItem href="/chat" icon="💬" label="Coach" isActive={pathname === "/chat"} />
      
      <div style={{ width: "70px", display: "flex", justifyContent: "center", zIndex: 100 }}>
        <FloatingScanner />
      </div>

      <NavItem href="/diet" icon="🥗" label="Nutrición" isActive={pathname === "/diet"} />
      <NavItem href="/profile" icon="👤" label="Perfil" isActive={pathname === "/profile"} />
    </motion.nav>
  );
};

const NavItem = ({ href, icon, label, isActive }: { href: string; icon: string; label: string; isActive: boolean }) => {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <motion.div
        whileTap={{ scale: 0.9 }}
        style={{
          fontSize: "1.5rem",
          color: isActive ? "var(--primary)" : "var(--text-muted)",
          filter: isActive ? "drop-shadow(0 0 8px rgba(255, 69, 0, 0.5))" : "none",
          transition: "all 0.3s ease"
        }}
      >
        {icon}
      </motion.div>
      <span style={{ 
        fontSize: "0.65rem", 
        color: isActive ? "var(--primary)" : "var(--text-muted)", 
        fontWeight: isActive ? 700 : 500,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        {label}
      </span>
    </Link>
  );
};
