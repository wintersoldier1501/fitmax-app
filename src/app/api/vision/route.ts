import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "Falta GEMINI_API_KEY en Vercel." 
      }, { status: 400 });
    }

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Extract base64 data (remove "data:image/jpeg;base64,")
    const base64Data = image.split(",")[1] || image;
    const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
Eres un nutricionista experto. Analiza la comida en esta imagen y estima sus macronutrientes.
Responde ÚNICAMENTE con un objeto JSON válido, sin formato Markdown, con esta estructura exacta:
{
  "name": "Nombre descriptivo del platillo",
  "protein": <numero entero de gramos>,
  "carbs": <numero entero de gramos>,
  "fats": <numero entero de gramos>,
  "calories": <numero entero total de calorias>
}
Si la imagen no parece comida, intenta adivinar o devuelve valores en 0, pero siempre devuelve el JSON.
`;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up markdown if the AI includes it despite instructions
    if (text.startsWith("\`\`\`json")) text = text.replace("\`\`\`json", "");
    if (text.startsWith("\`\`\`")) text = text.replace("\`\`\`", "");
    if (text.endsWith("\`\`\`")) text = text.replace(/\`\`\`$/, "");
    
    const parsedData = JSON.parse(text.trim());

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
