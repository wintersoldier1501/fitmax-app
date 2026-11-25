"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFitmax, compressThumbnail } from "@/context/FitmaxContext";
import { RestaurantInfiltratorModal } from "./RestaurantInfiltratorModal";
import { useRouter } from "next/navigation";
import { Camera, ScanBarcode, FileText, Mic, X, Utensils, Sparkles, Loader2 } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BarcodeScannerComponent = ({ onScanSuccess, onScanError }: any) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: { width: 250, height: 150 },
        fps: 5
      },
      false
    );

    scanner.render((decodedText) => {
      scanner.clear();
      onScanSuccess(decodedText);
    }, onScanError);

    return () => {
      scanner.clear().catch((e) => console.error("Failed to clear scanner", e));
    };
  }, []);

  return (
    <div
      id="reader"
      style={{ width: "100%", maxWidth: "400px", margin: "0 auto", borderRadius: "15px", overflow: "hidden" }}
    />
  );
};

export const FloatingScanner = () => {
  const router = useRouter();
  const { addFoodLog, showToast } = useFitmax();
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [scannedFood, setScannedFood] = useState<any>(null);
  const [portionScale, setPortionScale] = useState<number>(1);
  const [showMenu, setShowMenu] = useState(false);
  const [scanMode, setScanMode] = useState<"meal" | "label">("meal");
  const [showLiveScanner, setShowLiveScanner] = useState(false);
  const [showRestaurantInfiltrator, setShowRestaurantInfiltrator] = useState(false);
  const [visionAssistedHint, setVisionAssistedHint] = useState("");
  const [isAssistingText, setIsAssistingText] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanModeRef = useRef<"meal" | "label">("meal");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const activeMode = scanModeRef.current;
      setIsScanning(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const base64Image = canvas.toDataURL("image/jpeg", 0.7);
          const thumb = await compressThumbnail(base64Image, 160, 0.5);

          try {
            const res = await fetch("/api/vision", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64Image, mode: activeMode })
            });
            const data = await res.json();

            if (data.error || (!data.calories && !data.protein && !data.name)) {
              const fallbackMacros = { protein: 32, carbs: 35, fats: 12, calories: 376 };
              setPortionScale(1);
              setVisionAssistedHint("");
              setScannedFood({
                id: Date.now().toString(),
                name: activeMode === "label" ? "Producto de Etiqueta" : "Platillo Fotografiado",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                baseMacros: fallbackMacros,
                macros: fallbackMacros,
                items: [],
                image: thumb,
                assistedFallback: true
              });
              setShowConfirm(true);
              showToast("Cuota visual ocupada: escribe 3 palabras o ajusta los macros", "warning");
              setIsScanning(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
            }

            const baseMacros = {
              protein: Number(data.protein) || 0,
              carbs: Number(data.carbs) || 0,
              fats: Number(data.fats) || 0,
              calories: Number(data.calories) || 0
            };

            setPortionScale(1);
            setVisionAssistedHint("");
            setScannedFood({
              id: Date.now().toString(),
              name: data.name || (activeMode === "label" ? "Etiqueta Escaneada" : "Platillo Escaneado"),
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              baseMacros,
              macros: baseMacros,
              items: Array.isArray(data.items) ? data.items : [],
              image: thumb,
              assistedFallback: false
            });
            setShowConfirm(true);
          } catch {
            const fallbackMacros = { protein: 30, carbs: 35, fats: 12, calories: 368 };
            setPortionScale(1);
            setVisionAssistedHint("");
            setScannedFood({
              id: Date.now().toString(),
              name: activeMode === "label" ? "Producto de Etiqueta" : "Platillo Fotografiado",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              baseMacros: fallbackMacros,
              macros: fallbackMacros,
              items: [],
              image: thumb,
              assistedFallback: true
            });
            setShowConfirm(true);
            showToast("Sin conexión visual: calibración asistida activada", "warning");
          } finally {
            setIsScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPortionScale = (scale: number) => {
    setPortionScale(scale);
    if (!scannedFood?.baseMacros) return;
    const b = scannedFood.baseMacros;
    setScannedFood({
      ...scannedFood,
      macros: {
        protein: Math.round(b.protein * scale),
        carbs: Math.round(b.carbs * scale),
        fats: Math.round(b.fats * scale),
        calories: Math.round(b.calories * scale)
      }
    });
  };

  const confirmLog = () => {
    if (scannedFood) {
      const recalculatedCalories =
        scannedFood.macros.protein * 4 +
        scannedFood.macros.carbs * 4 +
        scannedFood.macros.fats * 9;
      addFoodLog({
        id: scannedFood.id,
        name: portionScale !== 1 ? `${scannedFood.name} (${portionScale}x)` : scannedFood.name,
        time: scannedFood.time,
        image: scannedFood.image,
        macros: {
          ...scannedFood.macros,
          calories: recalculatedCalories
        }
      });
    }
    setShowConfirm(false);
    setScannedFood(null);
  };

  const handleBarcodeSuccess = async (decodedText: string) => {
    setShowLiveScanner(false);
    setIsScanning(true);
    try {
      const res = await fetch(`/api/barcode?code=${decodedText}`);
      const data = await res.json();

      if (data.error) {
        showToast(data.error, "error");
        setIsScanning(false);
        return;
      }

      const p = data.results;
      setPortionScale(1);
      setScannedFood({
        id: Date.now().toString(),
        name: `${p.name} (100g)`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        baseMacros: p.macros,
        macros: p.macros,
        items: [],
        image: p.image
      });
      setShowConfirm(true);
    } catch {
      showToast("Error de conexión al buscar el código de barras.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAssistCalibrate = async () => {
    if (!visionAssistedHint.trim() || !scannedFood) return;
    setIsAssistingText(true);
    try {
      const res = await fetch("/api/food/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: visionAssistedHint.trim() })
      });
      const data = await res.json();
      if (data.totalMacros) {
        const nextBase = {
          protein: Math.round(data.totalMacros.protein || 0),
          carbs: Math.round(data.totalMacros.carbs || 0),
          fats: Math.round(data.totalMacros.fats || 0),
          calories: Math.round(data.totalMacros.calories || 0)
        };
        setPortionScale(1);
        setScannedFood({
          ...scannedFood,
          name:
            Array.isArray(data.items) && data.items.length > 0
              ? data.items.map((i: any) => i.name).slice(0, 3).join(" + ")
              : visionAssistedHint.trim(),
          baseMacros: nextBase,
          macros: nextBase,
          items: Array.isArray(data.items) ? data.items : [],
          assistedFallback: false
        });
        showToast("✨ Macros calibrados por IA", "success");
      }
    } catch {
      showToast("No se pudo calibrar por texto; ajusta los números abajo", "warning");
    } finally {
      setIsAssistingText(false);
    }
  };

  const triggerPhotoScan = (mode: "meal" | "label") => {
    setScanMode(mode);
    scanModeRef.current = mode;
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          top: "-22px",
          width: "66px",
          height: "66px",
          zIndex: 100
        }}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleCapture}
          style={{ display: "none" }}
        />

        {/* Outer pulsing ring */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--primary)",
            borderRadius: "50%",
            zIndex: -1
          }}
          animate={{ scale: [1, 1.38], opacity: [0.38, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />

        {/* Main FAB */}
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "var(--bg-dark)",
            borderRadius: "50%",
            border: "2px solid var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 22px var(--primary-glow)",
            cursor: "pointer"
          }}
        >
          {showMenu ? (
            <X size={26} color="var(--primary)" />
          ) : (
            <img
              src="/logo_transparent.png"
              alt="Fitmax Logo"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
              }}
            />
          )}
        </motion.button>
      </div>

      {/* Fullscreen Overlays & Centered Menu Portaled to body (escapes BottomNav transform/backdrop-filter) */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div
                    key="fab-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMenu(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.62)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      zIndex: 48
                    }}
                  />
                  <motion.div
                    key="fab-menu"
                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.94 }}
                    style={{
                      position: "fixed",
                      bottom: "6.35rem",
                      left: 0,
                      right: 0,
                      margin: "0 auto",
                      width: "min(288px, calc(100vw - 2rem))",
                      backgroundColor: "var(--bg-surface-solid)",
                      backdropFilter: "var(--blur-lg)",
                      WebkitBackdropFilter: "var(--blur-lg)",
                      border: "1px solid var(--border)",
                      borderRadius: "22px",
                      padding: "0.6rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.45rem",
                      boxShadow: "0 18px 50px rgba(0,0,0,0.88)",
                      zIndex: 150
                    }}
                  >
                    <button
                      onClick={() => triggerPhotoScan("meal")}
                      style={{
                        padding: "0.85rem 0.95rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        color: "white",
                        textAlign: "left",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}
                    >
                      <Camera size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.86rem" }}>
                        Escanear Platillo IA
                      </span>
                    </button>

                    <button
                      onClick={() => triggerPhotoScan("label")}
                      style={{
                        padding: "0.85rem 0.95rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        color: "white",
                        textAlign: "left",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}
                    >
                      <FileText size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.86rem" }}>
                        Leer Tabla Nutrimental
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowLiveScanner(true);
                      }}
                      style={{
                        padding: "0.85rem 0.95rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        color: "white",
                        textAlign: "left",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}
                    >
                      <ScanBarcode size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.86rem" }}>
                        Código de Barras
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowRestaurantInfiltrator(true);
                      }}
                      style={{
                        padding: "0.85rem 0.95rem",
                        background: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.35)",
                        color: "#FBBF24",
                        textAlign: "left",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}
                    >
                      <Utensils size={18} color="#FBBF24" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.86rem" }}>
                        Carta de Restaurante IA
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        router.push("/log");
                      }}
                      style={{
                        padding: "0.85rem 0.95rem",
                        background: "var(--primary-subtle)",
                        border: "1px solid var(--primary-border)",
                        color: "white",
                        textAlign: "left",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}
                    >
                      <Mic size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.86rem" }}>
                        Diario Rápido / Voz IA
                      </span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showLiveScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(5,5,7,0.95)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              color: "white"
            }}
          >
            <h2 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Escanea el Código de Barras</h2>
            <BarcodeScannerComponent onScanSuccess={handleBarcodeSuccess} onScanError={() => {}} />
            <button
              onClick={() => setShowLiveScanner(false)}
              style={{
                marginTop: "2rem",
                padding: "0.9rem 2rem",
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                color: "white",
                borderRadius: "12px"
              }}
            >
              Cancelar
            </button>
          </motion.div>
        )}

        {(isScanning || showConfirm) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.9)",
              backdropFilter: "blur(8px)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              color: "white"
            }}
          >
            {isScanning && (
              <div
                style={{
                  position: "relative",
                  width: "250px",
                  height: "250px",
                  border: "2px solid var(--border)",
                  borderRadius: "20px",
                  overflow: "hidden"
                }}
              >
                <p
                  style={{
                    position: "absolute",
                    top: "50%",
                    width: "100%",
                    textAlign: "center",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    padding: "0 1rem",
                    fontSize: "0.9rem"
                  }}
                >
                  {scanMode === "label" ? "Extrayendo tabla nutrimental..." : "Analizando ingredientes y macros..."}
                </p>
                <motion.div
                  animate={{ y: [0, 250, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: "100%",
                    height: "4px",
                    backgroundColor: "var(--primary)",
                    boxShadow: "0 0 15px var(--primary)",
                    position: "absolute",
                    top: 0
                  }}
                />
              </div>
            )}

            {showConfirm && scannedFood && (
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card"
                style={{
                  backgroundColor: "var(--bg-surface-solid)",
                  padding: "1.6rem",
                  borderRadius: "22px",
                  width: "100%",
                  maxWidth: "410px",
                  maxHeight: "88vh",
                  overflowY: "auto",
                  textAlign: "center",
                  border: "1px solid var(--border)"
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
                  ✨ Análisis Completado
                </span>
                <input
                  type="text"
                  value={scannedFood.name}
                  onChange={(e) => setScannedFood({ ...scannedFood, name: e.target.value })}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--primary)",
                    borderRadius: 0,
                    color: "white",
                    textAlign: "center",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    padding: "0.5rem"
                  }}
                />

                {scannedFood.assistedFallback && (
                  <div
                    style={{
                      textAlign: "left",
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.32)",
                      borderRadius: "12px",
                      padding: "0.65rem",
                      marginBottom: "0.95rem"
                    }}
                  >
                    <span style={{ display: "block", fontSize: "0.72rem", color: "#FBBF24", fontWeight: 700, marginBottom: "0.35rem" }}>
                      ⚡ Estimación Asistida: escribe qué es tu foto (ej. &quot;pechuga con arroz&quot;) o ajusta los gramos abajo:
                    </span>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <input
                        type="text"
                        value={visionAssistedHint}
                        onChange={(e) => setVisionAssistedHint(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAssistCalibrate()}
                        placeholder="Ej. 2 tacos de bistec con aguacate"
                        style={{ flex: 1, padding: "0.45rem 0.6rem", fontSize: "0.78rem", background: "var(--bg-dark)", borderRadius: "8px" }}
                      />
                      <button
                        onClick={handleAssistCalibrate}
                        disabled={isAssistingText || !visionAssistedHint.trim()}
                        style={{
                          padding: "0.45rem 0.7rem",
                          borderRadius: "8px",
                          background: "#F59E0B",
                          color: "#000",
                          fontWeight: 800,
                          fontSize: "0.74rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        {isAssistingText ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Calibrar
                      </button>
                    </div>
                  </div>
                )}

                {/* Portion Scale Pills */}
                <div style={{ marginBottom: "1.1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.45rem" }}>
                    Ajustar tamaño de porción:
                  </p>
                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                    {[0.5, 1, 1.5, 2].map((sc) => (
                      <button
                        key={sc}
                        onClick={() => applyPortionScale(sc)}
                        style={{
                          padding: "0.35rem 0.7rem",
                          borderRadius: "8px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          border: portionScale === sc ? "1px solid var(--primary)" : "1px solid var(--border)",
                          background: portionScale === sc ? "var(--primary-subtle)" : "rgba(255,255,255,0.03)",
                          color: portionScale === sc ? "white" : "var(--text-muted)"
                        }}
                      >
                        {sc}x
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1.2rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase" }}>Proteína</p>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "0.25rem" }}>
                      <input
                        type="number"
                        value={scannedFood.macros.protein}
                        onChange={(e) =>
                          setScannedFood({
                            ...scannedFood,
                            macros: { ...scannedFood.macros, protein: Number(e.target.value) }
                          })
                        }
                        style={{ width: "58px", textAlign: "center", padding: "6px", fontWeight: 800, fontSize: "0.95rem" }}
                      />
                      <span style={{ marginLeft: "3px", fontSize: "0.8rem" }}>g</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase" }}>Carbos</p>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "0.25rem" }}>
                      <input
                        type="number"
                        value={scannedFood.macros.carbs}
                        onChange={(e) =>
                          setScannedFood({
                            ...scannedFood,
                            macros: { ...scannedFood.macros, carbs: Number(e.target.value) }
                          })
                        }
                        style={{ width: "58px", textAlign: "center", padding: "6px", fontWeight: 800, fontSize: "0.95rem" }}
                      />
                      <span style={{ marginLeft: "3px", fontSize: "0.8rem" }}>g</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase" }}>Grasas</p>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "0.25rem" }}>
                      <input
                        type="number"
                        value={scannedFood.macros.fats}
                        onChange={(e) =>
                          setScannedFood({
                            ...scannedFood,
                            macros: { ...scannedFood.macros, fats: Number(e.target.value) }
                          })
                        }
                        style={{ width: "58px", textAlign: "center", padding: "6px", fontWeight: 800, fontSize: "0.95rem" }}
                      />
                      <span style={{ marginLeft: "3px", fontSize: "0.8rem" }}>g</span>
                    </div>
                  </div>
                </div>

                {scannedFood.items && scannedFood.items.length > 0 && (
                  <div
                    style={{
                      textAlign: "left",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "0.75rem",
                      marginBottom: "1.2rem"
                    }}
                  >
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                      Ingredientes detectados:
                    </p>
                    {scannedFood.items.map((it: any, idx: number) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: "white" }}>• {it.name} ({it.portion})</span>
                        <span style={{ color: "var(--accent)" }}>{it.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      flex: 1,
                      padding: "0.9rem",
                      backgroundColor: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      borderRadius: "12px"
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmLog}
                    className="glow-primary"
                    style={{
                      flex: 1,
                      padding: "0.9rem",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      borderRadius: "12px",
                      fontWeight: 800
                    }}
                  >
                    Añadir (+50 XP)
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
            </AnimatePresence>

            <RestaurantInfiltratorModal
              isOpen={showRestaurantInfiltrator}
              onClose={() => setShowRestaurantInfiltrator(false)}
              initialTab="scanner"
            />
          </>,
          document.body
        )}
    </>
  );
};
