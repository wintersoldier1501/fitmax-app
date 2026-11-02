import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
  ]);

export async function POST(req: Request) {
  try {
    const { ingredients, profile, remainingMacros, prepTime } = await req.json();

    if (!ingredients || !ingredients.trim()) {
      return NextResponse.json({ error: "Ingresa al menos 1 o 2 ingredientes que tengas en casa." }, { status: 400 });
    }

    const name = profile?.name || "Guerrero";
    const goal = profile?.goal || "Mejorar su físico";
    const pRemain = remainingMacros?.protein ?? 40;
    const cRemain = remainingMacros?.carbs ?? 50;
    const fRemain = remainingMacros?.fats ?? 15;
    const calRemain = remainingMacros?.calories ?? 450;

    const systemPrompt = `
Eres el Chef y Nutricionista Deportivo de Fitmax.
Tu misión es crear una receta FITNESS deliciosa, práctica y rápida usando los ingredientes que el usuario tiene disponibles en su cocina o refrigerador.
Calcula las cantidades y porciones de los ingredientes para que se aproximen lo más posible a los macros que le faltan al usuario hoy:
- Meta del usuario: ${goal}
- Macros que le faltan consumir hoy: ~${pRemain}g Proteína, ~${cRemain}g Carbos, ~${fRemain}g Grasas (~${calRemain} kcal).
- Tiempo de preparación deseado: ${prepTime || "5 a 15 minutos"}.

Reglas obligatorias:
1. Responde ÚNICAMENTE con un objeto JSON válido, sin bloques de código Markdown (sin \`\`\`json ni \`\`\`), con esta estructura exacta:
{
  "title": "Nombre apetitoso y fit del platillo",
  "prepTime": "Tiempo estimado (ej. 10 min)",
  "difficulty": "Fácil o Media",
  "ingredientsWithPortions": [
    "Ingrediente 1 con porción en gramos/piezas y aporte nutricional estimado",
    "Ingrediente 2...",
    "Ingrediente 3..."
  ],
  "steps": [
    "Paso 1 conciso...",
    "Paso 2 conciso...",
    "Paso 3..."
  ],
  "macros": {
    "protein": <numero entero en gramos>,
    "carbs": <numero entero en gramos>,
    "fats": <numero entero en gramos>,
    "calories": <numero entero total de calorias>
  },
  "chefTip": "Un consejo científico o culinario para mejorar el sabor o la absorción de nutrientes."
}
2. Si los ingredientes proporcionados no tienen suficiente proteína (ej. solo tiene lechuga y tomate), sugiere en los ingredientes añadir un básico proteico (ej. 2 huevos, atún o pechuga) para que no descuadre sus macros de ${goal}.
`;

    const userPrompt = `Tengo estos ingredientes en mi refrigerador y alacena: ${ingredients}. Créame la mejor receta posible para mis macros restantes de hoy.`;

    let recipeData: any = null;

    // 1. Try Google Gemini
    if (process.env.GEMINI_API_KEY) {
      const modelsToTry = ["gemini-flash-lite-latest", "gemini-flash-latest"];
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt
          });

          const result = await withTimeout(model.generateContent(userPrompt), 7000);
          const response = await result.response;
          let text = response.text().trim();

          // Clean markdown wrappers if returned
          if (text.startsWith("```json")) text = text.replace(/^```json/, "");
          if (text.startsWith("```")) text = text.replace(/^```/, "");
          if (text.endsWith("```")) text = text.replace(/```$/, "");

          recipeData = JSON.parse(text.trim());
          if (recipeData && recipeData.title && recipeData.macros) break;
        } catch (e: any) {
          console.warn(`Gemini Chef model ${modelName} failed:`, e?.message);
        }
      }
    }

    // 2. High-Capacity Universal Cloud LLM Fallback (OpenAI/Llama engine)
    if (!recipeData) {
      try {
        console.warn("Chef AI: Using Universal Cloud LLM Fallback...");
        const llmRes = await withTimeout(
          fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              model: "openai",
              jsonMode: true,
              seed: 123
            })
          }),
          8000
        );

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

    // 3. Fallback Heuristic Recipe if both cloud engines are unreachable
    if (!recipeData) {
      const p = Math.max(25, pRemain);
      const c = Math.max(30, cRemain);
      const f = Math.max(10, fRemain);
      recipeData = {
        title: `Salteado Fitness Fitmax con ${ingredients.split(",")[0] || "Ingredientes del Refri"}`,
        prepTime: "10 min",
        difficulty: "Fácil",
        ingredientsWithPortions: [
          `Base de ingredientes: ${ingredients}`,
          "2 piezas de huevo o 1 lata de atún (fuente de proteína)",
          "1 cucharadita de aceite de oliva (grasas saludables)",
          "Especias al gusto (sal, pimienta, ajo en polvo)"
        ],
        steps: [
          "Calienta una sartén antiadherente a fuego medio con unas gotas de aceite de oliva.",
          "Agrega tus ingredientes picados y saltea por 3 a 5 minutos.",
          "Incorpora la fuente de proteína y cocina hasta que todo quede bien integrado.",
          "Sirve inmediatamente caliente."
        ],
        macros: {
          protein: p,
          carbs: c,
          fats: f,
          calories: (p * 4) + (c * 4) + (f * 9)
        },
        chefTip: "Usa hierbas y especias libres de calorías para elevar el sabor sin sumar grasas ni carbohidratos extras."
      };
    }

    return NextResponse.json({ recipe: recipeData });
  } catch (error: any) {
    console.error("Chef API Error:", error);
    return NextResponse.json({ error: error.message || "Error al generar la receta." }, { status: 500 });
  }
}
