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

  // Greetings strictly
  if (msg === "hola" || msg === "buenos dias" || msg === "buenas tardes" || msg === "buenas noches" || msg === "hey" || msg === "que tal" || msg === "coach") {
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

  // Motivational / Stoic discipline queries
  if (
    msg.includes("motiva") || msg.includes("frase") || msg.includes("pereza") || 
    msg.includes("desgana") || msg.includes("flojera") || msg.includes("rendir") || 
    msg.includes("anim") || msg.includes("ánimo") || msg.includes("disciplina") ||
    msg.includes("reflexion") || msg.includes("reflexión")
  ) {
    return `Escucha esto, ${name}:

*"El dolor de la disciplina pesa gramos; el dolor del arrepentimiento pesa toneladas."* — Jim Rohn

La motivación es una emoción barata y pasajera que solo dura los primeros 5 minutos; la verdadera disciplina es la decisión de levantarte y hacer lo que te prometiste incluso cuando cada célula de tu cuerpo busca la comodidad del sillón.

No entrenas para el cuerpo que tienes hoy, entrenas para ganarte el respeto propio de la persona en la que te estás convirtiendo. Ponte la ropa, agarra tu agua y da el primer paso. El 80% de la batalla se gana simplemente presentándote a entrenar. ¡Vamos a darle! 🔥`;
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

    if (!process.env.GEMINI_API_KEY) {
      const fallbackResponse = generateCoachFallback(lastMessage, profile, currentMacros, targetMacros);
      return NextResponse.json({ response: fallbackResponse });
    }

    const systemPrompt = `
Eres el Coach IA oficial de Fitmax: un entrenador personal de élite, preparador físico y nutricionista deportivo de vanguardia.
Tienes libertad total para responder a CUALQUIER duda, pregunta o petición del usuario: desde rutinas detalladas de gimnasio o casa, biomecánica, suplementos (creatina, proteína whey, cafeína), alimentos, recetas, mitos de nutrición, dudas de salud general, motivación, o dudas de vida diaria y fitness.

Tu perfil de alumno actual:
- Nombre: ${profile?.name || "Guerrero"}
- Meta: ${profile?.goal || "Mejorar su físico"}
- Sexo: ${profile?.sex || "H"}, Edad: ${profile?.age || 25}, Peso: ${profile?.weight || 75}kg.
- Progreso de macros hoy:
  * Consumido: ${currentMacros?.protein || 0}g Proteína, ${currentMacros?.carbs || 0}g Carbos, ${currentMacros?.fats || 0}g Grasas.
  * Meta diaria: ${targetMacros?.protein || 150}g Proteína, ${targetMacros?.carbs || 200}g Carbos, ${targetMacros?.fats || 60}g Grasas.

Directrices de conversación:
1. Sé 100% conversacional, natural, motivador, empático y profundamente experto. No seas un bot acartonado ni repitas discursos prefabricados.
2. Responde directamente y con profundidad a lo que el usuario pregunte. Si te pregunta sobre qué ejercicios hacer de pecho, cuántas series, cómo manejar la velocidad de bajada (tensión mecánica) y si ir o no al fallo, DESGLÓSALE exactamente cada punto con ejemplos prácticos y fundamentos científicos.
3. Si te preguntan sobre marcas de proteína, recetas con lo que tienen en la cocina, o cómo entrenar con poco tiempo, dales soluciones claras paso a paso.
4. Mantén tus respuestas fáciles de leer en un celular, usando viñetas claras y negritas.
5. Si el usuario te pide frases motivacionales, reflexiones o expresa pereza/desgana: NUNCA uses clichés vacíos ('¡Tú puedes!', 'No pain no gain'). Bríndale reflexiones estoicas profundas y contundentes (inspiradas en Marco Aurelio, Séneca, Epicteto, David Goggins o Alex Hormozi), enfocadas en el respeto propio, la identidad del guerrero y el dominio de la disciplina sobre el impulso momentáneo.
`;

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

    // Models to try in order of preference
    const modelsToTry = ["gemini-flash-lite-latest", "gemini-flash-latest"];
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: systemPrompt 
        });

        const chat = model.startChat({ history });
        const result = await withTimeout(chat.sendMessage(lastMessage || "Hola"), 6000);
        const response = await result.response;
        responseText = response.text();
        if (responseText) break;
      } catch (err: any) {
        lastApiError = err;
        console.warn(`Gemini model ${modelName} failed or timed out:`, err?.message);
      }
    }

    if (responseText) {
      return NextResponse.json({ response: responseText });
    }

    // 2. High-Capacity Universal Cloud LLM Fallback (OpenAI/Llama engine)
    // Ensures the user can ask literally ANYTHING freely with dynamic intelligence
    try {
      console.warn("Activating Universal Free-Form AI Engine...");
      const conversationHistory = [
        { role: "system", content: systemPrompt },
        ...(messages || []).slice(-8).map((m: any) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }))
      ];

      const llmRes = await withTimeout(
        fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversationHistory,
            model: "openai",
            seed: 42
          })
        }),
        7000
      );

      if (llmRes.ok) {
        const aiText = await llmRes.text();
        if (aiText && aiText.trim().length > 10) {
          return NextResponse.json({ response: aiText.trim() });
        }
      }
    } catch (llmErr: any) {
      console.warn("Universal AI Fallback failed:", llmErr?.message);
    }

    // 3. Absolute offline heuristic fallback (only if both cloud engines are unreachable)
    const fallbackResponse = generateCoachFallback(lastMessage, profile, currentMacros, targetMacros);
    return NextResponse.json({ response: fallbackResponse });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      response: "¡Aquí estoy! Cuéntame qué comiste o cómo te fue en tu entrenamiento de hoy para ajustar tus macros." 
    }, { status: 200 });
  }
}
