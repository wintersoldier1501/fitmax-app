import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { image, mode = "meal" } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY en Vercel para analizar imágenes." },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = image.split(",")[1] || image;
    const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";

    let prompt = "";
    if (mode === "label") {
      prompt = `
Eres un lector OCR de tablas nutrimentales experto. Analiza la etiqueta nutricional en esta fotografía y extrae los valores por porción declarada (o por 100g si no hay porción clara).
Responde ÚNICAMENTE con un objeto JSON válido, sin formato Markdown:
{
  "name": "Nombre del producto + tamaño de porción (ej. Proteína Isolate - 1 scoop 30g)",
  "servingSize": "ej. 30g",
  "protein": <entero gramos>,
  "carbs": <entero gramos>,
  "fats": <entero gramos>,
  "calories": <entero kcal>
}
`;
    } else if (mode === "physique") {
      prompt = `
Eres un coach de élite en estética corporal, culturismo natural y recomposición física. Analiza de manera constructiva, objetiva y motivadora esta foto de progreso físico.
Responde ÚNICAMENTE con un objeto JSON válido, sin formato Markdown:
{
  "bodyFatRange": "Estimación visual aproximada (ej. 14% - 16%)",
  "vTaperScore": "Puntuación visual hombro-cintura (ej. 8.1 / 10)",
  "strongPoints": ["Punto fuerte 1", "Punto fuerte 2"],
  "priorityAreas": ["Área prioritaria 1 para potenciar estética", "Área prioritaria 2"],
  "coachAdvice": "Consejo científico y constructivo de 2 oraciones sobre qué priorizar en su próximo mesociclo."
}
`;
    } else {
      prompt = `
Eres un nutricionista experto en visión por computadora. Analiza la comida en esta imagen, desglosa los ingredientes visibles y calcula sus macronutrientes totales.
Responde ÚNICAMENTE con un objeto JSON válido, sin formato Markdown:
{
  "name": "Nombre descriptivo del platillo",
  "items": [
    {
      "name": "Ingrediente visible",
      "portion": "Porción estimada",
      "protein": <entero g>,
      "carbs": <entero g>,
      "fats": <entero g>,
      "calories": <entero kcal>
    }
  ],
  "protein": <suma total entero gramos>,
  "carbs": <suma total entero gramos>,
  "fats": <suma total entero gramos>,
  "calories": <suma total entero kcal>
}
Si la imagen no parece comida, devuelve valores en 0 pero siempre en formato JSON válido.
`;
    }

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ];

    const modelsToTry = ["gemini-flash-latest", "gemini-flash-lite-latest"];
    let text = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result: any = await Promise.race([
          model.generateContent([prompt, ...imageParts]),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("VisionTimeout")), 4500))
        ]);
        const response = await result.response;
        text = response.text().trim();
        if (text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Vision model ${modelName} failed:`, err?.message);
      }
    }

    if (!text) {
      throw lastError || new Error("No se pudo procesar la imagen con los modelos disponibles.");
    }

    if (text.startsWith("```json")) text = text.replace(/^```json/, "");
    if (text.startsWith("```")) text = text.replace(/^```/, "");
    if (text.endsWith("```")) text = text.replace(/```$/, "");

    const parsedData = JSON.parse(text.trim());
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Vision API Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
