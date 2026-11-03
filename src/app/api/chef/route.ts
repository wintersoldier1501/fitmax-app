import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { ingredients, profile, remainingMacros, prepTime } = await req.json();

    if (!ingredients || !ingredients.trim()) {
      return NextResponse.json({ error: "Ingresa al menos 1 o 2 ingredientes que tengas en casa." }, { status: 400 });
    }

    const name = profile?.name || "Guerrero";
    const goal = profile?.goal || "Mejorar su físico";
    const pRemain = remainingMacros?.protein ?? 45;
    const cRemain = remainingMacros?.carbs ?? 55;
    const fRemain = remainingMacros?.fats ?? 18;
    const calRemain = remainingMacros?.calories ?? 550;

    const systemPrompt = `
Eres el Chef y Nutricionista Deportivo de Fitmax.
Crea una receta FITNESS deliciosa usando los ingredientes disponibles del usuario:
- Meta: ${goal}
- Macros faltantes hoy: ~${pRemain}g Proteína, ~${cRemain}g Carbos, ~${fRemain}g Grasas (~${calRemain} kcal).
- Tiempo: ${prepTime || "10-15 min"}.

Responde ÚNICAMENTE con un JSON válido sin markdown ni comillas triples:
{
  "title": "Nombre apetitoso del platillo",
  "prepTime": "Tiempo estimado (ej. 12 min)",
  "difficulty": "Fácil",
  "ingredientsWithPortions": ["150g de atún en agua...", "3 tortillas de maíz...", "..."],
  "steps": ["Paso 1...", "Paso 2...", "..."],
  "macros": { "protein": ${Math.round(pRemain * 0.8)}, "carbs": ${Math.round(cRemain * 0.8)}, "fats": ${Math.round(fRemain * 0.8)}, "calories": ${Math.round(calRemain * 0.8)} },
  "chefTip": "Consejo culinario o de absorción nutricional."
}
`;

    const userPrompt = `Ingredientes disponibles: ${ingredients}. Adapta las porciones a mis macros de hoy.`;

    let recipeData: any = null;

    // 1. Try Google Gemini with strict 3.2s timeout
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-lite-latest",
          systemInstruction: systemPrompt
        });

        const geminiPromise = model.generateContent(userPrompt);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("GeminiTimeout")), 3200)
        );

        const result: any = await Promise.race([geminiPromise, timeoutPromise]);
        const response = await result.response;
        let text = response.text().trim();

        if (text.startsWith("```json")) text = text.replace(/^```json/, "");
        if (text.startsWith("```")) text = text.replace(/^```/, "");
        if (text.endsWith("```")) text = text.replace(/```$/, "");

        recipeData = JSON.parse(text.trim());
      } catch (e: any) {
        console.warn("Gemini Chef failed:", e?.message);
      }
    }

    // 2. High-Capacity Universal Cloud LLM Fallback with AbortSignal.timeout(3500)
    if (!recipeData) {
      try {
        console.warn("Chef AI: Using Universal Cloud LLM Fallback (max 3.5s)...");
        const llmRes = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            model: "openai",
            jsonMode: true,
            seed: 99
          }),
          signal: AbortSignal.timeout(3500)
        });

        if (llmRes.ok) {
          let text = await llmRes.text();
          if (text.startsWith("```json")) text = text.replace(/^```json/, "");
          if (text.startsWith("```")) text = text.replace(/^```/, "");
          if (text.endsWith("```")) text = text.replace(/```$/, "");
          recipeData = JSON.parse(text.trim());
        }
      } catch (err: any) {
        console.warn("Universal Chef LLM fallback failed:", err?.message);
      }
    }

    // 3. Instant Smart Algorithmic Recipe Generator (Zero-latency Guaranteed Fallback)
    if (!recipeData || !recipeData.title) {
      console.warn("Chef AI: Generating Instant Algorithmic Custom Recipe...");
      const textLower = ingredients.toLowerCase();

      const hasEggs = textLower.includes("huevo");
      const hasTuna = textLower.includes("atun") || textLower.includes("atún");
      const hasChicken = textLower.includes("pollo");
      const hasTortillas = textLower.includes("tortilla");
      const hasAvocado = textLower.includes("aguacate") || textLower.includes("palta");
      const hasBanana = textLower.includes("platano") || textLower.includes("plátano");
      const hasMilk = textLower.includes("leche");
      const hasOats = textLower.includes("avena");
      const hasBread = textLower.includes("pan");
      const hasRice = textLower.includes("arroz");
      const hasCheese = textLower.includes("queso");
      const hasTomato = textLower.includes("jitomate") || textLower.includes("tomate");

      const portionsList: string[] = [];
      const stepsList: string[] = [];
      let calcProtein = 0;
      let calcCarbs = 0;
      let calcFats = 0;

      // Protein sources
      if (hasTuna) {
        portionsList.push("140g de Atún en agua (escurrido) - [~32g Proteína]");
        calcProtein += 32;
      }
      if (hasEggs) {
        const eggCount = hasTuna ? 2 : 3;
        portionsList.push(`${eggCount} piezas de Huevo entero - [~${eggCount * 6}g Proteína, ~${eggCount * 5}g Grasas]`);
        calcProtein += eggCount * 6;
        calcFats += eggCount * 5;
      }
      if (hasChicken) {
        portionsList.push("150g de Pechuga de pollo deshebrada o en cubos - [~35g Proteína, 3g Grasas]");
        calcProtein += 35;
        calcFats += 3;
      }
      if (!hasTuna && !hasEggs && !hasChicken) {
        portionsList.push("2 piezas de Huevo entero o 1 lata de Atún sugerida - [~18g Proteína]");
        calcProtein += 18;
        calcFats += 8;
      }

      // Carb sources
      if (hasTortillas) {
        portionsList.push("3 a 4 piezas de Tortilla de maíz calientes - [~35g Carbos]");
        calcCarbs += 35;
      }
      if (hasRice) {
        portionsList.push("1 taza (150g) de Arroz cocido - [~42g Carbos]");
        calcCarbs += 42;
      }
      if (hasBread) {
        portionsList.push("2 rebanadas de Pan integral tostado - [~26g Carbos, ~4g Proteína]");
        calcCarbs += 26;
        calcProtein += 4;
      }
      if (hasBanana) {
        portionsList.push("1 pieza de Plátano maduro en rodajas - [~27g Carbos]");
        calcCarbs += 27;
      }
      if (hasOats) {
        portionsList.push("50g de Hojuelas de avena - [~30g Carbos, 6g Proteína]");
        calcCarbs += 30;
        calcProtein += 6;
      }

      // Fats & vegetables
      if (hasAvocado) {
        portionsList.push("60g (aprox. 1/3 de pieza) de Aguacate fresco - [~9g Grasas buenas]");
        calcFats += 9;
      }
      if (hasMilk) {
        portionsList.push("200ml de Leche fresca o descremada - [~7g Proteína, ~10g Carbos]");
        calcProtein += 7;
        calcCarbs += 10;
      }
      if (hasCheese) {
        portionsList.push("40g de Queso panela o Oaxaca bajo en grasa - [~8g Proteína, 7g Grasas]");
        calcProtein += 8;
        calcFats += 7;
      }
      if (hasTomato) {
        portionsList.push("1 pieza de Jitomate picado con cebolla y especias al gusto");
      }

      // Dynamic cooking steps
      if (hasEggs && hasTuna) {
        stepsList.push("En un tazón, escurre bien el atún y bátelo con los huevos enteros, añadiendo una pizca de sal y pimienta.");
        stepsList.push("Calienta un sartén antiadherente a fuego medio y cocina la mezcla de atún con huevo revolviendo suavemente hasta que quede jugoso.");
        if (hasTortillas) {
          stepsList.push("Calienta las tortillas y monta unos tacos altos en proteína con el revuelto.");
        }
        if (hasAvocado) {
          stepsList.push("Corona tus tacos con rebanadas de aguacate fresco para aportar ácidos grasos esenciales.");
        }
        if (hasBanana || hasMilk) {
          stepsList.push("Acompaña como postre energético con el plátano en rodajas y el vaso de leche para redondear tus macronutrientes.");
        }
      } else {
        stepsList.push("Prepara y pica tus ingredientes frescos en porciones controladas según la lista.");
        stepsList.push("Cocina tu fuente principal de proteína en una sartén antiadherente con especias al gusto (ajo, sal, orégano).");
        stepsList.push("Integra los acompañamientos y carbohidratos en tu plato asegurando una distribución balanceada.");
        stepsList.push("Sirve caliente y disfruta de una comida 100% alineada a tus requerimientos nutricionales de hoy.");
      }

      const totalCals = (calcProtein * 4) + (calcCarbs * 4) + (calcFats * 9);

      let dishTitle = "Platillo Fitness Fitmax";
      if (hasTuna && hasTortillas) dishTitle = "Tacos Proteicos Fitmax de Atún & Huevo";
      else if (hasEggs && hasAvocado) dishTitle = "Revuelto Energético con Aguacate y Carbos";
      else if (hasChicken) dishTitle = "Bowl Anabólico de Pollo con Ingredientes del Refri";
      else if (hasOats && hasBanana) dishTitle = "Bowl de Avena con Plátano y Proteína";

      recipeData = {
        title: dishTitle,
        prepTime: prepTime || "12 min",
        difficulty: "Fácil",
        ingredientsWithPortions: portionsList,
        steps: stepsList,
        macros: {
          protein: calcProtein,
          carbs: calcCarbs,
          fats: calcFats,
          calories: totalCals
        },
        chefTip: "Añadir orégano, pimienta o jugo de limón potencia el sabor de forma natural sin sumar calorías ni sodio innecesario."
      };
    }

    return NextResponse.json({ recipe: recipeData });
  } catch (error: any) {
    console.error("Chef API Error:", error);
    return NextResponse.json({ error: error.message || "Error al generar la receta." }, { status: 500 });
  }
}
