"use client";

import { useState, useRef } from "react";
import { useFitmax, getLocalISODate, compressThumbnail } from "@/context/FitmaxContext";
import { Camera, Sparkles, Trash2, Loader2, SlidersHorizontal } from "lucide-react";

export function PhysiqueVault() {
  const { physiquePhotos, addPhysiquePhoto, removePhysiquePhoto, profile, showToast } = useFitmax();
  const fileRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [photoAIdx, setPhotoAIdx] = useState<number>(Math.max(0, physiquePhotos.length - 1));
  const [photoBIdx, setPhotoBIdx] = useState<number>(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      const todayISO = getLocalISODate();
      await addPhysiquePhoto({
        date: todayISO,
        weight: profile.weight || undefined,
        image: raw
      });
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeSymmetry = async (imageStr: string) => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const mediumImg = await compressThumbnail(imageStr, 720, 0.72);
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: mediumImg, mode: "physique" })
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, "error");
      } else {
        setScanResult(data);
        showToast("Escaneo de simetría completado ✨", "success");
      }
    } catch {
      showToast("No se pudo conectar con Visión IA", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const photoA = physiquePhotos[Math.min(photoAIdx, physiquePhotos.length - 1)];
  const photoB = physiquePhotos[Math.min(photoBIdx, physiquePhotos.length - 1)];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {/* Header & Upload CTA */}
      <div className="glass-card" style={{ padding: "1.2rem", border: "1px solid var(--border)" }}>
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleUpload}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0, color: "white", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Camera size={18} color="var(--primary)" /> Bóveda Física Privada
            </h3>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Las fotos se guardan comprimidas localmente en tu dispositivo (máx. 12).
            </p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="glow-primary"
            style={{
              padding: "0.55rem 0.9rem",
              borderRadius: "10px",
              background: "var(--primary)",
              color: "white",
              fontWeight: 800,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            <Camera size={15} /> Subir Foto (+75 XP)
          </button>
        </div>

        {/* Before / After Slider */}
        {physiquePhotos.length >= 2 && photoA && photoB && (
          <div style={{ marginTop: "1.1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <SlidersHorizontal size={14} /> Comparador Antes vs. Después
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Desliza la barra</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.65rem" }}>
              <select
                value={Math.min(photoAIdx, physiquePhotos.length - 1)}
                onChange={(e) => setPhotoAIdx(Number(e.target.value))}
                style={{ padding: "0.4rem", fontSize: "0.75rem", background: "var(--bg-dark)" }}
              >
                {physiquePhotos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    Antes: {p.date} ({p.weight ? `${p.weight}kg` : "-"})
                  </option>
                ))}
              </select>
              <select
                value={Math.min(photoBIdx, physiquePhotos.length - 1)}
                onChange={(e) => setPhotoBIdx(Number(e.target.value))}
                style={{ padding: "0.4rem", fontSize: "0.75rem", background: "var(--bg-dark)" }}
              >
                {physiquePhotos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    Después: {p.date} ({p.weight ? `${p.weight}kg` : "-"})
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "300px",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "#000"
              }}
            >
              <img
                src={photoB.image}
                alt="Después"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <img
                src={photoA.image}
                alt="Antes"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                }}
              />
              {/* Divider Line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${sliderPos}%`,
                  width: "2px",
                  background: "var(--accent)",
                  boxShadow: "0 0 12px var(--accent)",
                  pointerEvents: "none"
                }}
              />
              <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.7rem", color: "white", fontWeight: 700 }}>
                Antes ({photoA.date})
              </span>
              <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700 }}>
                Después ({photoB.date})
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              style={{ width: "100%", marginTop: "0.6rem", padding: 0, accentColor: "var(--accent)" }}
            />
          </div>
        )}

        {/* Gallery & AI Symmetry Scanner */}
        {physiquePhotos.length === 0 ? (
          <p style={{ margin: "1rem 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center" }}>
            Sube tu primera foto física para llevar un control real más allá de la báscula y analizar tu simetría con IA.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginTop: "1rem" }}>
            {physiquePhotos.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "var(--bg-dark)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ position: "relative", height: "155px" }}>
                  <img src={p.image} alt={p.date} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    onClick={() => removePhysiquePhoto(p.id)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      background: "rgba(0,0,0,0.75)",
                      color: "#EF4444",
                      borderRadius: "8px",
                      padding: "0.3rem"
                    }}
                    title="Eliminar foto"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ padding: "0.55rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                    <span style={{ color: "white", fontWeight: 700 }}>{p.date}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>{p.weight ? `${p.weight} kg` : ""}</span>
                  </div>
                  <button
                    onClick={() => handleAnalyzeSymmetry(p.image)}
                    disabled={isScanning}
                    style={{
                      width: "100%",
                      padding: "0.38rem",
                      borderRadius: "8px",
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--accent-border)",
                      color: "var(--accent)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem"
                    }}
                  >
                    {isScanning ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Escaneo IA
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Symmetry Evaluation Output */}
        {scanResult && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              borderRadius: "14px",
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--accent)" }}>
                ✨ Evaluación Estética IA
              </span>
              <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "white" }}>
                V-Taper: {scanResult.vTaperScore}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "white" }}>
              <strong>% Grasa Estimado:</strong> {scanResult.bodyFatRange}
            </p>
            {scanResult.strongPoints && (
              <p style={{ margin: 0, fontSize: "0.76rem", color: "#10B981" }}>
                <strong>Puntos Fuertes:</strong> {scanResult.strongPoints.join(", ")}
              </p>
            )}
            {scanResult.priorityAreas && (
              <p style={{ margin: 0, fontSize: "0.76rem", color: "#F59E0B" }}>
                <strong>Prioridad Próximo Split:</strong> {scanResult.priorityAreas.join(", ")}
              </p>
            )}
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-main)", lineHeight: 1.45 }}>
              {scanResult.coachAdvice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
