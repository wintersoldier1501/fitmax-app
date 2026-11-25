"use client";

import { useState, useEffect } from "react";
import { Smartphone, X, Download, Bell, Check } from "lucide-react";
import { useFitmax } from "@/context/FitmaxContext";

export function PwaInstallBanner() {
  const { showToast } = useFitmax();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    const wasDismissed = localStorage.getItem("fitmax_pwa_dismissed") === "1";

    if (isStandalone || wasDismissed) {
      setDismissed(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDetected);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // On iOS Safari show manual install guide banner
    if (iosDetected) {
      setDismissed(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        showToast("¡Fitmax instalado en tu pantalla!", "success");
      }
      setDeferredPrompt(null);
      setDismissed(true);
    } else if (isIOS) {
      showToast("En Safari toca 'Compartir' (↑) y luego 'Agregar a inicio'", "xp");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("fitmax_pwa_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "0.85rem 1rem",
        borderRadius: "14px",
        border: "1px solid var(--accent-border)",
        background: "linear-gradient(135deg, var(--accent-subtle), rgba(15,23,42,0.75))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.7rem"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1 }}>
        <Smartphone size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "white" }}>
            Instala Fitmax como App Nativa
          </p>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {isIOS ? "Safari: Compartir → Agregar a Inicio" : "Acceso directo en pantalla completa"}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            style={{
              padding: "0.4rem 0.7rem",
              borderRadius: "8px",
              background: "var(--accent)",
              color: "#000",
              fontSize: "0.74rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem"
            }}
          >
            <Download size={13} /> Instalar
          </button>
        )}
        <button onClick={handleDismiss} style={{ color: "var(--text-muted)", padding: "0.2rem" }} title="Cerrar">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function NotificationSettingsCard() {
  const { showToast } = useFitmax();
  const [perm, setPerm] = useState<string>("default");
  const [reminders, setReminders] = useState({ hydration: true, creatine: true, macros: true });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPerm(Notification.permission);
    }
    try {
      const saved = localStorage.getItem("fitmax_reminders");
      if (saved) setReminders(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleRem = (k: keyof typeof reminders) => {
    const next = { ...reminders, [k]: !reminders[k] };
    setReminders(next);
    localStorage.setItem("fitmax_reminders", JSON.stringify(next));
  };

  const requestNotifPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Notificaciones no soportadas en este dispositivo", "warning");
      return;
    }
    const res = await Notification.requestPermission();
    setPerm(res);
    if (res === "granted") {
      new Notification("Fitmax Activado 🔥", {
        body: "Recordatorios inteligentes listos: creatina, hidratación y cierre de macros."
      });
      showToast("Recordatorios inteligentes activados", "success");
    } else {
      showToast("Permiso de notificaciones denegado en navegador", "warning");
    }
  };

  return (
    <section>
      <h3 style={{ fontSize: "1.1rem", color: "white", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
        <Bell size={18} color="var(--accent)" /> Recordatorios Inteligentes
      </h3>
      <div className="glass-card" style={{ padding: "1.15rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { key: "creatine", label: "💊 Creatina 5g" },
            { key: "hydration", label: "💧 Hidratación" },
            { key: "macros", label: "🌙 Cierre Macros" }
          ].map((item) => {
            const active = (reminders as any)[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleRem(item.key as any)}
                style={{
                  padding: "0.4rem 0.7rem",
                  borderRadius: "8px",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                  background: active ? "var(--accent-subtle)" : "var(--bg-dark)",
                  color: active ? "var(--accent)" : "var(--text-muted)"
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={requestNotifPermission}
          style={{
            padding: "0.8rem",
            borderRadius: "10px",
            background: perm === "granted" ? "rgba(16,185,129,0.14)" : "var(--primary-subtle)",
            border: perm === "granted" ? "1px solid #10b981" : "1px solid var(--primary-border)",
            color: perm === "granted" ? "#10b981" : "var(--primary)",
            fontWeight: 800,
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem"
          }}
        >
          {perm === "granted" ? <><Check size={16} /> Notificaciones Activas (Probar Alerta)</> : "Activar Alertas en Este Dispositivo"}
        </button>
      </div>
    </section>
  );
}
