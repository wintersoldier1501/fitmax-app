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
    const { daysPerWeek, equipment, focus, level, profile } = await req.json();

    const days = daysPerWeek || 4;
    const equip = equipment || "Gimnasio Comercial Completo";
    const foc = focus || "Balanceado Estético";
    const lev = level || "Intermedio";
    const goal = profile?.goal || "Recomposición Corporal";
    const name = profile?.name || "Guerrero";

    const systemPrompt = `
Eres un Entrenador y Científico de la Hipertrofia de Élite de Fitmax (metodología Schoenfeld, Mike Israetel y Eric Helms).
Tu misión es diseñar un Split Semanal de Entrenamiento Científico 100% personalizado según el equipo disponible, los días y el objetivo del alumno.

Parámetros del alumno:
- Nombre: ${name}
- Meta: ${goal}
- Días disponibles a la semana: ${days} días
- Equipamiento disponible: ${equip}
- Músculo/Enfoque de prioridad: ${foc}
- Nivel de experiencia: ${lev}

Reglas obligatorias:
1. Responde ÚNICAMENTE con un objeto JSON válido, sin bloques de código Markdown (sin \`\`\`json ni \`\`\`), con esta estructura exacta:
{
  "splitTitle": "Nombre atractivo del split (ej. Torso/Pierna Frecuencia 2, Push/Pull/Legs Estético)",
  "daysPerWeek": ${days},
  "equipment": "${equip}",
  "focus": "${foc}",
  "weeklyOverview": "Explicación concisa de 2 oraciones sobre por qué este split maximiza la síntesis proteica para su objetivo.",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Día 1: Nombre de la sesión (ej. Push Enfoque Clavicular)",
      "targetMuscles": "Músculos principales",
      "duration": "Tiempo estimado (ej. 55 min)",
      "exercises": [
        {
          "name": "Nombre exacto del ejercicio adaptado a su equipo",
          "muscle": "Músculo principal",
          "sets": "Número de series (ej. 4)",
          "reps": "Rango de repeticiones y RIR (ej. 8-10 RIR 2)",
          "rest": "Tiempo de descanso (ej. 2 min)",
          "cue": "Indicación técnica clave (ej. Baja en 2-3 seg con rango completo)"
        }
      ]
    }
  ]
}
2. Asegúrate de generar exactamente ${days} días de entrenamiento en el arreglo "days".
3. Adapta todos los ejercicios estrictamente a su equipo (${equip}). Si es en casa sin equipo, usa calistenia y peso corporal. Si son mancuernas, nada de poleas ni barras.
4. Por cada día incluye entre 4 y 6 ejercicios clave con volumen óptimo (10 a 20 series semanales por músculo, no más).
`;

    const userPrompt = `Diseña mi split semanal de ${days} días con equipo ${equip}, nivel ${lev} y prioridad en ${foc}.`;

    let splitData: any = null;

    // 1. Try Google Gemini
    if (process.env.GEMINI_API_KEY) {
      const modelsToTry = ["gemini-flash-lite-latest", "gemini-flash-latest"];
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt
          });

          const result = await withTimeout(model.generateContent(userPrompt), 8000);
          const response = await result.response;
          let text = response.text().trim();

          if (text.startsWith("```json")) text = text.replace(/^```json/, "");
          if (text.startsWith("```")) text = text.replace(/^```/, "");
          if (text.endsWith("```")) text = text.replace(/```$/, "");

          splitData = JSON.parse(text.trim());
          if (splitData && splitData.days && splitData.days.length > 0) break;
        } catch (e: any) {
          console.warn(`Gemini Split model ${modelName} failed:`, e?.message);
        }
      }
    }

    // 2. High-Capacity Universal Cloud LLM Fallback (OpenAI/Llama engine)
    if (!splitData) {
      try {
        console.warn("Split Generator: Using Universal Cloud LLM Fallback...");
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
              seed: 99
            })
          }),
          9000
        );

        if (llmRes.ok) {
          let text = await llmRes.text();
          if (text.startsWith("```json")) text = text.replace(/^```json/, "");
          if (text.startsWith("```")) text = text.replace(/^```/, "");
          if (text.endsWith("```")) text = text.replace(/```$/, "");
          splitData = JSON.parse(text.trim());
        }
      } catch (err: any) {
        console.warn("Universal Split LLM fallback failed:", err?.message);
      }
    }

    // 3. Fallback Heuristic Template if offline
    if (!splitData) {
      splitData = {
        splitTitle: `Split Fitmax ${days} Días (${foc})`,
        daysPerWeek: days,
        equipment: equip,
        focus: foc,
        weeklyOverview: "Diseñado para maximizar la tensión mecánica y la recuperación muscular con progresión semanal.",
        days: Array.from({ length: days }, (_, i) => ({
          dayNumber: i + 1,
          dayName: `Día ${i + 1}: ${i % 2 === 0 ? "Torso / Empuje y Tracción" : "Pierna y Core"}`,
          targetMuscles: i % 2 === 0 ? "Pecho, Espalda, Hombros" : "Cuádriceps, Isquios, Glúteos",
          duration: "50 min",
          exercises: [
            {
              name: i % 2 === 0 ? "Press Compuesto Principal" : "Sentadilla / Prensa",
              muscle: i % 2 === 0 ? "Pectoral / Deltoides" : "Cuádriceps",
              sets: "4",
              reps: "8-10 (RIR 2)",
              rest: "2 min",
              cue: "Fase excéntrica de 2-3 seg con máxima intención concéntrica."
            },
            {
              name: i % 2 === 0 ? "Remo / Tracción Horizontal" : "Peso Muerto Rumano",
              muscle: i % 2 === 0 ? "Dorsales" : "Isquiosurales",
              sets: "4",
              reps: "8-10 (RIR 2)",
              rest: "2 min",
              cue: "Mantén la columna neutra y aprieta 1 seg al final del recorrido."
            },
            {
              name: i % 2 === 0 ? "Elevaciones Laterales" : "Zancadas / Desplantes",
              muscle: i % 2 === 0 ? "Deltoides Lateral" : "Glúteos",
              sets: "3",
              reps: "12-15 (RIR 1)",
              rest: "90 seg",
              cue: "Conexión mente-músculo continua sin balanceos."
            },
            {
              name: i % 2 === 0 ? "Fondos o Cruces" : "Elevación de Gemelos",
              muscle: i % 2 === 0 ? "Tríceps / Pecho" : "Pantorrillas",
              sets: "3",
              reps: "12-15 (Fallo en última serie)",
              rest: "60 seg",
              cue: "Rango de recorrido completo."
            }
          ]
        }))
      };
    }

    return NextResponse.json({ split: splitData });
  } catch (error: any) {
    console.error("Split API Error:", error);
    return NextResponse.json({ error: error.message || "Error al generar el split." }, { status: 500 });
  }
}
