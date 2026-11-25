"use client";

import { motion } from "framer-motion";
import styles from "./grocery.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { RefreshCw, Trash2, Share2, Copy, DollarSign } from "lucide-react";

interface GroceryItem {
  id: string;
  name: string;
  qty: string;
  category: string;
  checked: boolean;
}

const UNIT_COST_MXN: Record<string, number> = {
  Carnes: 165,
  "Lácteos y Huevos": 75,
  "Carbohidratos y Cereales": 45,
  "Grasas y Semillas": 85,
  "Frutas y Verduras": 40,
  Suplementos: 240,
  Abarrotes: 55,
  "Extras Manuales": 50
};

export default function GroceryList() {
  const { isLoaded, customDiet, profile, showToast } = useFitmax();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState("");

  const buildFromDiet = useCallback((dietData: any): GroceryItem[] => {
    const generatedList: GroceryItem[] = [];
    let nextId = 1;

    if (dietData && dietData.meals) {
      dietData.meals.forEach((meal: any) => {
        (meal.foods || []).forEach((food: any) => {
          const match = String(food.amount || "1").match(/[\d.]+/);
          const qtyNum = match ? parseFloat(match[0]) : 1;
          const unit = String(food.amount || "").replace(/[\d.]+/g, "").trim() || "porción";
          const weeklyQty = Math.round(qtyNum * 7 * 10) / 10;

          let category = "Abarrotes";
          const n = String(food.name || "").toLowerCase();
          if (n.includes("pollo") || n.includes("res") || n.includes("pescado") || n.includes("atún") || n.includes("carne") || n.includes("bistec") || n.includes("salmón") || n.includes("pavo") || n.includes("camar") || n.includes("ribeye") || n.includes("filete")) category = "Carnes";
          else if (n.includes("huevo") || n.includes("leche") || n.includes("queso") || n.includes("yogur")) category = "Lácteos y Huevos";
          else if (n.includes("avena") || n.includes("arroz") || n.includes("pan") || n.includes("tortilla") || n.includes("pasta") || n.includes("cereal") || n.includes("papa") || n.includes("quinoa") || n.includes("camote") || n.includes("frijol")) category = "Carbohidratos y Cereales";
          else if (n.includes("almendra") || n.includes("nuez") || n.includes("aguacate") || n.includes("aceite") || n.includes("crema de cacahuate") || n.includes("mantequilla") || n.includes("pistache")) category = "Grasas y Semillas";
          else if (n.includes("manzana") || n.includes("plátano") || n.includes("brócoli") || n.includes("espinaca") || n.includes("fruta") || n.includes("verdura") || n.includes("frutos")) category = "Frutas y Verduras";
          else if (n.includes("whey") || n.includes("proteína") || n.includes("batido")) category = "Suplementos";

          const existing = generatedList.find((i) => i.name === food.name);
          if (existing) {
            const exMatch = existing.qty.match(/[\d.]+/);
            const exNum = exMatch ? parseFloat(exMatch[0]) : 0;
            existing.qty = `${Math.round((exNum + weeklyQty) * 10) / 10} ${unit}`;
          } else {
            generatedList.push({
              id: (nextId++).toString(),
              name: food.name,
              qty: `${weeklyQty} ${unit}`,
              category,
              checked: false
            });
          }
        });
      });
    }
    return generatedList;
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const savedRaw = localStorage.getItem("fitmax_grocery");
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      if (Array.isArray(saved) && saved.length > 0) {
        setItems(saved);
      } else if (customDiet) {
        setItems(buildFromDiet(customDiet));
      }
    } catch {
      if (customDiet) setItems(buildFromDiet(customDiet));
    }
  }, [isLoaded, customDiet, buildFromDiet]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("fitmax_grocery", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isLoaded]);

  const toggleCheck = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleRegenerateFromDiet = () => {
    if (!customDiet) {
      showToast("Crea primero tu menú en Plan & Chef IA", "warning");
      return;
    }
    const fresh = buildFromDiet(customDiet);
    setItems(fresh);
    showToast(`Lista regenerada (${fresh.length} productos para 7 días)`, "success");
  };

  const handleClearChecked = () => {
    const remaining = items.filter((i) => !i.checked);
    setItems(remaining);
    showToast("Artículos tachados eliminados", "warning");
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setItems([
      {
        id: Date.now().toString(),
        name: newItemName.trim(),
        qty: "1 pza",
        category: "Extras Manuales",
        checked: false
      },
      ...items
    ]);
    setNewItemName("");
  };

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);

  const estimatedBudgetMXN = useMemo(() => {
    const mult = profile.budget === "Premium" ? 1.35 : profile.budget === "Estándar" ? 1.12 : 1;
    const rawTotal = items.reduce((acc, item) => acc + (UNIT_COST_MXN[item.category] || 55), 0);
    return Math.round(rawTotal * mult);
  }, [items, profile.budget]);

  const formatShareText = () => {
    const lines = ["🛒 *Lista Semanal Fitmax (7 Días)*", ""];
    categories.forEach((cat) => {
      const catItems = items.filter((i) => i.category === cat && !i.checked);
      if (catItems.length === 0) return;
      lines.push(`*${cat}*`);
      catItems.forEach((it) => lines.push(`• ${it.name}: ${it.qty}`));
      lines.push("");
    });
    lines.push(`💰 Presupuesto estimado: ~$${estimatedBudgetMXN} MXN`);
    return lines.join("\n");
  };

  const handleWhatsAppExport = () => {
    if (items.length === 0) return;
    const url = `https://wa.me/?text=${encodeURIComponent(formatShareText())}`;
    window.open(url, "_blank");
  };

  const handleCopyList = async () => {
    if (items.length === 0) return;
    try {
      await navigator.clipboard.writeText(formatShareText());
      showToast("Lista copiada al portapapeles", "success");
    } catch {
      showToast("No se pudo copiar la lista", "error");
    }
  };

  if (!isLoaded) return null;

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <motion.main
      className={styles.main}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ paddingBottom: "7rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}
    >
      {/* Top Segmented Sub-Nav */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.4rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "0.3rem"
        }}
      >
        <Link
          href="/log"
          style={{ padding: "0.55rem 0.4rem", textAlign: "center", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}
        >
          📋 Diario Hoy
        </Link>
        <Link
          href="/diet"
          style={{ padding: "0.55rem 0.4rem", textAlign: "center", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}
        >
          🍳 Plan & Chef IA
        </Link>
        <Link
          href="/grocery"
          style={{ padding: "0.55rem 0.4rem", textAlign: "center", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 700, background: "var(--primary)", color: "white" }}
        >
          🛒 Súper
        </Link>
      </div>

      <header className={styles.header} style={{ marginBottom: 0 }}>
        <h1 className={styles.title}>🛒 Supermercado Pro</h1>
        <button
          onClick={handleRegenerateFromDiet}
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
            padding: "0.4rem 0.7rem",
            borderRadius: "10px",
            fontSize: "0.74rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem"
          }}
        >
          <RefreshCw size={13} /> Sincronizar Dieta
        </button>
      </header>

      {/* Budget & WhatsApp Export Card */}
      {items.length > 0 && (
        <div className="glass-card" style={{ padding: "1.1rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <DollarSign size={13} color="#10B981" /> Presupuesto Semanal ({profile.budget || "Económico"})
              </span>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "white" }}>
                ~${estimatedBudgetMXN.toLocaleString()} <span style={{ fontSize: "0.78rem", color: "#10B981" }}>MXN / 7 días</span>
              </span>
            </div>
            <span style={{ fontSize: "0.76rem", color: "var(--accent)", fontWeight: 700 }}>
              {checkedCount}/{items.length} listos
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button
              onClick={handleWhatsAppExport}
              style={{
                padding: "0.65rem",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.16)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10B981",
                fontWeight: 800,
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <Share2 size={14} /> Enviar a WhatsApp
            </button>
            <button
              onClick={handleCopyList}
              style={{
                padding: "0.65rem",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <Copy size={14} /> Copiar Lista
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleAddItem} className={styles.addForm} style={{ marginBottom: 0 }}>
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Añadir producto (Ej. Huevo, Café...)"
          className={styles.input}
        />
        <button type="submit" className={styles.addButton}>Añadir</button>
      </form>

      {checkedCount > 0 && (
        <button
          onClick={handleClearChecked}
          style={{
            alignSelf: "flex-end",
            background: "var(--primary-subtle)",
            border: "1px solid var(--primary-border)",
            color: "var(--primary)",
            padding: "0.35rem 0.7rem",
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem"
          }}
        >
          <Trash2 size={13} /> Borrar {checkedCount} tachados
        </button>
      )}

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🛒</span>
          <h2>Tu lista está vacía</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Ve a Plan & Chef IA, arma tu dieta diaria o pulsa Sincronizar Dieta para calcular tus compras semanales.
          </p>
        </div>
      ) : (
        <div>
          {categories.map((category) => {
            const categoryItems = items.filter((i) => i.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.itemCard} ${item.checked ? styles.checked : ""}`}
                    onClick={() => toggleCheck(item.id)}
                  >
                    <div className={styles.checkbox}>
                      {item.checked && <span style={{ color: "white", fontSize: "0.8rem", fontWeight: "bold" }}>✓</span>}
                    </div>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>{item.qty}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </motion.main>
  );
}
