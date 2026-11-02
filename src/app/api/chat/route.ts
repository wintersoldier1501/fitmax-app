import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function generateCoachFallback(
  lastMessage: string,
  profile: any,
  currentMacros: any,
  targetMacros: any
): string {
  const msg = (lastMessage || "").toLowerCase().trim();
  const name = profile?.name || "Guerrero";
  const goal = profile?.goal || "Mejorar tu físico";
  const pDiff = Math.max(0, (targetMacros?.protein || 0) - (currentMacros?.protein || 0));
  const cDiff = Math.max(0, (targetMacros?.carbs || 0) - (currentMacros?.carbs || 0));
  const calRemaining = Math.max(0, (targetMacros?.calories || 0) - (currentMacros?.calories || 0));

  // Greetings
  if (msg.includes("hola") || msg.includes("buen") || msg.includes("hey") || msg.includes("que tal") || msg === "coach") {
    return `¡Hola ${name}! Aquí tu Coach Fitmax. Hoy tu meta es ${goal}. Llevas consumidos ${currentMacros?.protein || 0}g de proteína y te faltan ${pDiff}g para cerrar tu meta diaria. ¿Tienes dudas sobre tu rutina o qué comer hoy?`;
  }

  // Food / Meals queries
  if (
    msg.includes("comi") || msg.includes("comí") || msg.includes("desayun") || 
    msg.includes("cen") || msg.includes("almorz") || msg.includes("huevo") || 
    msg.includes("pollo") || msg.includes("atun") || msg.includes("arroz") || 
    msg.includes("avena") || msg.includes("proteina") || msg.includes("proteína") || 
    msg.includes("caloria") || msg.includes("caloría") || msg.includes("tacos") || 
    msg.includes("carne")
  ) {
    return `¡Excelente registro, ${name}! Si acabas de comer eso, recuerda usar el botón del Escáner central (+) o el buscador en la pestaña Diario para sumarlo con exactitud a tus anillos. Recuerda que aún te quedan ~${calRemaining} kcal y ${pDiff}g de proteína para completar tu requerimiento de hoy. ¡Mantente constante!`;
  }

  // Specific Workout / Chest & Bodybuilding queries
  if (msg.includes("pecho")) {
    return `Para tu sesión de pecho en ${goal}:

1. Número de ejercicios: Haz de 2 a 3 ejercicios máximo (ej. Press inclinado con mancuernas, Press plano con barra o máquina convergente, y Cruces en polea o peck deck).
2. Series: Realiza entre 3 y 4 series por ejercicio (un total de 8 a 10 series efectivas en toda la sesión es el rango óptimo).
3. Velocidad y Tensión Mecánica: No necesitas moverte en cámara lenta. La clave es controlar la fase excéntrica (bajar el peso en 2 a 3 segundos sintiendo el estiramiento del pectoral) y subir de forma potente (1 segundo).
4. ¿Al fallo?: NUNCA vayas al fallo en todas las series porque freirás tu sistema nervioso central. Haz tus primeras series a RIR 1-2 (detente cuando sientas que solo podrías sacar 1 o 2 repeticiones más con buena técnica). Deja el fallo muscular únicamente para la última serie del último ejercicio de aislamiento.`;
  }

  // Workouts / Training general
  if (
    msg.includes("entren") || msg.includes("rutina") || msg.includes("ejercicio") || 
    msg.includes("gym") || msg.includes("pesas") || msg.includes("espalda") || 
    msg.includes("pierna") || msg.includes("rir") || msg.includes("fallo") || msg.includes("cardio")
  ) {
    return `Para ${goal}, la clave es el estímulo eficiente:
- Volumen por sesión: 2 a 4 ejercicios por grupo muscular, con 3 a 4 series efectivas por ejercicio (6 a 12 series totales por sesión).
- Tensión mecánica: Controla la bajada en 2-3 segundos con rango de movimiento completo.
- Esfuerzo (RIR): Quédate a 1-2 repeticiones del fallo técnico en series pesadas compuestas. El fallo absoluto resérvalo para la última serie en máquinas o poleas.
¿Qué grupo muscular te toca entrenar hoy?`;
  }

  // Plateau / Weight stuck
  if (
    msg.includes("estancad") || msg.includes("no bajo") || msg.includes("no subo") || 
    msg.includes("peso") || msg.includes("progreso")
  ) {
    return `Los estancamientos (plateaus) son adaptaciones metabólicas normales. Para evaluar si es retención hídrica o estancamiento calórico real, revisa tu promedio de peso de las últimas 2 semanas. Si se mantiene igual, podemos reducir 150 kcal en carbohidratos o aumentar tu gasto con 2,000 pasos diarios extra sin sacrificar masa muscular.`;
  }

  // General fallback
  return `Entendido, ${name}. Como tu coach enfocado en ${goal}, te recuerdo mantener la disciplina en tus macronutrientes: te restan ${pDiff}g de proteína y ${cDiff}g de carbohidratos para el día. Mantén la hidratación alta y el descanso en 7-8 horas para optimizar tu síntesis proteica. ¿Qué otro detalle de tu plan quieres ajustar?`;
}

export async function POST(req: Request) {
  try {
    const { messages, profile, currentMacros, targetMacros, activeTheme } = await req.json();

    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

    // Debug: Check which models are genuinely available to this API key in Google Cloud/AI Studio
    if (lastMessage === "LIST_MODELS_DEBUG") {
      try {
        const key = process.env.GEMINI_API_KEY || "";
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();
        const modelNames = data.models ? data.models.map((m: any) => m.name.replace("models/", "")) : data;
        return NextResponse.json({ availableModels: modelNames, keyPrefix: key.slice(0, 8) });
      } catch (e: any) {
        return NextResponse.json({ debugFetchError: e.message });
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      // If no key configured, use the smart local coach fallback
      const fallbackResponse = generateCoachFallback(lastMessage, profile, currentMacros, targetMacros);
      return NextResponse.json({ response: fallbackResponse });
    }

    const systemPrompt = `
Eres un Coach Nutricional y Deportivo Profesional de Fitmax. Hablas en español, con un tono motivador, directo, científico pero accesible.
Tu misión principal es ayudar al usuario a alcanzar su meta: ${profile?.goal || "Mejorar su físico"}.
Perfil del usuario: ${profile?.name || "Guerrero"}, ${profile?.sex || "H"}, Edad: ${profile?.age || 25}, Peso: ${profile?.weight || 75}kg.
Macros de hoy: 
- Consumidos: ${currentMacros?.protein || 0}g Proteína, ${currentMacros?.carbs || 0}g Carbos, ${currentMacros?.fats || 0}g Grasas.
- Meta diaria: ${targetMacros?.protein || 150}g Proteína, ${targetMacros?.carbs || 200}g Carbos, ${targetMacros?.fats || 60}g Grasas.

Reglas:
1. Responde de manera concisa y directa (máximo 2 a 3 párrafos cortos).
2. Anima al usuario basándote en sus macros actuales.
3. Si el usuario te dice que acaba de comer algo, dile cuántos macros estima que tiene, pero RECUÉRDALE que para que se sumen a su anillo debe usar el "Escáner Láser" o el "Buscador Manual" en el botón central de Fitmax.
4. No uses lenguaje robótico. Eres su coach personal en su bolsillo.
`;

    // Models to try in order of preference
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.8-flash-lite", "gemini-3.8-pro"];
    let responseText: string | null = null;
    let lastApiError: any = null;

    // Convert history to Gemini format
    const history = (messages || []).slice(0, -1).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    if (history.length > 0 && history[0].role === "model") {
      history.unshift({
        role: "user",
        parts: [{ text: "Hola Coach, necesito tu ayuda." }]
      });
    }

    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
      ]);

    const errorsByModel: Record<string, string> = {};

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemPrompt 
          });

          const chat = model.startChat({
            history: history
          });

          const result = await withTimeout(chat.sendMessage(lastMessage || "Hola"), 12000);
          const response = await result.response;
          responseText = response.text();
          if (responseText) break;
        } catch (err: any) {
          errorsByModel[`${modelName}_att${attempt}`] = err?.message || String(err);
          lastApiError = err;
          // If 503 (high demand), short pause to let demand spike pass
          if (err?.message?.includes("503") && attempt === 1) {
            await new Promise(r => setTimeout(r, 600));
            continue;
          }
          break;
        }
      }
      if (responseText) break;
    }

    if (responseText) {
      return NextResponse.json({ response: responseText });
    }

    // If Gemini fails (quota limit, region, timeout, etc.), activate the coach fallback
    console.warn("Activating Coach Fallback due to API error:", lastApiError?.message);
    const fallbackResponse = generateCoachFallback(lastMessage, profile, currentMacros, targetMacros);
    return NextResponse.json({ response: fallbackResponse });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      response: "¡Aquí estoy! Cuéntame qué comiste o cómo te fue en tu entrenamiento de hoy para ajustar tus macros." 
    }, { status: 200 });
  }
}
