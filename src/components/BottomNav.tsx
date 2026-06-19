"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FloatingScanner } from "./FloatingScanner";
import { Home, MessageCircle, Apple, User } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();

  const showNav = ["/dashboard", "/chat", "/profile", "/log", "/diet", "/diet/builder", "/science", "/grocery"].includes(pathname);

  if (!showNav) return null;

  return (
    <motion.nav
      initial={{ y: 100, x: "-50%" }}
      animate={{ y: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        width: "90%",
        maxWidth: "400px",
        height: "70px",
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "var(--blur-lg)",
        WebkitBackdropFilter: "var(--blur-lg)",
        border: "1px solid var(--border)",
        borderRadius: "35px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 50,
        padding: "0 1rem"
      }}
    >
      <NavItem href="/dashboard" icon={<Home size={22} />} label="Inicio" isActive={pathname === "/dashboard"} />
      <NavItem href="/chat" icon={<MessageCircle size={22} />} label="Coach" isActive={pathname === "/chat"} />
      
      <div style={{ width: "70px", display: "flex", justifyContent: "center", zIndex: 100 }}>
        <FloatingScanner />
      </div>

      <NavItem href="/diet" icon={<Apple size={22} />} label="Nutrición" isActive={pathname === "/diet"} />
      <NavItem href="/profile" icon={<User size={22} />} label="Perfil" isActive={pathname === "/profile"} />
    </motion.nav>
  );
};

const NavItem = ({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) => {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "50px" }}>
      <motion.div
        whileTap={{ scale: 0.85 }}
        style={{
          color: isActive ? "var(--primary)" : "var(--text-muted)",
          filter: isActive ? "drop-shadow(0 0 8px var(--primary-glow))" : "none",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {icon}
      </motion.div>
      <span style={{ 
        fontSize: "0.6rem", 
        color: isActive ? "var(--primary)" : "var(--text-muted)", 
        fontWeight: isActive ? 700 : 500,
        fontFamily: "var(--font-sans)"
      }}>
        {label}
      </span>
    </Link>
  );
};
