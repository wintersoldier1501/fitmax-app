"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2 } from "lucide-react";
import { getDailyQuote } from "@/data/quotes";
import { useFitmax } from "@/context/FitmaxContext";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: {
    workoutName: string;
    totalVolumeKg: number;
    completedSets: number;
    prsCount: number;
    xpEarned: number;
  } | null;
  rankName: string;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[n] + " ";
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currY);
  }
}

export function ShareCardModal({ isOpen, onClose, summary, rankName }: ShareCardModalProps) {
  const { profile, streak, showToast } = useFitmax();
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !summary) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Deep Obsidian Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, "#050507");
    bgGrad.addColorStop(0.5, "#110912");
    bgGrad.addColorStop(1, "#050507");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Ambient Top Glow
    const rad = ctx.createRadialGradient(540, 260, 40, 540, 260, 620);
    rad.addColorStop(0, "rgba(255, 51, 102, 0.28)");
    rad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 1080, 1000);

    // Outer Frame
    ctx.strokeStyle = "rgba(255, 51, 102, 0.45)";
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, 984, 1824);

    // Brand Badge
    ctx.fillStyle = "#FF3366";
    ctx.font = "900 54px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FITMAX // IRON LOG PRO", 540, 175);

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "600 32px sans-serif";
    const todayStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
    ctx.fillText(todayStr, 540, 235);

    // Athlete Identity
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 72px sans-serif";
    ctx.fillText((profile.name || "GUERRERO").toUpperCase(), 540, 380);

    ctx.fillStyle = "#00E5FF";
    ctx.font = "700 38px sans-serif";
    ctx.fillText(`RANGO ${rankName.toUpperCase()}  •  🔥 ${streak} DÍAS DE RACHA`, 540, 445);

    // Workout Title Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(90, 530, 900, 180);
    ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(90, 530, 900, 180);

    ctx.fillStyle = "#00E5FF";
    ctx.font = "700 28px sans-serif";
    ctx.fillText("SESIÓN COMPLETADA", 540, 588);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 42px sans-serif";
    wrapText(ctx, summary.workoutName, 540, 650, 840, 48);

    // 3 Stat Cards
    const drawStatBox = (y: number, label: string, value: string, accent: string) => {
      ctx.fillStyle = "rgba(20, 20, 28, 0.85)";
      ctx.fillRect(110, y, 860, 190);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(110, y, 860, 190);

      ctx.fillStyle = "#A1A1AA";
      ctx.font = "700 30px sans-serif";
      ctx.fillText(label, 540, y + 65);

      ctx.fillStyle = accent;
      ctx.font = "900 76px sans-serif";
      ctx.fillText(value, 540, y + 148);
    };

    drawStatBox(770, "VOLUMEN TOTAL MOVIDO", `${summary.totalVolumeKg.toLocaleString()} KG`, "#FF3366");
    drawStatBox(1000, "SERIES EFECTIVAS COMPLETADAS", `${summary.completedSets} SERIES`, "#00E5FF");
    drawStatBox(1230, "RÉCORDS PERSONALES & RECOMPENSA", `${summary.prsCount} PR 🏆  •  +${summary.xpEarned} XP`, "#F59E0B");

    // Quote at bottom
    const dailyQuote = getDailyQuote();
    ctx.fillStyle = "#F59E0B";
    ctx.font = "italic 600 32px sans-serif";
    wrapText(ctx, `"${dailyQuote.text}"`, 540, 1525, 860, 44);

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "700 26px sans-serif";
    ctx.fillText(`— ${dailyQuote.author}`, 540, 1745);

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "600 24px sans-serif";
    ctx.fillText("fitmax-app.vercel.app", 540, 1825);

    setDataUrl(canvas.toDataURL("image/png"));
  }, [isOpen, summary, profile.name, rankName, streak]);

  if (!isOpen || !summary) return null;

  const handleNativeShare = async () => {
    try {
      if (navigator.share && dataUrl) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "fitmax-victoria.png", { type: "image/png" });
        await navigator.share({
          title: "Mi Entreno en Fitmax",
          text: `${summary.totalVolumeKg} kg movidos en Fitmax 🔥`,
          files: [file]
        });
        return;
      }
    } catch {
      // fallback to download
    }
    if (dataUrl) {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "fitmax-victoria.png";
      a.click();
      showToast("Tarjeta guardada para tus Stories", "success");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(10px)",
          zIndex: 10002,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card"
          style={{
            width: "100%",
            maxWidth: "390px",
            maxHeight: "92vh",
            overflowY: "auto",
            padding: "1.2rem",
            background: "var(--bg-surface-solid)",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "white", fontSize: "1.05rem" }}>Tarjeta Viral de Victoria</h3>
            <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
              <X size={20} />
            </button>
          </div>

          {dataUrl && (
            <img
              src={dataUrl}
              alt="Tarjeta Fitmax"
              style={{
                width: "100%",
                maxHeight: "420px",
                objectFit: "contain",
                borderRadius: "14px",
                border: "1px solid var(--border)"
              }}
            />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            <a
              href={dataUrl || "#"}
              download="fitmax-victoria.png"
              onClick={() => showToast("Imagen HD descargada", "success")}
              style={{
                padding: "0.85rem",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <Download size={16} /> Guardar PNG
            </a>
            <button
              onClick={handleNativeShare}
              className="glow-primary"
              style={{
                padding: "0.85rem",
                borderRadius: "12px",
                background: "var(--primary)",
                color: "white",
                fontWeight: 800,
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <Share2 size={16} /> Compartir
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
