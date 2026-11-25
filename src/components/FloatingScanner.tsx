"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useFitmax, compressThumbnail } from "@/context/FitmaxContext";
import { useRouter } from "next/navigation";
import { Camera, ScanBarcode, FileText, Mic, X } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanModeRef = useRef<"meal" | "label">("meal");

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

            if (data.error) {
              showToast(data.error, "error");
              setIsScanning(false);
              return;
            }

            const baseMacros = {
              protein: Number(data.protein) || 0,
              carbs: Number(data.carbs) || 0,
              fats: Number(data.fats) || 0,
              calories: Number(data.calories) || 0
            };

            setPortionScale(1);
            setScannedFood({
              id: Date.now().toString(),
              name: data.name || (activeMode === "label" ? "Etiqueta Escaneada" : "Platillo Escaneado"),
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              baseMacros,
              macros: baseMacros,
              items: Array.isArray(data.items) ? data.items : [],
              image: thumb
            });
            setShowConfirm(true);
          } catch {
            showToast("Error analizando la imagen. Revisa tu conexión.", "error");
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

        {/* Mode Selector Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.85 }}
              style={{
                position: "absolute",
                bottom: "80px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "var(--bg-surface-solid)",
                backdropFilter: "var(--blur-lg)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "0.55rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.45rem",
                width: "235px",
                boxShadow: "0 14px 45px rgba(0,0,0,0.85)"
              }}
            >
              <button
                onClick={() => triggerPhotoScan("meal")}
                style={{
                  padding: "0.85rem 0.9rem",
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
                <Camera size={18} color="var(--primary)" />
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.86rem" }}>
                  Escanear Platillo IA
                </span>
              </button>

              <button
                onClick={() => triggerPhotoScan("label")}
                style={{
                  padding: "0.85rem 0.9rem",
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
                <FileText size={18} color="var(--accent)" />
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
                  padding: "0.85rem 0.9rem",
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
                <ScanBarcode size={18} color="var(--primary)" />
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.86rem" }}>
                  Código de Barras
                </span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/log");
                }}
                style={{
                  padding: "0.85rem 0.9rem",
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
                <Mic size={18} color="var(--primary)" />
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.86rem" }}>
                  Diario Rápido / Voz IA
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Fullscreen Overlays */}
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
    </>
  );
};
