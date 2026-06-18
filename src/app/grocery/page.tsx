"use client";

import { motion } from "framer-motion";
import styles from "./grocery.module.css";
import { useFitmax } from "@/context/FitmaxContext";
import { useState, useEffect } from "react";
import Link from "next/link";

interface GroceryItem {
  id: string;
  name: string;
  qty: string;
  category: string;
  checked: boolean;
}

export default function GroceryList() {
  const { isLoaded, customDiet } = useFitmax();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    if (isLoaded && items.length === 0) {
      // Generate initial list from diet
      const generatedList: GroceryItem[] = [];
      let nextId = 1;

      // Scan all meals in customDiet
      if (customDiet && customDiet.meals) {
        customDiet.meals.forEach((meal: any) => {
          meal.foods.forEach((food: any) => {
            // Extract number from amount string (e.g. "11.5 piezas" -> 11.5)
            const match = food.amount.match(/[\d.]+/);
            const qtyNum = match ? parseFloat(match[0]) : 1;
            const unit = food.amount.replace(/[\d.]+/g, '').trim() || "porción";
            const weeklyQty = Math.round(qtyNum * 7 * 10) / 10;
            
            // Categorize roughly based on name
            let category = "Abarrotes";
            const n = food.name.toLowerCase();
            if (n.includes("pollo") || n.includes("res") || n.includes("pescado") || n.includes("atún") || n.includes("carne") || n.includes("bistec")) category = "Carnes";
            else if (n.includes("huevo") || n.includes("leche") || n.includes("queso") || n.includes("yogurt")) category = "Lácteos y Huevos";
            else if (n.includes("avena") || n.includes("arroz") || n.includes("pan") || n.includes("tortilla") || n.includes("pasta") || n.includes("cereal") || n.includes("papa")) category = "Carbohidratos y Cereales";
            else if (n.includes("almendra") || n.includes("nuez") || n.includes("aguacate") || n.includes("aceite") || n.includes("crema de cacahuate")) category = "Grasas y Semillas";
            else if (n.includes("manzana") || n.includes("plátano") || n.includes("brócoli") || n.includes("espinaca") || n.includes("fruta") || n.includes("verdura")) category = "Frutas y Verduras";
            else if (n.includes("whey") || n.includes("proteína") || n.includes("batido")) category = "Suplementos";
            
            // Check if item already exists to sum it
            const existing = generatedList.find(i => i.name === food.name);
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

      // Load saved state from local storage or use generated
      const savedItems = localStorage.getItem("fitmax_grocery");
      if (savedItems && JSON.parse(savedItems).length > 0) {
        setItems(JSON.parse(savedItems));
      } else {
        setItems(generatedList);
      }
    }
  }, [isLoaded, customDiet]);

  // Save to localStorage when items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("fitmax_grocery", JSON.stringify(items));
    }
  }, [items]);

  const toggleCheck = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
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

  if (!isLoaded) return null;

  // Group by category
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <motion.main 
      className={styles.main}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>🛒 Supermercado AI</h1>
        <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--primary)", fontWeight: "bold" }}>
          Volver
        </Link>
      </header>

      <form onSubmit={handleAddItem} className={styles.addForm}>
        <input 
          type="text" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Añadir otro producto (Ej. Papel higiénico)" 
          className={styles.input}
        />
        <button type="submit" className={styles.addButton}>Añadir</button>
      </form>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🛒</span>
          <h2>Tu lista está vacía</h2>
          <p>Ve a Nutrición, arma tu dieta diaria y la IA calculará tu lista semanal aquí.</p>
        </div>
      ) : (
        <div style={{ paddingBottom: "4rem" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Lista calculada automáticamente para <strong>7 días</strong> según tu dieta actual.
          </p>

          {categories.map(category => {
            const categoryItems = items.filter(i => i.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                {categoryItems.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    className={`${styles.itemCard} ${item.checked ? styles.checked : ''}`}
                    onClick={() => toggleCheck(item.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={styles.checkbox}>
                      {item.checked && <span style={{ color: "white", fontSize: "0.8rem", fontWeight: "bold" }}>✓</span>}
                    </div>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>{item.qty}</span>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </motion.main>
  );
}
