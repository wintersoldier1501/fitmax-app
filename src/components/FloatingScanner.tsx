"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useFitmax } from "@/context/FitmaxContext";

import { Camera, ScanBarcode, X } from "lucide-react";

export const FloatingScanner = () => {
  const { addFoodLog, targetMacros } = useFitmax();
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [scannedFood, setScannedFood] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [scanMode, setScanMode] = useState<"meal" | "label">("meal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsScanning(true);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          // Compress image using canvas
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
          const base64Image = canvas.toDataURL("image/jpeg", 0.7); // 70% quality

          try {
            const res = await fetch("/api/vision", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64Image })
            });
            const data = await res.json();

            if (data.error) {
              alert(data.error);
              setIsScanning(false);
              return;
            }

            setScannedFood({
              id: Date.now().toString(),
              name: data.name || "Comida Escaneada",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              macros: {
                protein: Number(data.protein) || 0,
                carbs: Number(data.carbs) || 0,
                fats: Number(data.fats) || 0,
                calories: Number(data.calories) || 0,
              },
              image: base64Image
            });
            setShowConfirm(true);
          } catch (error) {
            alert("Error analizando la imagen. Revisa tu conexión o tu API Key.");
          } finally {
            setIsScanning(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmLog = () => {
    if (scannedFood) {
      const recalculatedCalories = (scannedFood.macros.protein * 4) + (scannedFood.macros.carbs * 4) + (scannedFood.macros.fats * 9);
      addFoodLog({
        ...scannedFood,
        macros: {
          ...scannedFood.macros,
          calories: recalculatedCalories
        }
      });
    }
    setShowConfirm(false);
    setScannedFood(null);
  };

  const triggerScan = (mode: "meal" | "label") => {
    setScanMode(mode);
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  return (
    <>
      <div style={{ 
        position: "relative", 
        top: "-25px", 
        width: "70px",
        height: "70px",
        zIndex: 100 
      }}>
        {/* Hidden File Input for Camera */}
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
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "var(--primary)",
            borderRadius: "50%",
            zIndex: -1,
          }}
          animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        
        {/* Mode Selector Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              style={{
                position: "absolute",
                bottom: "85px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "var(--bg-surface)",
                backdropFilter: "var(--blur-md)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                width: "220px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.8)"
              }}
            >
              <button 
                onClick={() => triggerScan("meal")}
                style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white", textAlign: "left", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              >
                <Camera size={20} color="var(--primary)" />
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "0.9rem" }}>Escanear Platillo</span>
              </button>
              <button 
                onClick={() => triggerScan("label")}
                style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white", textAlign: "left", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              >
                <ScanBarcode size={20} color="var(--primary)" />
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "0.9rem" }}>Etiqueta Nutricional</span>
              </button>
              <button 
                onClick={() => { setShowMenu(false); window.location.href = "/log"; }}
                style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white", textAlign: "left", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              >
                <span style={{ fontSize: "1.2rem" }}>🔍</span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "0.9rem" }}>Buscador Manual</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: "100%", height: "100%",
            backgroundColor: "var(--bg-dark)",
            borderRadius: "50%", 
            border: "2px solid var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px var(--primary-glow)", 
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {showMenu ? (
            <X size={28} color="var(--primary)" />
          ) : (
            <img 
              src="/logo_transparent.png" 
              alt="Fitmax Logo" 
              style={{ width: "65px", height: "65px", objectFit: "contain", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }} 
            />
          )}
        </motion.button>
      </div>

      {/* Fullscreen Overlay for Scanning and Confirmation */}
      <AnimatePresence>
        {(isScanning || showConfirm) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "2rem", color: "white"
            }}
          >
            {isScanning && (
              <div style={{ position: "relative", width: "250px", height: "250px", border: "2px solid var(--text-muted)", borderRadius: "20px", overflow: "hidden" }}>
                <p style={{ position: "absolute", top: "50%", width: "100%", textAlign: "center", transform: "translateY(-50%)", color: "var(--text-muted)", padding: "0 1rem" }}>
                  {scanMode === "label" ? "Extrayendo tabla nutrimental..." : "Analizando plato..."}
                </p>
                {/* Laser animation */}
                <motion.div 
                  animate={{ y: [0, 250, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ width: "100%", height: "4px", backgroundColor: "var(--primary)", boxShadow: "0 0 15px var(--primary)", position: "absolute", top: 0 }}
                />
              </div>
            )}

            {showConfirm && scannedFood && (
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                style={{ backgroundColor: "var(--bg-surface)", padding: "2rem", borderRadius: "20px", width: "100%", maxWidth: "400px", textAlign: "center" }}
              >
                <h2 style={{ marginBottom: "0.5rem", color: "var(--primary)" }}>IA Completada</h2>
                <input 
                  type="text" 
                  value={scannedFood.name} 
                  onChange={(e) => setScannedFood({...scannedFood, name: e.target.value})}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--primary)", color: "white", textAlign: "center", fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", padding: "0.5rem", outline: "none" }}
                />
                
                <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "2rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Proteína</p>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input 
                        type="number" 
                        value={scannedFood.macros.protein} 
                        onChange={(e) => setScannedFood({...scannedFood, macros: {...scannedFood.macros, protein: Number(e.target.value)}})}
                        style={{ width: "50px", background: "transparent", border: "1px solid var(--border)", color: "white", textAlign: "center", borderRadius: "5px", fontWeight: 800, fontSize: "1rem" }}
                      />
                      <span style={{ marginLeft: "2px" }}>g</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Carbos</p>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input 
                        type="number" 
                        value={scannedFood.macros.carbs} 
                        onChange={(e) => setScannedFood({...scannedFood, macros: {...scannedFood.macros, carbs: Number(e.target.value)}})}
                        style={{ width: "50px", background: "transparent", border: "1px solid var(--border)", color: "white", textAlign: "center", borderRadius: "5px", fontWeight: 800, fontSize: "1rem" }}
                      />
                      <span style={{ marginLeft: "2px" }}>g</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Grasas</p>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input 
                        type="number" 
                        value={scannedFood.macros.fats} 
                        onChange={(e) => setScannedFood({...scannedFood, macros: {...scannedFood.macros, fats: Number(e.target.value)}})}
                        style={{ width: "50px", background: "transparent", border: "1px solid var(--border)", color: "white", textAlign: "center", borderRadius: "5px", fontWeight: 800, fontSize: "1rem" }}
                      />
                      <span style={{ marginLeft: "2px" }}>g</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: "1rem", backgroundColor: "transparent", border: "1px solid var(--text-muted)", color: "white", borderRadius: "10px", cursor: "pointer" }}>Cancelar</button>
                  <button onClick={confirmLog} style={{ flex: 1, padding: "1rem", backgroundColor: "var(--primary)", border: "none", color: "white", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Añadir</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
