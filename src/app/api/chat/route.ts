import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function generateCoachFallback(
  lastMessage: string,
  profile: any,
  currentMacros: any,
  targetMacros: any,
  todayReadiness?: any
): string {
  const msg = (lastMessage || "").toLowerCase().trim();
  const name = profile?.name || "Guerrero";
  const goal = profile?.goal || "Recomposición Corporal";
  const pDiff = Math.max(0, (targetMacros?.protein || 0) - (currentMacros?.protein || 0));
  const cDiff = Math.max(0, (targetMacros?.carbs || 0) - (currentMacros?.carbs || 0));
  const calRemaining = Math.max(0, (targetMacros?.calories || 0) - (currentMacros?.calories || 0));

  // Explicit agentic food log fallback
  if ((msg.includes("registr") || msg.includes("agreg")) && (msg.includes("whey") || msg.includes("prote"))) {
    return `¡Listo, ${name}! Aquí tienes tu **1 Scoop de Proteína Whey** listo para sumarse a tus macros de hoy (24g P, 3g C, 1.5g G, 122 kcal). Pulsa el botón de abajo para aplicarlo al instante.\n\n<<<ACTION:{"type":"LOG_FOOD","payload":{"name":"1 Scoop Proteína Whey","protein":24,"carbs":3,"fats":2,"calories":126}}>>>`;
  }

  if ((msg.includes("registr") || msg.includes("agreg") || msg.includes("tome") || msg.includes("tomé")) && msg.includes("agua")) {
    return `¡Excelente hidratación, ${name}! Vamos a sumar **2 vasos de agua (500 ml)** a tu marcador diario.\n\n<<<ACTION:{"type":"ADD_WATER","payload":{"glasses":2}}>>>`;
  }

  if (msg.includes("blindar") || ((msg.includes("reserv") || msg.includes("cena") || msg.includes("fiesta") || msg.includes("boda")) && (msg.includes("kcal") || msg.includes("calor")))) {
    const kcalMatch = msg.match(/(\d{3,4})/);
    const reserveKcal = kcalMatch ? Math.max(400, Math.min(1600, parseInt(kcalMatch[1], 10))) : 900;
    return `¡Estrategia de **Escudo Social** lista, ${name}! Reservaremos **${reserveKcal} kcal** para tu evento nocturno mientras protegemos al 100% tu proteína diaria.\n\n<<<ACTION:{"type":"ACTIVATE_SOCIAL_BANK","payload":{"reservedCalories":${reserveKcal},"eventName":"Evento / Cena Social"}}>>>`;
  }

  if (msg.includes("paso") && /\d{3,5}/.test(msg)) {
    const stepMatch = msg.replace(/,/g, "").match(/(\d{3,5})/);
    const stepsNum = stepMatch ? Math.max(500, parseInt(stepMatch[1], 10)) : 8000;
    return `¡Excelente NEAT, ${name}! Pulsa abajo para registrar **${stepsNum.toLocaleString()} pasos** en tu marcador de actividad híbrida hoy.\n\n<<<ACTION:{"type":"SET_STEPS","payload":{"steps":${stepsNum}}}>>>`;
  }

  if (msg === "hola" || msg === "buenos dias" || msg === "buenas tardes" || msg === "buenas noches" || msg === "hey" || msg === "que tal" || msg === "coach") {
    return `¡Hola ${name}! Aquí tu Coach Fitmax. Hoy tu meta es **${goal}**. Llevas consumidos **${currentMacros?.protein || 0}g de proteína** y te faltan **${pDiff}g** (${calRemaining} kcal disponibles). ¿En qué trabajamos hoy?`;
  }

  if (
    msg.includes("motiva") || msg.includes("frase") || msg.includes("pereza") ||
    msg.includes("desgana") || msg.includes("flojera") || msg.includes("rendir") ||
    msg.includes("anim") || msg.includes("ánimo") || msg.includes("disciplina") ||
    msg.includes("reflexion") || msg.includes("reflexión") || msg.includes("estoic")
  ) {
    return `Escucha esto, **${name}**:\n\n> *"No me importa el rango que me hayan quitado ni las cicatrices que lleve en la carne. Mientras tenga aire en los pulmones, mi deber sigue siendo exactamente el mismo: dar un paso al frente y avanzar."* — Demetrian Titus\n\nLa motivación es una emoción pasajera; la disciplina es cumplir la palabra que te diste incluso cuando no tienes ganas. Ponte tus tenis y cumple al menos la primera serie. ¡El resto llega solo!`;
  }

  if (msg.includes("fatiga") || msg.includes("cansad") || msg.includes("sueño") || msg.includes("readiness")) {
    const scoreText = todayReadiness ? `Tu **Readiness actual es de ${todayReadiness.score}%**` : "Aún no registras tu sueño de hoy en Diario";
    return `${scoreText}. Si dormiste poco o traes fatiga acumulada en el Sistema Nervioso Central:\n\n- Reduce **1 serie** en los ejercicios multiarticulares pesados.\n- Trabaja a **RIR 2-3** en lugar de ir al fallo absoluto.\n- Prioriza hidratación (+500 ml) y 30g de proteína antes de dormir.`;
  }

  if (msg.includes("pecho")) {
    return `Para tu sesión de pecho en **${goal}**:\n\n- **Volumen óptimo:** 2 a 3 ejercicios (ej. Press inclinado con mancuernas, Press plano y Cruces en polea), con 3-4 series cada uno.\n- **Tensión mecánica:** Baja controlado en 2-3 segundos sintiendo el estiramiento y sube explosivo.\n- **RIR:** Quédate a RIR 1-2 en los presses y deja el fallo técnico solo para la última serie de cruces.`;
  }

  if (
    msg.includes("comi") || msg.includes("comí") || msg.includes("desayun") ||
    msg.includes("cen") || msg.includes("almorz") || msg.includes("huevo") ||
    msg.includes("pollo") || msg.includes("atun") || msg.includes("arroz") ||
    msg.includes("avena") || msg.includes("proteina") || msg.includes("proteína") ||
    msg.includes("caloria") || msg.includes("caloría") || msg.includes("tacos") || msg.includes("carne")
  ) {
    return `¡Excelente, ${name}! Si acabas de comer eso, puedes usar el **Registro Mágico por Texto o Voz** en la pestaña Diario para desglosarlo en 2 segundos. Aún te restan **${calRemaining} kcal** y **${pDiff}g de proteína** hoy.`;
  }

  return `Entendido, **${name}**. En tu plan de **${goal}**, te restan **${pDiff}g de proteína**, **${cDiff}g de carbos** y **${calRemaining} kcal** por cubrir hoy.\n\n- Mantén tu hidratación alta y el descanso en 7-8 horas.\n- Si quieres que registre una comida, sume vasos de agua o ajuste tu rutina directamente desde aquí, solo pídemelo.`;
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      profile,
      currentMacros,
      targetMacros,
      waterGlasses,
      todayReadiness,
      customWorkoutPlan,
      streak,
      biometrics,
      dailySteps,
      stepsGoal,
      exercisePRs,
      recentWorkoutsCount,
      todaySocialBank
    } = await req.json();

    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

    if (!process.env.GEMINI_API_KEY) {
      const fallbackResponse = generateCoachFallback(lastMessage, profile, currentMacros, targetMacros, todayReadiness);
      return NextResponse.json({ response: fallbackResponse });
    }

    const splitSummary = customWorkoutPlan?.days?.length
      ? `${customWorkoutPlan.splitTitle} (${customWorkoutPlan.days.map((d: any, idx: number) => `Día ${idx + 1}: ${d.dayName} [${(d.exercises || []).map((e: any) => e.name).join(", ")}]`).join(" | ")})`
      : "Sin split personalizado guardado aún";

    const readinessSummary = todayReadiness
      ? `${todayReadiness.score}% (Sueño: ${todayReadiness.sleepHours}h, Calidad: ${todayReadiness.sleepQuality}/10, Fatiga: ${todayReadiness.fatigue}/10)`
      : "No evaluado hoy";

    const topPRsSummary =
      exercisePRs && Object.keys(exercisePRs).length > 0
        ? Object.entries(exercisePRs)
            .sort((a: any, b: any) => (b[1]?.best1RM || 0) - (a[1]?.best1RM || 0))
            .slice(0, 3)
            .map(([n, pr]: any) => `${n}: ${pr.weight}kg×${pr.reps} (1RM est. ${pr.best1RM}kg)`)
            .join(" | ")
        : "Aún sin PRs registrados";

    const biometricsSummary = biometrics?.bodyFatPercentage
      ? `${biometrics.bodyFatPercentage}% grasa corporal, ${biometrics.leanMass} kg masa magra`
      : "Sin pliegues/US Navy capturados";

    const socialBankSummary = todaySocialBank?.active
      ? `Activo: ${todaySocialBank.reservedCalories} kcal para "${todaySocialBank.eventName}" (${todaySocialBank.released ? "Liberado" : "Blindado"})`
      : "Inactivo";

    const systemPrompt = `
Eres el Coach IA Agéntico oficial de Fitmax: entrenador personal de élite, preparador físico basado en ciencia (Schoenfeld, Israetel, Helms) y nutricionista deportivo.

Contexto en tiempo real del alumno:
- Nombre: ${profile?.name || "Guerrero"} | Meta: ${profile?.goal || "Mejorar físico"} | Racha: ${streak || 0} días
- Datos: ${profile?.sex || "H"}, ${profile?.age || 25} años, ${profile?.weight || 75} kg (${biometricsSummary})
- Macros consumidos hoy: ${currentMacros?.protein || 0}g Proteína, ${currentMacros?.carbs || 0}g Carbos, ${currentMacros?.fats || 0}g Grasas (${currentMacros?.calories || 0} kcal)
- Meta diaria: ${targetMacros?.protein || 150}g Proteína, ${targetMacros?.carbs || 200}g Carbos, ${targetMacros?.fats || 60}g Grasas (${targetMacros?.calories || 2000} kcal)
- Hidratación hoy: ${(waterGlasses || 0) * 250} ml | Pasos NEAT hoy: ${dailySteps || 0} / ${stepsGoal || 10000}
- Escudo Social hoy: ${socialBankSummary}
- Readiness / Recuperación hoy: ${readinessSummary}
- Entrenos recientes (últimos registros): ${recentWorkoutsCount ?? 0} | Top PRs: ${topPRsSummary}
- Split activo: ${splitSummary}

Directrices de conversación:
1. Sé conversacional, natural, claro y experto. Responde con precisión científica a cualquier pregunta.
2. Usa Markdown limpio (**negritas**, listas con viñetas, citas \`>\` para reflexiones) fácil de leer en celular.
3. Si pide motivación o expresa pereza: evita clichés vacíos; entrega psicología real, estoicismo (Marco Aurelio, Séneca, Epicteto) o frases épicas de disciplina (David Goggins, Demetrian Titus, Kratos, Mishima).

PROTOCOLO DE ACCIONES AGÉNTICAS EN LA APP:
SOLO cuando el usuario pida explícitamente que registres una comida/bebida, agregues vasos de agua, ajustes sus calorías diarias, cambies un ejercicio de su split, blindes calorías para una cena/evento o registres sus pasos diarios, añade UNA SOLA línea al FINAL de tu respuesta con este formato JSON exacto:

- Para registrar comida:
<<<ACTION:{"type":"LOG_FOOD","payload":{"name":"Nombre corto","protein":25,"carbs":10,"fats":3,"calories":167}}>>>
- Para sumar vasos de agua (cada vaso = 250ml):
<<<ACTION:{"type":"ADD_WATER","payload":{"glasses":2}}>>>
- Para ajustar meta calórica (+/- kcal):
<<<ACTION:{"type":"ADJUST_CALORIES","payload":{"delta":-150,"reason":"Ajuste de déficit calórico"}}>>>
- Para reemplazar un ejercicio en su split activo (dayIndex base 0):
<<<ACTION:{"type":"SWAP_EXERCISE","payload":{"dayIndex":0,"targetName":"Press de Banca","newExercise":{"name":"Press Plano con Mancuernas","muscle":"Pecho","sets":"4","reps":"8-10 RIR 2","rest":"2 min","cue":"Controla la bajada 2 seg"}}}>>>
- Para activar Escudo Social (reservar calorías para evento/cena):
<<<ACTION:{"type":"ACTIVATE_SOCIAL_BANK","payload":{"reservedCalories":900,"eventName":"Cena Social"}}>>>
- Para actualizar pasos diarios:
<<<ACTION:{"type":"SET_STEPS","payload":{"steps":9500}}>>>

No emitas <<<ACTION:...>>> si el usuario solo está preguntando información general.
`;

    let responseText: string | null = null;

    // 1. Try primary Gemini model with strict 4.5s timeout
    try {
      const history = (messages || []).slice(-8, -1).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      if (history.length > 0 && history[0].role === "model") {
        history.unshift({
          role: "user",
          parts: [{ text: "Hola Coach, necesito tu ayuda." }]
        });
      }

      const model = genAI.getGenerativeModel({
        model: "gemini-flash-lite-latest",
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({ history });
      const result: any = await Promise.race([
        chat.sendMessage(lastMessage || "Hola"),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("GeminiTimeout")), 4500))
      ]);
      const response = await result.response;
      responseText = response.text();
    } catch (err: any) {
      console.warn("Gemini Chat failed or timed out:", err?.message);
    }

    if (responseText) {
      return NextResponse.json({ response: responseText });
    }

    // 2. Universal Cloud LLM Fallback with strict AbortSignal.timeout(4500)
    try {
      const conversationHistory = [
        { role: "system", content: systemPrompt },
        ...(messages || []).slice(-8).map((m: any) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }))
      ];

      const llmRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          model: "openai",
          seed: 42
        }),
        signal: AbortSignal.timeout(4500)
      });

      if (llmRes.ok) {
        const aiText = await llmRes.text();
        if (aiText && aiText.trim().length > 10) {
          return NextResponse.json({ response: aiText.trim() });
        }
      }
    } catch (llmErr: any) {
      console.warn("Universal Chat AI Fallback failed:", llmErr?.message);
    }

    // 3. Deterministic offline fallback
    const fallbackResponse = generateCoachFallback(lastMessage, profile, currentMacros, targetMacros, todayReadiness);
    return NextResponse.json({ response: fallbackResponse });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        response: "¡Aquí estoy! Cuéntame qué comiste o cómo te fue en tu entrenamiento de hoy para ajustar tus macros."
      },
      { status: 200 }
    );
  }
}
