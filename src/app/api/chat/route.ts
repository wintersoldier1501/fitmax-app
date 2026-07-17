import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages, profile, currentMacros, targetMacros, activeTheme } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        response: "Para hablar con una IA real, necesitas agregar tu GEMINI_API_KEY en las variables de entorno de Vercel. Por ahora, ¡sigo siendo un bot simulado! 🤖" 
      }, { status: 200 }); // Return 200 to not break the UI, but tell them to add the key
    }

    const systemPrompt = `
Eres un Coach Nutricional y Deportivo Profesional de Fitmax. Hablas en español, con un tono motivador, directo, científico pero accesible.
Tu misión principal es ayudar al usuario a alcanzar su meta: ${profile?.goal || "Mejorar su físico"}.
Perfil del usuario: ${profile?.name}, ${profile?.sex}, Edad: ${profile?.age}, Peso: ${profile?.weight}kg.
Macros de hoy: 
- Consumidos: ${currentMacros?.protein}g Proteína, ${currentMacros?.carbs}g Carbos, ${currentMacros?.fats}g Grasas.
- Meta diaria: ${targetMacros?.protein}g Proteína, ${targetMacros?.carbs}g Carbos, ${targetMacros?.fats}g Grasas.

Reglas:
1. Responde de manera concisa y directa. No des respuestas larguísimas a menos que el usuario lo pida.
2. Anima al usuario basándote en sus macros actuales.
3. Si el usuario te dice que acaba de comer algo, dile cuántos macros estima que tiene, pero RECUÉRDALE que para que se sumen a su anillo debe usar el "Escáner Láser" o el "Buscador Manual" en el botón central de Fitmax.
4. No uses lenguaje robótico. Eres su coach personal en su bolsillo.
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      systemInstruction: systemPrompt 
    });

    // Convert history to Gemini format
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Gemini API requires the first message in history to be from 'user'.
    if (history.length > 0 && history[0].role === "model") {
      history.unshift({
        role: "user",
        parts: [{ text: "Hola Coach, necesito tu ayuda." }]
      });
    }

    const chat = model.startChat({
      history: history
    });

    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
