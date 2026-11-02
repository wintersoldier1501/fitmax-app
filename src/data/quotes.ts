export interface Quote {
  id: number;
  text: string;
  author: string;
  role: string;
  category: "Estoicismo" | "Disciplina" | "Autocontrol" | "Mentalidad" | "Persistencia";
  insight: string;
}

export const quotesLibrary: Quote[] = [
  {
    id: 1,
    text: "Qué desgracia es para un hombre envejecer sin haber visto la belleza y la fuerza de la que su cuerpo es verdaderamente capaz.",
    author: "Sócrates",
    role: "Filósofo de la Grecia Antigua (470 a.C.)",
    category: "Estoicismo",
    insight: "Tu cuerpo tiene un potencial físico que jamás conocerás si te conformas con la comodidad."
  },
  {
    id: 2,
    text: "La motivación es una emoción barata y pasajera. La disciplina es hacer lo que tienes que hacer, especialmente cuando no tienes ganas.",
    author: "David Goggins",
    role: "Navy SEAL & Ultramaratonista",
    category: "Disciplina",
    insight: "Esperar a sentirte con ganas para entrenar o comer limpio es la receta exacta para la mediocridad."
  },
  {
    id: 3,
    text: "El dolor de la disciplina pesa onzas. El dolor del arrepentimiento pesa toneladas.",
    author: "Jim Rohn",
    role: "Filósofo de Rendimiento y Negocios",
    category: "Autocontrol",
    insight: "El esfuerzo de hoy dura 1 hora; el remordimiento de haber abandonado tus metas dura meses."
  },
  {
    id: 4,
    text: "El cuerpo debe ser tratado con rigor y disciplina, para que no resulte desobediente al espíritu.",
    author: "Séneca",
    role: "Filósofo Estoico Romano",
    category: "Estoicismo",
    insight: "Someter tu cuerpo al esfuerzo forja una mente imperturbable ante los problemas de la vida."
  },
  {
    id: 5,
    text: "No entrenas para el cuerpo que tienes hoy; entrenas para ganarte el respeto del hombre o mujer en quien te estás convirtiendo.",
    author: "Alex Hormozi",
    role: "Empresario & Atleta de Fuerza",
    category: "Mentalidad",
    insight: "El físico es solo la consecuencia visible de una persona que aprendió a no fallarse a sí misma."
  },
  {
    id: 6,
    text: "Al amanecer, cuando te cueste levantarte, ten presente este pensamiento: Me levanto para cumplir con la obra de un ser humano.",
    author: "Marco Aurelio",
    role: "Emperador Romano & Autor de Meditaciones",
    category: "Estoicismo",
    insight: "La cama caliente es placentera, pero no viniste al mundo a esconderte bajo las cobijas."
  },
  {
    id: 7,
    text: "La diferencia entre un aficionado y un profesional está en lo que hacen los días que no tienen ganas de entrenar.",
    author: "Kobe Bryant",
    role: "Leyenda de la NBA & Mamba Mentality",
    category: "Disciplina",
    insight: "Cualquiera entrena motivado. Los resultados extraordinarios se construyen en los días difíciles."
  },
  {
    id: 8,
    text: "El hierro nunca te miente. Puedes mentirle a tus amigos, a tu espejo o a tu entrenador, pero ante 100 kilos en la barra solo existe la verdad.",
    author: "Henry Rollins",
    role: "Músico & Escritor ('The Iron and the Soul')",
    category: "Mentalidad",
    insight: "Las pesas son el juez más honesto del mundo: te dan exactamente lo que te has ganado."
  },
  {
    id: 9,
    text: "No sacrifiques lo que más deseas en la vida por lo que deseas en este instante.",
    author: "Anónimo",
    role: "Principio Universal de Gratificación Retardada",
    category: "Autocontrol",
    insight: "Ese antojo impulsivo dura 5 minutos en tu boca; tus metas físicas duran toda la vida."
  },
  {
    id: 10,
    text: "Ningún hombre es libre si no es dueño absoluto de sí mismo y de sus propios impulsos.",
    author: "Epicteto",
    role: "Filósofo Estoico (Nacido esclavo)",
    category: "Estoicismo",
    insight: "Si no puedes controlar lo que comes ni obligarte a entrenar, no eres libre; eres prisionero de tus caprichos."
  },
  {
    id: 11,
    text: "Cuando el picapedrero golpea la roca noventa y nueve veces sin una sola grieta, no se rinde. Al golpe cien la parte en dos, sabiendo que fueron todos los golpes previos los que lo lograron.",
    author: "Jacob Riis",
    role: "Periodista & Reformador",
    category: "Persistencia",
    insight: "No ver cambios en el espejo esta semana no significa que no esté funcionando. Sigue golpeando la roca."
  },
  {
    id: 12,
    text: "Cada repetición que completas cuando tu mente te pide parar no solo construye masa muscular; destruye tu versión perezosa.",
    author: "Dorian Yates",
    role: "6 Veces Mr. Olympia",
    category: "Disciplina",
    insight: "El verdadero estímulo empieza en las repeticiones donde la mayoría suelta la barra."
  },
  {
    id: 13,
    text: "Tú no decides tu futuro. Decides tus hábitos diarios, y tus hábitos construyen tu futuro de forma inevitable.",
    author: "F.M. Alexander",
    role: "Pionero del Control Somático",
    category: "Mentalidad",
    insight: "No te obsesiones con el resultado final; enamórate de la rutina que lo hace inevitable."
  },
  {
    id: 14,
    text: "El hambre emocional busca dopamina rápida; la verdadera disciplina busca paz y orgullo duradero.",
    author: "Dr. Andrew Huberman",
    role: "Neurocientífico de Stanford",
    category: "Autocontrol",
    insight: "Aprende a pausar 2 minutos antes de ceder a un antojo. El 90% de los impulsos se disuelven si respiras."
  },
  {
    id: 15,
    text: "Si buscas resultados que el 99% no tiene, debes estar dispuesto a hacer lo que el 99% jamás toleraría.",
    author: "Arnold Schwarzenegger",
    role: "7 Veces Mr. Olympia & Icono Global",
    category: "Disciplina",
    insight: "Ser diferente en tu físico requiere rechazar las excusas que la mayoría normaliza a diario."
  },
  {
    id: 16,
    text: "Tienes poder sobre tu propia mente, no sobre los acontecimientos externos. Comprende esto y encontrarás una fuerza invencible.",
    author: "Marco Aurelio",
    role: "Emperador Romano",
    category: "Estoicismo",
    insight: "No puedes controlar el tráfico ni un día estresante, pero sí controlas si cumples tus macros y tu sesión de hoy."
  },
  {
    id: 17,
    text: "Un mal entrenamiento que lograste terminar sigue siendo infinitamente superior al entrenamiento perfecto que dejaste para mañana.",
    author: "Dan John",
    role: "Entrenador Olímpico de Fuerza",
    category: "Persistencia",
    insight: "Un día con poca energía donde aun así te presentas vale el doble para tu carácter que un día fácil."
  },
  {
    id: 18,
    text: "Una vez que el camino hacia tu objetivo está trazado, no mires atrás ni te distraigas con senderos cómodos.",
    author: "Miyamoto Musashi",
    role: "Espadachín Legendario & Autor del Dokkodo",
    category: "Mentalidad",
    insight: "La duda es el enemigo del progreso. Si decidiste transformar tu cuerpo, ejecuta sin negociar."
  },
  {
    id: 19,
    text: "No es porque las cosas sean difíciles que no nos atrevemos; es porque no nos atrevemos que se vuelven difíciles.",
    author: "Séneca",
    role: "Filósofo Estoico",
    category: "Estoicismo",
    insight: "El primer paso para ponerte la ropa de entrenar es el 80% de la batalla mental."
  },
  {
    id: 20,
    text: "La consistencia sin talento siempre vencerá al talento sin consistencia. No necesitas ser un superdotado; necesitas no fallar.",
    author: "James Clear",
    role: "Autor de 'Hábitos Atómicos'",
    category: "Persistencia",
    insight: "Cien entrenamientos cumplidos al 80% transforman más que 10 entrenamientos 'perfectos' seguidos de abandono."
  },
  {
    id: 21,
    text: "El acero no se forja en aguas tibias ni en comodidades. Tu carácter tampoco.",
    author: "Proverbio del Guerrero",
    role: "Sabiduría Tradicional",
    category: "Mentalidad",
    insight: "El ardor muscular y el cansancio no son obstáculos: son las herramientas que te están esculpiendo."
  },
  {
    id: 22,
    text: "Quien vence a otros es fuerte; quien logra vencerse a sí mismo es verdaderamente poderoso.",
    author: "Lao-Tsé",
    role: "Filósofo Oriental & Autor del Tao Te King",
    category: "Estoicismo",
    insight: "Tu mayor rival no está en el gimnasio ni en Instagram: es la voz en tu cabeza que te pide rendirte."
  },
  {
    id: 23,
    text: "No bajes la exigencia de tu meta; eleva el estándar de tu disciplina.",
    author: "Jocko Willink",
    role: "Comandante SEAL & Autor de 'Discipline Equals Freedom'",
    category: "Disciplina",
    insight: "Cuando los resultados tarden, no busques atajos. Revisa tus hábitos con honestidad brutal."
  },
  {
    id: 24,
    text: "Tu cuerpo es el único lugar donde vivirás toda tu vida. Trátalo como a tu más preciada fortaleza, no como un basurero de excesos.",
    author: "Jim Rohn",
    role: "Mentor de Rendimiento",
    category: "Autocontrol",
    insight: "Cada comida que eliges hoy es una inversión en tu salud, tu energía y tu longevidad futura."
  },
  {
    id: 25,
    text: "La victoria más grande y noble que un ser humano puede alcanzar es conquistarse a sí mismo.",
    author: "Platón",
    role: "Filósofo Griego",
    category: "Estoicismo",
    insight: "El dominio sobre tus apetitos y tu pereza vale más que cualquier medalla exterior."
  }
];

export function getDailyQuote(): Quote {
  // Use day of the year so every day has a designated quote, but same for all visits that day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % quotesLibrary.length;
  return quotesLibrary[index] || quotesLibrary[0];
}

export function getRandomQuote(excludeId?: number): Quote {
  const filtered = excludeId ? quotesLibrary.filter(q => q.id !== excludeId) : quotesLibrary;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || quotesLibrary[0];
}
