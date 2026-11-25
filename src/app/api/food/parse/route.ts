import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ParsedFoodItem {
  name: string;
  portion: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

const KNOWN_FOODS: {
  keywords: string[];
  label: string;
  defaultPortion: string;
  perUnit: { p: number; c: number; f: number };
  per100g: { p: number; c: number; f: number };
}[] = [
  { keywords: ["clara", "claras"], label: "Claras de huevo", defaultPortion: "1 pz", perUnit: { p: 3.6, c: 0.2, f: 0 }, per100g: { p: 11, c: 0.7, f: 0.2 } },
  { keywords: ["huevo", "huevos"], label: "Huevo entero", defaultPortion: "1 pz", perUnit: { p: 6, c: 0.6, f: 5 }, per100g: { p: 13, c: 1.1, f: 11 } },
  { keywords: ["pollo", "pechuga"], label: "Pechuga de pollo", defaultPortion: "150g", perUnit: { p: 31, c: 0, f: 3.5 }, per100g: { p: 30, c: 0, f: 3.6 } },
  { keywords: ["atun", "atún"], label: "Atún en agua", defaultPortion: "1 lata", perUnit: { p: 24, c: 0, f: 1 }, per100g: { p: 24, c: 0, f: 1 } },
  { keywords: ["bistec", "res", "carne", "arrachera", "sirloin"], label: "Carne de res magra", defaultPortion: "150g", perUnit: { p: 32, c: 0, f: 9 }, per100g: { p: 26, c: 0, f: 8 } },
  { keywords: ["salmon", "salmón"], label: "Salmón", defaultPortion: "150g", perUnit: { p: 30, c: 0, f: 18 }, per100g: { p: 20, c: 0, f: 13 } },
  { keywords: ["taco", "tacos"], label: "Taco tradicional", defaultPortion: "1 taco", perUnit: { p: 9, c: 13, f: 6 }, per100g: { p: 12, c: 18, f: 8 } },
  { keywords: ["tortilla", "tortillas"], label: "Tortilla de maíz", defaultPortion: "1 pz", perUnit: { p: 1.5, c: 12, f: 0.7 }, per100g: { p: 5.5, c: 44, f: 2.8 } },
  { keywords: ["arroz"], label: "Arroz cocido", defaultPortion: "150g", perUnit: { p: 4, c: 42, f: 0.4 }, per100g: { p: 2.7, c: 28, f: 0.3 } },
  { keywords: ["avena"], label: "Avena en hojuelas", defaultPortion: "50g", perUnit: { p: 6.5, c: 33, f: 3.5 }, per100g: { p: 13, c: 66, f: 7 } },
  { keywords: ["platano", "plátano", "banana"], label: "Plátano", defaultPortion: "1 pz", perUnit: { p: 1.3, c: 27, f: 0.3 }, per100g: { p: 1.1, c: 23, f: 0.3 } },
  { keywords: ["manzana"], label: "Manzana", defaultPortion: "1 pz", perUnit: { p: 0.5, c: 25, f: 0.3 }, per100g: { p: 0.3, c: 14, f: 0.2 } },
  { keywords: ["pan"], label: "Pan integral", defaultPortion: "1 reb", perUnit: { p: 3.5, c: 13, f: 1.2 }, per100g: { p: 10, c: 44, f: 3.5 } },
  { keywords: ["aguacate", "palta"], label: "Aguacate", defaultPortion: "1/2 pz", perUnit: { p: 2, c: 8, f: 15 }, per100g: { p: 2, c: 9, f: 15 } },
  { keywords: ["whey", "proteina", "proteína", "scoop", "batido"], label: "Proteína Whey", defaultPortion: "1 scoop", perUnit: { p: 24, c: 3, f: 1.5 }, per100g: { p: 80, c: 10, f: 5 } },
  { keywords: ["leche"], label: "Leche", defaultPortion: "250ml", perUnit: { p: 8, c: 12, f: 4 }, per100g: { p: 3.3, c: 4.8, f: 1.5 } },
  { keywords: ["yogur", "yogurt"], label: "Yogur griego", defaultPortion: "150g", perUnit: { p: 15, c: 6, f: 0.5 }, per100g: { p: 10, c: 4, f: 0.4 } },
  { keywords: ["queso"], label: "Queso panela/oaxaca", defaultPortion: "50g", perUnit: { p: 10, c: 1, f: 8 }, per100g: { p: 20, c: 2, f: 16 } },
  { keywords: ["frijol", "frijoles"], label: "Frijoles cocidos", defaultPortion: "100g", perUnit: { p: 8, c: 22, f: 0.5 }, per100g: { p: 8, c: 22, f: 0.5 } },
  { keywords: ["pasta", "espagueti"], label: "Pasta cocida", defaultPortion: "150g", perUnit: { p: 7.5, c: 45, f: 1.5 }, per100g: { p: 5, c: 30, f: 1 } },
  { keywords: ["papa", "patata"], label: "Papa cocida", defaultPortion: "150g", perUnit: { p: 3, c: 30, f: 0.2 }, per100g: { p: 2, c: 20, f: 0.1 } },
  { keywords: ["crema de cacahuate", "cacahuate", "mani", "maní"], label: "Crema de cacahuate", defaultPortion: "1 cda", perUnit: { p: 4, c: 3, f: 8 }, per100g: { p: 25, c: 20, f: 50 } },
  { keywords: ["almendra", "almendras", "nuez", "nueces"], label: "Almendras / Nueces", defaultPortion: "30g", perUnit: { p: 6, c: 6, f: 15 }, per100g: { p: 21, c: 21, f: 50 } },
  { keywords: ["coca sin azucar", "coca zero", "coca light", "agua"], label: "Bebida sin calorías", defaultPortion: "355ml", perUnit: { p: 0, c: 0, f: 0 }, per100g: { p: 0, c: 0, f: 0 } },
  { keywords: ["pizza"], label: "Rebanada de pizza", defaultPortion: "1 reb", perUnit: { p: 12, c: 34, f: 11 }, per100g: { p: 11, c: 32, f: 10 } },
  { keywords: ["hamburguesa", "burger"], label: "Hamburguesa", defaultPortion: "1 pz", perUnit: { p: 24, c: 32, f: 18 }, per100g: { p: 15, c: 20, f: 12 } }
];

function fallbackParseSpanishMeal(text: string): { items: ParsedFoodItem[]; totalMacros: ParsedFoodItem["macros"] } {
  const segments = text
    .toLowerCase()
    .split(/[,;]+|\s+y\s+|\s+con\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const items: ParsedFoodItem[] = [];

  for (const seg of segments) {
    const matchedFood = KNOWN_FOODS.find((kf) => kf.keywords.some((kw) => seg.includes(kw)));
    if (!matchedFood) continue;

    // Extract quantity & unit
    const qtyMatch = seg.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|ml|tazas?|pz|piezas?|latas?|scoops?|reb|rebanadas?|cdas?|cucharadas?)?/i);
    let qty = qtyMatch ? parseFloat(qtyMatch[1].replace(",", ".")) : 1;
    const unit = qtyMatch?.[2]?.toLowerCase() || "";

    if (seg.includes("medio ") || seg.includes("media ") || seg.includes("1/2")) {
      qty = 0.5;
    }

    let p = 0;
    let c = 0;
    let f = 0;
    let portionLabel = matchedFood.defaultPortion;

    if (unit === "g" || unit === "gr" || unit === "gramos" || unit === "ml") {
      const factor = qty / 100;
      p = matchedFood.per100g.p * factor;
      c = matchedFood.per100g.c * factor;
      f = matchedFood.per100g.f * factor;
      portionLabel = `${Math.round(qty)}${unit === "ml" ? "ml" : "g"}`;
    } else {
      const count = qty > 15 ? qty / 100 : qty; // guard against bare grams
      p = matchedFood.perUnit.p * count;
      c = matchedFood.perUnit.c * count;
      f = matchedFood.perUnit.f * count;
      portionLabel = qty > 15 ? `${qty}g` : `${qty} ${unit || "porción"}`;
    }

    const rP = Math.round(p);
    const rC = Math.round(c);
    const rF = Math.round(f);
    items.push({
      name: matchedFood.label,
      portion: portionLabel,
      macros: {
        protein: rP,
        carbs: rC,
        fats: rF,
        calories: rP * 4 + rC * 4 + rF * 9
      }
    });
  }

  if (items.length === 0) {
    items.push({
      name: text.trim().slice(0, 40) || "Comida personalizada",
      portion: "1 porción estimada",
      macros: { protein: 22, carbs: 35, fats: 10, calories: 318 }
    });
  }

  const totalMacros = items.reduce(
    (acc, it) => ({
      protein: acc.protein + it.macros.protein,
      carbs: acc.carbs + it.macros.carbs,
      fats: acc.fats + it.macros.fats,
      calories: acc.calories + it.macros.calories
    }),
    { protein: 0, carbs: 0, fats: 0, calories: 0 }
  );

  return { items, totalMacros };
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Escribe o dicta lo que comiste." }, { status: 400 });
    }

    const systemPrompt = `
Eres un nutricionista clínico experto en gastronomía latinoamericana y cálculo exacto de macronutrientes.
El usuario describirá en lenguaje natural lo que comió o quiere analizar.
Desglosa CADA alimento mencionado con su porción exacta estimada y sus macros reales.

Responde ÚNICAMENTE con un JSON válido sin bloques de markdown:
{
  "items": [
    {
      "name": "Nombre limpio del alimento",
      "portion": "Porción (ej. 3 piezas / 150g)",
      "macros": {
        "protein": <entero gramos>,
        "carbs": <entero gramos>,
        "fats": <entero gramos>,
        "calories": <entero kcal>
      }
    }
  ],
  "totalMacros": {
    "protein": <suma proteina>,
    "carbs": <suma carbos>,
    "fats": <suma grasas>,
    "calories": <suma calorias>
  }
}
`;

    let parsedResult: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-lite-latest",
          systemInstruction: systemPrompt
        });

        const result: any = await Promise.race([
          model.generateContent(`Comida del usuario: "${text}"`),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("GeminiTimeout")), 3200))
        ]);
        const response = await result.response;
        let raw = response.text().trim();
        if (raw.startsWith("```json")) raw = raw.replace(/^```json/, "");
        if (raw.startsWith("```")) raw = raw.replace(/^```/, "");
        if (raw.endsWith("```")) raw = raw.replace(/```$/, "");
        const json = JSON.parse(raw.trim());
        if (json?.items?.length > 0 && json?.totalMacros) {
          parsedResult = json;
        }
      } catch (e: any) {
        console.warn("Gemini food parse failed:", e?.message);
      }
    }

    if (!parsedResult) {
      try {
        const llmRes = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Comida del usuario: "${text}"` }
            ],
            model: "openai",
            jsonMode: true,
            seed: 42
          }),
          signal: AbortSignal.timeout(3500)
        });
        if (llmRes.ok) {
          let raw = await llmRes.text();
          if (raw.startsWith("```json")) raw = raw.replace(/^```json/, "");
          if (raw.startsWith("```")) raw = raw.replace(/^```/, "");
          if (raw.endsWith("```")) raw = raw.replace(/```$/, "");
          const json = JSON.parse(raw.trim());
          if (json?.items?.length > 0 && json?.totalMacros) {
            parsedResult = json;
          }
        }
      } catch (e: any) {
        console.warn("Pollinations food parse failed:", e?.message);
      }
    }

    if (!parsedResult) {
      parsedResult = fallbackParseSpanishMeal(text);
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("Food parse API error:", error);
    return NextResponse.json({ error: error.message || "Error analizando comida" }, { status: 500 });
  }
}
