import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Recommendation {
  badge: string;
  dishName: string;
  waiterHack: string;
  whyItFits: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

interface RestaurantStrategyResponse {
  venueTitle: string;
  tacticalRule: string;
  drinkHack: string;
  recommendations: Recommendation[];
}

function cleanJsonText(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```json")) text = text.replace(/^```json/, "");
  if (text.startsWith("```")) text = text.replace(/^```/, "");
  if (text.endsWith("```")) text = text.replace(/```$/, "");
  return text.trim();
}

function buildHeuristicFallback(
  query: string,
  protTarget: number,
  carbBudget: number,
  fatBudget: number,
  calBudget: number
): RestaurantStrategyResponse {
  const q = (query || "").toLowerCase();

  const scaleMacros = (pRatio: number, cRatio: number, fRatio: number) => {
    const protein = Math.max(22, Math.min(85, Math.round(protTarget * pRatio)));
    const carbs = Math.max(8, Math.min(130, Math.round(carbBudget * cRatio)));
    const fats = Math.max(7, Math.min(52, Math.round(fatBudget * fRatio)));
    const calories = protein * 4 + carbs * 4 + fats * 9;
    return { protein, carbs, fats, calories };
  };

  if (/(taco|taquer|pastor|sirloin|bistec|asada|suadero|trompo)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Taquería / Parrilla",
      tacticalRule:
        "Pide los tacos 'sin copia' (1 sola tortilla), evita chicharrón, chorizo y tortillas pasadas por grasa.",
      drinkHack: "Agua mineral con limón y sal o refresco zero (ahorras ~180 kcal de azúcar líquida).",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "4 Tacos de Bistec, Arrachera o Sirloin (Sin Copia)",
          waiterHack:
            "Pídelos 'con una sola tortilla por taco, carne asada sin aceite extra en la plancha y cebolla/cilantro'.",
          whyItFits: "Maximiza proteína magra de res con carbohidratos controlados (~50g C en 4 tortillas).",
          macros: scaleMacros(0.95, 0.85, 0.75)
        },
        {
          badge: "🥈 Corte & Queso",
          dishName: "Alambre o Costra de Pollo / Res con Tortillas Aparte",
          waiterHack:
            "Pide 'el queso panela o asadero moderado, sin tocino y sin mantequilla en la plancha; tortillas aparte'.",
          whyItFits: "Gran densidad proteica y saciedad prolongada administrando exactamente cuántas tortillas comes.",
          macros: scaleMacros(1.0, 0.65, 0.9)
        },
        {
          badge: "🥉 Ligero / Definición",
          dishName: "3 Tacos de Pastor Magro o Pechuga + Nopales Asados",
          waiterHack:
            "Pide 'carne magra sin gordito, salsa verde cruda aparte y una orden de nopal asado sin aceite'.",
          whyItFits: "Aporta volumen gástrico con fibra y mantiene tus grasas bajo control.",
          macros: scaleMacros(0.75, 0.7, 0.6)
        }
      ]
    };
  }

  if (/(sushi|japon|poke|roll|ramen|teriyaki|sashimi|oriental)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Sushi / Japonés / Poke",
      tacticalRule:
        "Huye de todo lo 'tempura / empanizado' y elimina quesos crema y salsas dulces con mayonesa (chipotle/tampico).",
      drinkHack: "Té verde frío o caliente sin azúcar o agua mineral con limón.",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "Poke Bowl Proteico Base Mitad Arroz / Mitad Lechuga",
          waiterHack:
            "Pide 'doble porción de atún/salmón fresco, mitad arroz blanco y mitad mix verde, soya normal y aderezo spicy mayo aparte'.",
          whyItFits: "Te da ácidos grasos Omega-3, proteína limpia y carbos medidos sin exceso de aceites ocultos.",
          macros: scaleMacros(0.95, 0.9, 0.7)
        },
        {
          badge: "🥈 Bajo en Grasa",
          dishName: "Sashimi Mixto (12 cortes) + Orden de Edamames al Vapor",
          waiterHack:
            "Pide 'sashimi de atún y salmón frescos con salsa ponzu o soya baja en sodio y edamames con sal de mar'.",
          whyItFits: "Densidad proteica quirúrgica casi libre de grasas añadidas y muy fácil de digerir.",
          macros: scaleMacros(0.9, 0.4, 0.55)
        },
        {
          badge: "🥉 Clásico Limpio",
          dishName: "Rollo Natural de Pepino o Arroz (Sin Queso Crema) + Yakitori",
          waiterHack:
            "Pide 'rollo sin queso crema ni capeado (ej. envuelto en pepino o alga) + brochetas de pollo sin salsa teriyaki espesa'.",
          whyItFits: "Satisface el antojo de sushi tradicional ahorrando hasta 450 kcal de empanizados y aderezos.",
          macros: scaleMacros(0.8, 0.85, 0.6)
        }
      ]
    };
  }

  if (/(pizza|italia|pasta|lasagna|domino|little caesar)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Restaurante Italiano / Pizzería",
      tacticalRule:
        "Prioriza masas delgadas y salsas base tomate (pomodoro/arrabiata); evita salsas Alfredo, 4 quesos y pan de ajo con mantequilla.",
      drinkHack: "Agua mineral con rodaja de limón o refresco sin calorías.",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "Pechuga o Filete a la Parmesana Ligero / Cacciatore + Ensalada",
          waiterHack:
            "Pide 'la proteína a la plancha (sin empanizar) cubierta con salsa pomodoro y poco parmesano; ensalada con vinagreta aparte'.",
          whyItFits: "Mantiene intacto tu perfil italiano mientras blinda tu proteína objetivo sin sobrecargar grasas saturadas.",
          macros: scaleMacros(1.0, 0.55, 0.75)
        },
        {
          badge: "🥈 Pasta Controlada",
          dishName: "Pasta Pomodoro o Frutti di Mare con Proteína Extra",
          waiterHack:
            "Pide 'pasta al dente en salsa de tomate natural (sin crema), doble ración de camarones o pollo y sin aceite extra al servir'.",
          whyItFits: "Excelente recarga de glucógeno con bajo impacto lipídico comparado con pastas cremosas.",
          macros: scaleMacros(0.85, 1.0, 0.55)
        },
        {
          badge: "🥉 Pizza Estratégica",
          dishName: "2-3 Rebanadas de Pizza Masa Delgada con Pollo/Jamón Serrano + Ensalada",
          waiterHack:
            "Pide 'masa delgada crujiente con mitad de queso mozzarella, jamón o pollo y acompáñala primero con una ensalada verde sin aderezo cremoso'.",
          whyItFits: "Comer primero la fibra de la ensalada frena picos de glucosa y evita comer rebanadas de más.",
          macros: scaleMacros(0.7, 0.95, 0.85)
        }
      ]
    };
  }

  if (/(burger|hamburguesa|mcdonald|carl|wendy|shake|whopper|burger king)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Hamburguesas / Fast Food",
      tacticalRule:
        "El enemigo real son las papas fritas (400-550 kcal de aceite) y el refresco regular. Duplica la carne y recorta salsas cremosas.",
      drinkHack: "Coca-Cola Zero / Agua mineral / Té helado sin azúcar.",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "Hamburguesa Doble Carne a la Parrilla (Sin Mayonesa Ni Tocino)",
          waiterHack:
            "Pide 'doble carne a la parrilla con lechuga, jitomate, cebolla y mostaza/kétchup ligero; sin mayonesa, sin aderezos especiales y sin papas fritas'.",
          whyItFits: "Aporta ~45-55g de proteína directa manteniendo las calorías dentro de tu presupuesto.",
          macros: scaleMacros(1.0, 0.75, 0.85)
        },
        {
          badge: "🥈 Definición Extrema",
          dishName: "Burger en Lettuce Wrap (Envuelta en Lechuga) Doble Proteína",
          waiterHack:
            "Pide 'hamburguesa envuelta en lechuga sin pan (protein style), doble carne o pollo a la parrilla y solo mostaza o salsa picante'.",
          whyItFits: "Recorta ~240 kcal de harinas refinadas dejando casi pura proteína y micronutrientes.",
          macros: scaleMacros(0.95, 0.25, 0.8)
        },
        {
          badge: "🥉 Pollo Grill",
          dishName: "Grilled Chicken Sandwich + Manzana o Ensalada Verde",
          waiterHack:
            "Pide 'pechuga a la parrilla (nunca crispy/empanizada), sin mayonesa ni queso extra, acompañada de ensalada con limón'.",
          whyItFits: "La opción más ligera en grasa dentro de cadenas de comida rápida.",
          macros: scaleMacros(0.85, 0.7, 0.45)
        }
      ]
    };
  }

  if (/(alita|boneless|wings|bar|cerve|buffalo)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Alitas / Sports Bar",
      tacticalRule:
        "Las boneless están empanizadas y fritas (altísimas en grasa+carbos). Elige siempre alitas tradicionales sin empanizar o tiras a la plancha.",
      drinkHack: "Agua mineral con limón y chamoy sin azúcar o cerveza ultra ligera (máx. 1-2 si está contemplada).",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "Pechuga o Tiras a la Parrilla Bañadas en Salsa Buffalo + Apio",
          waiterHack:
            "Pide 'pechuga o tiras a la plancha (NO empanizadas) bañadas en salsa buffalo clásica (picante, sin base BBQ dulce) con bastones de apio y zanahoria; aderezo ranch aparte'.",
          whyItFits: "Te da todo el sabor de bar deportivo con casi cero aceite de freidora y máxima proteína.",
          macros: scaleMacros(1.0, 0.35, 0.45)
        },
        {
          badge: "🥈 Alitas Clásicas",
          dishName: "8-10 Alitas Tradicionales (Al Horno/Parrilla si hay) Lemon Pepper o Buffalo",
          waiterHack:
            "Pide 'alitas naturales sin harina ni empanizar, sazonador seco (lemon pepper) o buffalo aparte, sin blue cheese ni ranch'.",
          whyItFits: "La salsa picante y lemon pepper prácticamente no suman calorías respecto a BBQ o mango habanero.",
          macros: scaleMacros(0.85, 0.25, 0.95)
        },
        {
          badge: "🥉 Opción Ligera",
          dishName: "Hamburguesa / Wrap de Pollo Grill del Bar + Ensalada",
          waiterHack:
            "Pide 'pollo a la plancha con vegetales frescos, guacamole o salsa mexicana aparte y cero papas a la francesa'.",
          whyItFits: "Evita el aceite reciclado de freidora del bar mientras convives sin restricciones.",
          macros: scaleMacros(0.9, 0.65, 0.65)
        }
      ]
    };
  }

  if (/(corte|steak|parrilla|arrachera|ribeye|pica|asador)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Steakhouse / Cortes a la Parrilla",
      tacticalRule:
        "Evita la mantequilla compuesta sobre el corte, el pan de mesa con aceite y las guarniciones gratinadas o en puré con crema.",
      drinkHack: "Agua mineral Perrier/Topo Chico con limón, o 1 copa de tinto seco si entra en calorías.",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "Filete Mignon, New York Magro o Top Sirloin (250-300g) + Espárragos",
          waiterHack:
            "Pide 'corte sin mantequilla ni aceite encima al salir de la parrilla, acompañado de espárragos/verduras asadas y papa al horno natural (sin crema ni queso)'.",
          whyItFits: "Cortes con menor grasa intramuscular frente a un ribeye marmoleado, optimizando proteína por caloría.",
          macros: scaleMacros(1.05, 0.6, 0.75)
        },
        {
          badge: "🥈 Recomp & Sabor",
          dishName: "Salmón o Arrachera a la Parrilla + Ensalada Verde",
          waiterHack:
            "Pide 'asado únicamente con sal en grano y pimienta; ensalada con limón y aceite de oliva servido aparte'.",
          whyItFits: "Excelente perfil de aminoácidos y saciedad sin exceder grasas ocultas.",
          macros: scaleMacros(0.95, 0.35, 0.85)
        },
        {
          badge: "🥉 Entrada Estratégica",
          dishName: "Carpaccio de Res + Brocheta de Camarón / Pollo",
          waiterHack:
            "Pide 'carpaccio con poco parmesano y aderezo ligero aparte, más proteína extra al carbón'.",
          whyItFits: "Mantiene el presupuesto calórico muy bajo ideal si vas en déficit agresivo.",
          macros: scaleMacros(0.85, 0.2, 0.6)
        }
      ]
    };
  }

  if (/(marisco|ceviche|aguachile|camaron|camarón|pescado|atun|atún|pulpo)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Mariscos y Cevichería",
      tacticalRule:
        "Las marisquerías son el paraíso fitness si evitas empanizados, 'al mojo de ajo' nadando en mantequilla y abuso de tostadas fritas.",
      drinkHack: "Agua mineral con limón y sal o clamato natural sin cerveza si buscas déficit.",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "Aguachile de Camarón / Callo o Ceviche de Pescado/Atún Fresco",
          waiterHack:
            "Pide 'ceviche o aguachile sin mayonesa ni aceite extra, aguacate moderado y sustituye tostadas fritas por horneadas o jícama/pepino'.",
          whyItFits: "Prácticamente proteína pura marina con hidratación y densidad calórica bajísima.",
          macros: scaleMacros(0.95, 0.45, 0.4)
        },
        {
          badge: "🥈 Plato Fuerte",
          dishName: "Filete de Pescado o Pulpo a las Brasas / A la Talla Ligero + Arroz",
          waiterHack:
            "Pide 'filete o pulpo a la plancha con limón y especias, cero mantequilla en el asador y media porción de arroz blanco o ensalada'.",
          whyItFits: "Ideal para post-entreno o cena alta en proteína sin pesadez estomacal.",
          macros: scaleMacros(1.0, 0.75, 0.5)
        },
        {
          badge: "🥉 Coctel Inteligente",
          dishName: "Coctel de Camarón / Pulpo Sin Catsup Azucarada Excesiva",
          waiterHack:
            "Pide 'campechana o coctel con jugo natural de tomate/limón (poca catsup), cilantro, cebolla y galletas saladas medidas'.",
          whyItFits: "Alto volumen, gran sabor refrescante y macros muy fáciles de controlar.",
          macros: scaleMacros(0.8, 0.65, 0.35)
        }
      ]
    };
  }

  if (/(cafe|café|brunch|desayuno|chilaquil|omelette|huevos|vips|toks|sanborns)/.test(q)) {
    return {
      venueTitle: "Infiltración Táctica: Cafetería / Brunch / Desayuno",
      tacticalRule:
        "Cuidado con totopos fritos, pan dulce, jugos de fruta (azúcar rápida sin fibra) y exceso de aceite al freír los huevos.",
      drinkHack: "Café americano, espresso o cold brew negro con stevia/endulzante (sin jarabes ni crema batida).",
      recommendations: [
        {
          badge: "🥇 Opción Óptima (Alta Proteína)",
          dishName: "Omelette de 4 Claras + 1-2 Huevos con Pollo/Jamón de Pavo y Verduras",
          waiterHack:
            "Pide 'omelette con 4 claras y 1 yema, cocinado con mínimo aceite o en sartén antiadherente, relleno de champiñones, espinaca y queso panela; frijoles de la olla aparte'.",
          whyItFits: "Dispara la leucina matutina (~35-45g P) manteniéndote saciado 5 horas sin bajón de azúcar.",
          macros: scaleMacros(0.95, 0.5, 0.65)
        },
        {
          badge: "🥈 Antojo Mexicano",
          dishName: "Huevos Divorciados/Rancheros + Pollo Deshebrado + Tortillas Maíz",
          waiterHack:
            "Pide 'huevos estrellados o revueltos con poco aceite sobre comal (no fritos en piscina de aceite), frijoles sin manteca y pollo extra encima'.",
          whyItFits: "Transforma un desayuno tradicional en una comida de recomposición corporal equilibrada.",
          macros: scaleMacros(0.85, 0.85, 0.75)
        },
        {
          badge: "🥉 Dulce Fit",
          dishName: "Bowl de Yogurt Griego / Avena + Frutos Rojos + Huevos Duros Extra",
          waiterHack:
            "Pide 'yogurt griego natural sin miel ni granola azucarada (solo fruta fresca) y agrega 2-3 huevos tibios/duros aparte para completar proteína'.",
          whyItFits: "Combina energía limpia de digestión gradual con aminoácidos completos.",
          macros: scaleMacros(0.8, 0.9, 0.5)
        }
      ]
    };
  }

  return {
    venueTitle: query?.trim()
      ? `Infiltración Táctica: ${query.trim().slice(0, 42)}`
      : "Infiltración Táctica: Menú Analizado",
    tacticalRule:
      "Regla universal Fitmax: 1) Proteína a la plancha/carbón, 2) Todas las salsas y aderezos aparte, 3) Cero calorías líquidas.",
    drinkHack: "Agua mineral con limón natural o bebida sin calorías (0 kcal).",
    recommendations: [
      {
        badge: "🥇 Opción Óptima (Alta Proteína)",
        dishName: "Pechuga, Filete de Res Magro o Pescado a la Plancha + Guarnición Limpia",
        waiterHack:
          "Pide 'la proteína sellada a la plancha sin mantequilla ni aceite extra al salir, con verduras al vapor/parrilla y papa o arroz medido'.",
        whyItFits: `Aporta ~${Math.round(protTarget * 0.95)}g de proteína biodisponible ajustándose exactamente a tus ${calBudget} kcal disponibles.`,
        macros: scaleMacros(0.95, 0.75, 0.65)
      },
      {
        badge: "🥈 Volumen & Saciedad",
        dishName: "Ensalada César/Mixta Sin Crutones ni Tocino + Doble Proteína Grill",
        waiterHack:
          "Pide 'doble porción de pollo o camarón a la parrilla, aderezo servido aparte (usa solo 1 cucharada) y sin tiras fritas ni crutones'.",
        whyItFits: "Ahorra hasta 400 kcal ocultas en aderezos mientras llena tu estómago con fibra y aminoácidos.",
        macros: scaleMacros(1.0, 0.45, 0.7)
      },
      {
        badge: "🥉 Social / Flexible",
        dishName: "Fajitas o Bowl de Proteína al Carbón con Aguacate Medido",
        waiterHack:
          "Pide 'salteado con mínimo aceite, cremas y quesos gratinados aparte y 2-3 tortillas de maíz para armar al gusto'.",
        whyItFits: "Equilibrio ideal para compartir en mesa manteniendo control total de grasas y calorías.",
        macros: scaleMacros(0.85, 0.8, 0.75)
      }
    ]
  };
}

function sanitizeResponse(
  raw: any,
  fallback: RestaurantStrategyResponse
): RestaurantStrategyResponse {
  if (!raw || !Array.isArray(raw.recommendations) || raw.recommendations.length === 0) {
    return fallback;
  }

  const recs: Recommendation[] = raw.recommendations.slice(0, 3).map((item: any, idx: number) => {
    const fbItem = fallback.recommendations[idx] || fallback.recommendations[0];
    const p = Math.max(5, Math.round(Number(item?.macros?.protein) || fbItem.macros.protein));
    const c = Math.max(0, Math.round(Number(item?.macros?.carbs) || fbItem.macros.carbs));
    const f = Math.max(1, Math.round(Number(item?.macros?.fats) || fbItem.macros.fats));
    const cal = Math.round(Number(item?.macros?.calories) || p * 4 + c * 4 + f * 9);

    return {
      badge: String(item?.badge || fbItem.badge),
      dishName: String(item?.dishName || fbItem.dishName),
      waiterHack: String(item?.waiterHack || fbItem.waiterHack),
      whyItFits: String(item?.whyItFits || fbItem.whyItFits),
      macros: {
        protein: p,
        carbs: c,
        fats: f,
        calories: cal
      }
    };
  });

  return {
    venueTitle: String(raw.venueTitle || fallback.venueTitle),
    tacticalRule: String(raw.tacticalRule || fallback.tacticalRule),
    drinkHack: String(raw.drinkHack || fallback.drinkHack),
    recommendations: recs
  };
}

export async function POST(req: Request) {
  try {
    const { query = "", image = "", remainingMacros, goal } = await req.json();

    if (!query.trim() && !image) {
      return NextResponse.json(
        { error: "Escribe un tipo de restaurante o sube una foto del menú." },
        { status: 400 }
      );
    }

    const calBudget = Math.max(350, Math.min(1600, Math.round(remainingMacros?.calories || 650)));
    const protTarget = Math.max(30, Math.min(90, Math.round(remainingMacros?.protein || 45)));
    const carbBudget = Math.max(15, Math.min(160, Math.round(remainingMacros?.carbs ?? 55)));
    const fatBudget = Math.max(10, Math.min(60, Math.round(remainingMacros?.fats ?? 20)));

    const heuristicFallback = buildHeuristicFallback(
      query,
      protTarget,
      carbBudget,
      fatBudget,
      calBudget
    );

    const systemPrompt = `
Eres el Infiltrador Táctico Nutricional de Fitmax (experto en comer en restaurantes sin arruinar macros ni composición corporal).
Contexto del usuario:
- Objetivo: ${goal || "Recomposición Corporal"}
- Presupuesto disponible para esta comida: ~${calBudget} kcal | Meta Proteína: ~${protTarget}g | Carbos max: ~${carbBudget}g | Grasas max: ~${fatBudget}g.

Genera EXACTAMENTE 3 recomendaciones de platillos reales para el restaurante/menú indicado, incluyendo el "waiterHack" exacto (qué decirle al mesero para eliminar calorías ocultas de aceite, cremas o aderezos).
Responde ÚNICAMENTE con JSON válido (sin markdown ni comillas triples):
{
  "venueTitle": "Infiltración Táctica: <Nombre o Tipo de Cocina>",
  "tacticalRule": "Regla de oro corta para este restaurante.",
  "drinkHack": "Bebida recomendada sin calorías vacías.",
  "recommendations": [
    {
      "badge": "🥇 Opción Óptima (Alta Proteína)",
      "dishName": "Nombre realista del platillo",
      "waiterHack": "Instrucción amable y específica para decirle al mesero.",
      "whyItFits": "Explicación breve de cómo cuadra sus macros.",
      "macros": { "protein": ${protTarget}, "carbs": ${Math.round(carbBudget * 0.7)}, "fats": ${Math.round(fatBudget * 0.7)}, "calories": ${calBudget} }
    },
    {
      "badge": "🥈 Alternativa Equilibrada",
      "dishName": "...",
      "waiterHack": "...",
      "whyItFits": "...",
      "macros": { "protein": 38, "carbs": 45, "fats": 16, "calories": 476 }
    },
    {
      "badge": "🥉 Opción Ligera / Social",
      "dishName": "...",
      "waiterHack": "...",
      "whyItFits": "...",
      "macros": { "protein": 32, "carbs": 30, "fats": 14, "calories": 374 }
    }
  ]
}
`;

    let aiResult: any = null;

    // 1. Google Gemini (Vision if image provided, else fast text)
    if (process.env.GEMINI_API_KEY) {
      if (image) {
        const base64Data = image.split(",")[1] || image;
        const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
        const imageParts = [{ inlineData: { data: base64Data, mimeType } }];
        const visionPrompt = `${systemPrompt}\nAnaliza la carta/menú de esta fotografía${query.trim() ? ` (Contexto adicional: ${query})` : ""} y elige los 3 mejores platillos que aparezcan en ella.`;

        for (const modelName of ["gemini-flash-latest", "gemini-flash-lite-latest"]) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const res: any = await Promise.race([
              model.generateContent([visionPrompt, ...imageParts]),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error("VisionTimeout")), 4200))
            ]);
            const text = cleanJsonText(res.response.text());
            aiResult = JSON.parse(text);
            if (aiResult?.recommendations?.length) break;
          } catch (err: any) {
            console.warn(`Restaurant Vision (${modelName}) failed:`, err?.message);
          }
        }
      } else {
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            systemInstruction: systemPrompt
          });
          const res: any = await Promise.race([
            model.generateContent(`Restaurante o platillos consultados: ${query}`),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("GeminiTimeout")), 3200))
          ]);
          const text = cleanJsonText(res.response.text());
          aiResult = JSON.parse(text);
        } catch (err: any) {
          console.warn("Restaurant Gemini text failed:", err?.message);
        }
      }
    }

    // 2. Cloud LLM Fallback via Pollinations (when text query or Gemini exhausted)
    if (!aiResult?.recommendations?.length) {
      try {
        const userMsg = query.trim()
          ? `Restaurante o platillos: ${query}`
          : "Menú de restaurante casual (parrilla, pollo, pescados, tacos y ensaladas)";
        const llmRes = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMsg }
            ],
            model: "openai",
            jsonMode: true,
            seed: 42
          }),
          signal: AbortSignal.timeout(3600)
        });

        if (llmRes.ok) {
          const text = cleanJsonText(await llmRes.text());
          aiResult = JSON.parse(text);
        }
      } catch (err: any) {
        console.warn("Restaurant Pollinations fallback failed:", err?.message);
      }
    }

    const finalPayload = sanitizeResponse(aiResult, heuristicFallback);
    return NextResponse.json(finalPayload);
  } catch (error: any) {
    console.error("Restaurant API Error:", error);
    return NextResponse.json(
      { error: error.message || "Error analizando restaurante." },
      { status: 500 }
    );
  }
}
