export interface Quote {
  id: number;
  text: string;
  author: string;
  role: string;
  category: "Warhammer 40K" | "Videojuegos" | "Literatura" | "Filosofía" | "Anime & Manga" | "Cine & Culto" | "Disciplina";
  sourceTag?: string;
  insight: string;
}

export const quotesLibrary: Quote[] = [
  // ==========================================
  // 🎮 VIDEOJUEGOS DE CULTO
  // ==========================================
  {
    id: 1,
    text: "En la vida siempre habrá problemas, hermano. Es la naturaleza misma de las cosas; lo que define quién eres no es la tormenta, sino cómo decides mantenerte en pie en medio de ella.",
    author: "Tai Kaliso",
    role: "Gears of War 2 & 3",
    category: "Videojuegos",
    sourceTag: "Gears of War",
    insight: "Los días malos, el cansancio y los imprevistos van a ocurrir siempre. No busques una vida sin dificultades; forja la fuerza para superarlas."
  },
  {
    id: 2,
    text: "Si nos derriban hoy, nos levantamos. Y si caemos mañana, nos levantamos de nuevo. Mientras respiremos, seguimos empujando.",
    author: "Marcus Fenix",
    role: "Gears of War",
    category: "Videojuegos",
    sourceTag: "Gears of War",
    insight: "El éxito físico no es no tropezar nunca con la dieta o la rutina, sino la velocidad con la que te levantas sin lamentarte."
  },
  {
    id: 3,
    text: "No sientas lástima por el dolor, muchacho. Deja que el sufrimiento te enseñe y te vuelva más fuerte de lo que fuiste ayer.",
    author: "Kratos",
    role: "God of War (2018)",
    category: "Videojuegos",
    sourceTag: "God of War",
    insight: "El ardor de una última serie no es castigo: es el precio biológico necesario para evolucionar."
  },
  {
    id: 4,
    text: "No seas como ellos. Sé mejor.",
    author: "Kratos",
    role: "God of War",
    category: "Videojuegos",
    sourceTag: "God of War",
    insight: "No uses la mediocridad o las excusas de la mayoría como excusa para rebajar tus propios estándares."
  },
  {
    id: 5,
    text: "Aquel que teme caer jamás aprenderá a conquistar la cima. Morir mil veces y levantarse mil y una no es debilidad; es la esencia misma de la victoria.",
    author: "El No-Muerto Elegido",
    role: "Dark Souls",
    category: "Videojuegos",
    sourceTag: "Dark Souls",
    insight: "Fallar una serie o tener un mal entrenamiento no te hace un fracasado. Rendirte y no volver a intentarlo sí."
  },
  {
    id: 6,
    text: "Nadie puede cambiar el pasado, pero cualquiera con coraje puede decidir con qué dignidad va a caminar hacia adelante a partir de hoy.",
    author: "Arthur Morgan",
    role: "Red Dead Redemption 2",
    category: "Videojuegos",
    sourceTag: "Red Dead Redemption 2",
    insight: "Olvida los meses que perdiste sin entrenar o comiendo mal. Tu única responsabilidad real es lo que vas a hacer en las próximas 24 horas."
  },
  {
    id: 7,
    text: "El honor de un guerrero no está en la ausencia de miedo ni en la perfección; está en desenvainar la katana y dar el paso al frente cuando todo tu cuerpo tiembla por la fatiga.",
    author: "Jin Sakai",
    role: "Ghost of Tsushima",
    category: "Videojuegos",
    sourceTag: "Ghost of Tsushima",
    insight: "Tener pereza o miedo a un entrenamiento pesado es natural. Ir al gimnasio a pesar de eso es valentía pura."
  },
  {
    id: 8,
    text: "El mal menor sigue siendo mal. Cuando el camino cómodo te invite a renunciar a tus principios, elige la senda difícil con la cabeza alta, aunque nadie te esté mirando para aplaudirte.",
    author: "Geralt de Rivia",
    role: "The Witcher 3: Wild Hunt",
    category: "Videojuegos",
    sourceTag: "The Witcher",
    insight: "La integridad física es lo que haces a solas: cumplir la serie completa sin trampas cuando nadie te vigila."
  },
  {
    id: 9,
    text: "No se trata de ganar o perder ante el mundo. Se trata de no traicionar la promesa que te hiciste a ti mismo cuando todos te pedían que te conformaras con menos.",
    author: "The Boss",
    role: "Metal Gear Solid 3: Snake Eater",
    category: "Videojuegos",
    sourceTag: "Metal Gear Solid",
    insight: "Tus metas son un pacto sagrado contigo mismo. No las rebajes por la opinión de personas que no viven en tu cuerpo."
  },
  {
    id: 10,
    text: "Sé exactamente lo que estás pensando, soldado. Y no: no nos rendiremos hoy.",
    author: "Master Chief (John-117)",
    role: "Halo Series",
    category: "Videojuegos",
    sourceTag: "Halo",
    insight: "Cuando tu cerebro empiece a negociar abandonar la rutina a la mitad, córtale la conversación y termina la misión."
  },
  {
    id: 11,
    text: "¿Qué es un hombre sin la voluntad inquebrantable de forjarse a sí mismo a través del fuego?",
    author: "Andrew Ryan",
    role: "BioShock",
    category: "Videojuegos",
    sourceTag: "BioShock",
    insight: "Nadie nace con un cuerpo estético ni con disciplina de acero; ambos se forjan a golpes de voluntad constante."
  },
  {
    id: 12,
    text: "Incluso en una noche eterna y desolada, el cazador sigue empuñando su arma. Porque sabe que el amanecer solo pertenece a los que no soltaron la guardia.",
    author: "El Cazador de Yharnam",
    role: "Bloodborne",
    category: "Videojuegos",
    sourceTag: "Bloodborne",
    insight: "Cuando sientas que tu progreso es invisible, mantén la guardia alta. La transformación ocurre en la oscuridad de la rutina diaria."
  },
  {
    id: 13,
    text: "Contra todo el mal que la pereza puede engendrar, contra toda la debilidad que la carne puede producir... les enviaremos solo una cosa: tu determinación indomable.",
    author: "Sello del Slayer",
    role: "DOOM Eternal",
    category: "Videojuegos",
    sourceTag: "DOOM",
    insight: "Entra a la sala de pesas con rabia constructiva. Que tu entrenamiento destruya cualquier rastro de duda mental."
  },
  {
    id: 14,
    text: "No mueras como una sombra insignificante. Si vas a dejar una marca en este mundo, que sea ardiendo con la máxima intensidad de la que eres capaz.",
    author: "Johnny Silverhand",
    role: "Cyberpunk 2077",
    category: "Videojuegos",
    sourceTag: "Cyberpunk 2077",
    insight: "Vive con intensidad y propósito. No dejes que los mejores años de tu juventud transcurran en un cuerpo descuidado."
  },
  {
    id: 15,
    text: "Un cazador no busca la presa fácil. Busca el monstruo que lo obligue a convertirse en un cazador superior.",
    author: "Cazador Furtivo",
    role: "Monster Hunter",
    category: "Videojuegos",
    sourceTag: "Monster Hunter",
    insight: "No le temas a los ejercicios pesados como la sentadilla libre o el peso muerto. Son precisamente los que te transforman."
  },
  {
    id: 16,
    text: "Aun despojado de luz y de gloria, el Sinluz se pone de pie ante los dioses. Porque no hay trono en este mundo que no deba ganarse con sangre y perseverancia.",
    author: "Guía del Sinluz",
    role: "Elden Ring",
    category: "Videojuegos",
    sourceTag: "Elden Ring",
    insight: "No importa tu punto de partida ni cuánto sobrepeso o flacidez tengas hoy. La corona del físico se gana repetición a repetición."
  },

  // ==========================================
  // 📚 LITERATURA PROFUNDA & POÉTICA
  // ==========================================
  {
    id: 17,
    text: "El acero me enseñó la lección más sagrada: la mente jamás podrá trascender si el templo de carne y hueso que la alberga es débil, blando y cobarde.",
    author: "Yukio Mishima",
    role: "'El Sol y el Acero' (1968)",
    category: "Literatura",
    sourceTag: "El Sol y el Acero",
    insight: "Entrenar pesas no es vanidad; es el acto de sincronizar la fortaleza de tu espíritu con la dureza de tu cuerpo."
  },
  {
    id: 18,
    text: "El músculo es el único testimonio tangible y visible que la voluntad humana es capaz de esculpir sobre la carne perecedera.",
    author: "Yukio Mishima",
    role: "Escritor y Culturista Japonés",
    category: "Literatura",
    sourceTag: "El Sol y el Acero",
    insight: "El dinero se puede heredar; un cuerpo fuerte y disciplinado no se compra ni se regala, se construye milímetro a milímetro."
  },
  {
    id: 19,
    text: "Solo le temo a una sola cosa en este mundo: a no ser digno de mis propios sufrimientos.",
    author: "Fiódor Dostoievski",
    role: "'Crimen y Castigo' / 'Los Hermanos Karamazov'",
    category: "Literatura",
    sourceTag: "Dostoievski",
    insight: "Si vas a pagar el precio de sudar, cansarte y privarte de excesos, hazlo valer al 100%. Que cada gota de sudor tenga un propósito."
  },
  {
    id: 20,
    text: "Prefiero ser cenizas ardientes antes que polvo estéril. Prefiero que mi chispa arda en una llamarada brillante antes de extinguirme sofocado por la mediocridad y la cobardía.",
    author: "Jack London",
    role: "Escritor y Aventurero de Leyenda",
    category: "Literatura",
    sourceTag: "Jack London",
    insight: "Exprime la vida y la vitalidad de tu cuerpo. No te conformes con existir a medias en un estado de letargo."
  },
  {
    id: 21,
    text: "En medio del invierno más crudo e implacable, aprendí por fin que habitaba en mí un verano absolutamente invencible.",
    author: "Albert Camus",
    role: "Premio Nobel de Literatura & 'El Retorno a Tipasa'",
    category: "Literatura",
    sourceTag: "Albert Camus",
    insight: "Por más difícil que sea tu semana o tu momento personal, dentro de ti existe una reserva inagotable de fuerza esperando que la despiertes."
  },
  {
    id: 22,
    text: "La lucha misma hacia las cumbres es suficiente para llenar el corazón de un hombre. Hay que imaginarse a Sísifo dichoso.",
    author: "Albert Camus",
    role: "'El Mito de Sísifo'",
    category: "Literatura",
    sourceTag: "Albert Camus",
    insight: "Aprende a amar la rutina diaria de empujar la barra una y otra vez. La felicidad no está al final de la meta, está en el orgullo del esfuerzo diario."
  },
  {
    id: 23,
    text: "No te rindas cuando el mundo te parezca hostil. Nada que merezca ser poseído en esta vida viene sin una guerra contra la propia debilidad.",
    author: "Hermann Hesse",
    role: "'Demian' & 'Siddhartha'",
    category: "Literatura",
    sourceTag: "Hermann Hesse",
    insight: "Construir tu mejor versión requiere destruir a la persona cómoda que solías ser. El proceso duele, pero la recompensa es libertad."
  },
  {
    id: 24,
    text: "Comienza siempre por hacer lo que es correcto y digno, no por lo que es fácil o conveniente para el momento.",
    author: "Franz Kafka",
    role: "Escritor Checo",
    category: "Literatura",
    sourceTag: "Kafka",
    insight: "Comer lo que nutre tu meta en lugar de lo que te tienta en el refrigerador es el primer acto diario de dignidad."
  },
  {
    id: 25,
    text: "Cuando ya no somos capaces de cambiar una situación exterior adversa, nos encontramos ante el supremo desafío de cambiarnos a nosotros mismos.",
    author: "Viktor Frankl",
    role: "'El Hombre en Busca de Sentido'",
    category: "Literatura",
    sourceTag: "Viktor Frankl",
    insight: "No puedes cambiar las circunstancias del mundo, pero sí tienes control total sobre cómo respondes, cómo entrenas y cómo te alimentas."
  },
  {
    id: 26,
    text: "No entres dócilmente en esa buena noche de la pereza. Enfurece, enfurece con rabia contra la muerte de tu fuego interior.",
    author: "Dylan Thomas",
    role: "Poeta de 'Interstellar'",
    category: "Literatura",
    sourceTag: "Dylan Thomas",
    insight: "Rechaza el conformismo de envejecer débil. Lucha cada día por preservar tu fuerza física y mental."
  },
  {
    id: 27,
    text: "El hombre que mueve una montaña comienza apartando las piedras más pequeñas del camino.",
    author: "Confucio",
    role: "Sabio de la Filosofía Oriental",
    category: "Literatura",
    sourceTag: "Confucio",
    insight: "No intentes cambiar todo en un día. Cumple tus macros de hoy y tu sesión de hoy; las montañas caerán solas con el tiempo."
  },
  {
    id: 28,
    text: "No somos criaturas de las circunstancias; somos creadores de nuestras propias circunstancias a través de nuestros hábitos cotidianos.",
    author: "Benjamin Disraeli",
    role: "Estadista y Escritor",
    category: "Literatura",
    sourceTag: "Disraeli",
    insight: "Deja de culpar a la falta de tiempo. Haces tiempo para lo que verdaderamente es una prioridad no negociable para ti."
  },

  // ==========================================
  // ⚔️ ANIME, MANGA & ÉPICA GUERRERA
  // ==========================================
  {
    id: 29,
    text: "Si alguna vez vas a rezar por algo en este mundo despiadado, reza por la fuerza necesaria para seguir empuñando tu espada cuando nadie más crea en ti.",
    author: "Guts",
    role: "Berserk (Kentaro Miura)",
    category: "Anime & Manga",
    sourceTag: "Berserk",
    insight: "El dolor y las noches oscuras no te definen: te define que nunca soltaste la espada. Sigue empujando la barra."
  },
  {
    id: 30,
    text: "El dolor te recuerda una sola cosa: que todavía estás vivo y que aún tienes batallas por ganar. No huyas de él, úsalo como combustible.",
    author: "Guts",
    role: "Berserk",
    category: "Anime & Manga",
    sourceTag: "Berserk",
    insight: "Convierte el estrés del día y las frustraciones en potencia pura cuando estés frente a las mancuernas."
  },
  {
    id: 31,
    text: "No busques ser más fuerte que nadie en este gimnasio. Busca ser infinitamente más fuerte e implacable que el hombre que fuiste ayer por la mañana.",
    author: "Miyamoto Musashi",
    role: "Vagabond (Takehiko Inoue)",
    category: "Anime & Manga",
    sourceTag: "Vagabond",
    insight: "La comparación con otros es veneno para tu progreso. La única competencia real te mira fijamente desde el espejo."
  },
  {
    id: 32,
    text: "Preocuparte por la hoja de hierba te ciega ante la inmensidad del bosque. Enfoca tu mente en el objetivo final y las pequeñas incomodidades desaparecerán.",
    author: "Monje Takuan",
    role: "Vagabond",
    category: "Anime & Manga",
    sourceTag: "Vagabond",
    insight: "No sufras por el sudor de 45 minutos ni por el pollo asado; mantén la mirada en el cuerpo estético que estás forjando."
  },
  {
    id: 33,
    text: "No tienes enemigos, muchacho. Nadie en este mundo es tu enemigo; tu único adversario es el impulso cobarde de rendirte cuando las cosas se ponen difíciles.",
    author: "Thors Snorresson",
    role: "Vinland Saga (Makoto Yukimura)",
    category: "Anime & Manga",
    sourceTag: "Vinland Saga",
    insight: "Tu lucha no es contra nadie más. Es contra la voz interna que te suplica que te quedes acostado en la cama."
  },
  {
    id: 34,
    text: "No me importa cuántas veces mi cuerpo toque el suelo ni cuántos obstáculos se interpongan. Mi orgullo y mi entrenamiento me levantarán siempre.",
    author: "Vegeta",
    role: "Dragon Ball Z (Akira Toriyama)",
    category: "Anime & Manga",
    sourceTag: "Dragon Ball Z",
    insight: "La verdadera dignidad no radica en no fallar jamás, sino en la furia implacable con la que vuelves al entrenamiento al día siguiente."
  },
  {
    id: 35,
    text: "El trabajo duro no traiciona a nadie; si sientes que te ha traicionado, es porque no trabajaste con la suficiente honestidad.",
    author: "Rock Lee",
    role: "Naruto (Masashi Kishimoto)",
    category: "Anime & Manga",
    sourceTag: "Naruto",
    insight: "El progreso físico no miente. Cuando los resultados tarden, evalúa si de verdad estás dando tu 100% en intensidad y nutrición."
  },
  {
    id: 36,
    text: "Un león no se preocupa por la opinión de las ovejas mientras persigue su presa a través de la llanura.",
    author: "Eren Jaeger",
    role: "Shingeki no Kyojin",
    category: "Anime & Manga",
    sourceTag: "Attack on Titan",
    insight: "No permitas que quienes no tienen disciplina critiquen tu estilo de vida, tus tuppers o tus horas de gimnasio."
  },
  {
    id: 37,
    text: "Levanta la cabeza y mírame a los ojos. Si vas a caer hoy, cae peleando como un guerrero, no suplicando clemencia como un cobarde.",
    author: "Roronoa Zoro",
    role: "One Piece (Eiichiro Oda)",
    category: "Anime & Manga",
    sourceTag: "One Piece",
    insight: "Si vas a hacer una serie, hazla con todo tu enfoque. No dejes series a medias por pura flojera mental."
  },
  {
    id: 38,
    text: "Nada ocurrió aquí. El dolor que soporto en silencio es el tributo que pago gustosamente por proteger mis sueños.",
    author: "Roronoa Zoro",
    role: "One Piece ('Nothing Happened')",
    category: "Anime & Manga",
    sourceTag: "One Piece",
    insight: "No te quejes del cansancio con todo el mundo. Carga tu esfuerzo en silencio y deja que tus resultados hablen por ti."
  },

  // ==========================================
  // 🧠 FILOSOFÍA OSCURA & ESTOICISMO REAL
  // ==========================================
  {
    id: 39,
    text: "Qué desgracia infinita es para un ser humano envejecer y morir sin haber contemplado jamás la belleza, la fuerza y la gloria de la que su cuerpo era biológicamente capaz.",
    author: "Sócrates",
    role: "Filósofo de Atenas (470 a.C.)",
    category: "Filosofía",
    sourceTag: "Sócrates",
    insight: "Solo tienes una vida y un solo cuerpo. Es tu deber moral explorar sus límites físicos antes de que el tiempo te los arrebate."
  },
  {
    id: 40,
    text: "Quien tiene un 'porqué' lo suficientemente poderoso para vivir, puede soportar casi cualquier 'cómo' que la vida le imponga.",
    author: "Friedrich Nietzsche",
    role: "'El Crepúsculo de los Ídolos'",
    category: "Filosofía",
    sourceTag: "Nietzsche",
    insight: "Si tienes claro el respeto propio y la salud que persigues, la fatiga del gimnasio y el rigor de la dieta no serán obstáculo."
  },
  {
    id: 41,
    text: "Lo que no me destruye me hace indudablemente más fuerte, más duro y más difícil de doblegar.",
    author: "Friedrich Nietzsche",
    role: "Filósofo Alemán",
    category: "Filosofía",
    sourceTag: "Nietzsche",
    insight: "Cada dificultad superada en el entrenamiento inmuniza tu mente contra el estrés cotidiano."
  },
  {
    id: 42,
    text: "Ningún árbol cuyos frutos pretendan tocar el cielo puede lograrlo sin que sus raíces más profundas desciendan hasta la oscuridad misma de los abismos.",
    author: "Carl Gustav Jung",
    role: "Psicólogo Suizo & 'Aion'",
    category: "Filosofía",
    sourceTag: "Carl Jung",
    insight: "Para construir un cuerpo imponente y seguro de sí mismo, debes aprender a abrazar la incomodidad y el sudor de las sombras."
  },
  {
    id: 43,
    text: "No eres lo que te pasó en la vida; eres la suma exacta de las decisiones que tomas a partir de este instante con lo que te pasó.",
    author: "Carl Gustav Jung",
    role: "Pionero del Psicoanálisis",
    category: "Filosofía",
    sourceTag: "Carl Jung",
    insight: "Deja de justificarte en la mala genética o el pasado. Tu futuro físico se escribe con la disciplina de hoy."
  },
  {
    id: 44,
    text: "Ningún hombre es libre si no es dueño absoluto y soberano de sus propios impulsos y apetitos carnales.",
    author: "Epicteto",
    role: "Filósofo Estoico (Nacido en esclavitud)",
    category: "Filosofía",
    sourceTag: "Epicteto",
    insight: "Si no eres capaz de decir que no a la comida chatarra ni de obligarte a entrenar, no eres libre; eres prisionero de tus caprichos."
  },
  {
    id: 45,
    text: "No sufrimos por las cosas que nos ocurren, sino por el relato cobarde y exagerado que nos hacemos a nosotros mismos sobre lo que nos ocurre.",
    author: "Epicteto",
    role: "'Manual de Vida' (Enquiridión)",
    category: "Filosofía",
    sourceTag: "Epicteto",
    insight: "Hacer ejercicio no es una tortura: es un privilegio que millones de personas enfermas desearían tener hoy."
  },
  {
    id: 46,
    text: "El cuerpo debe ser tratado con rigor marcial, para que bajo ninguna circunstancia resulte desobediente a las órdenes del espíritu.",
    author: "Lucio Anneo Séneca",
    role: "'Cartas a Lucilio'",
    category: "Filosofía",
    sourceTag: "Séneca",
    insight: "Domina a tu cuerpo con el hierro para que jamás sea el cuerpo quien dicte tus debilidades a la mente."
  },
  {
    id: 47,
    text: "No es porque las cosas sean difíciles que no nos atrevemos; es exactamente porque no nos atrevemos que se vuelven difíciles e inalcanzables.",
    author: "Séneca",
    role: "Filósofo Estoico Romano",
    category: "Filosofía",
    sourceTag: "Séneca",
    insight: "La pereza antes de entrenar parece gigante solo en tu cabeza; en cuanto pisas el gimnasio, desaparece."
  },
  {
    id: 48,
    text: "Al amanecer, cuando sientas pereza de levantarte, di para ti mismo: Me despierto para cumplir la labor de un hombre libre, no para vegetar entre sábanas tibias.",
    author: "Marco Aurelio",
    role: "'Meditaciones' (Libro V)",
    category: "Filosofía",
    sourceTag: "Marco Aurelio",
    insight: "La cama caliente es el mayor cementerio de metas y ambiciones humanas. Ponte de pie y conquista tu jornada."
  },
  {
    id: 49,
    text: "Tienes poder absoluto sobre tu propia mente, no sobre los acontecimientos exteriores. Comprende esta verdad y hallarás una fortaleza inexpugnable.",
    author: "Marco Aurelio",
    role: "Emperador de Roma",
    category: "Filosofía",
    sourceTag: "Marco Aurelio",
    insight: "No controlas si llueve o si tuviste un día pesado, pero sí controlas con total soberanía si cumples con tu entrenamiento."
  },
  {
    id: 50,
    text: "La mayor y más noble de todas las victorias es conquistarse a uno mismo; ser derrotado por las propias pasiones es la más denigrante de las derrotas.",
    author: "Platón",
    role: "'Las Leyes'",
    category: "Filosofía",
    sourceTag: "Platón",
    insight: "Vencer tu propia pereza al final del día vale más que cualquier medalla o elogio ajeno."
  },
  {
    id: 51,
    text: "Quien vence a los demás es simplemente fuerte; quien es capaz de vencerse a sí mismo es verdaderamente todopoderoso.",
    author: "Lao-Tsé",
    role: "'Tao Te King'",
    category: "Filosofía",
    sourceTag: "Lao-Tsé",
    insight: "Tu único rival digno es esa voz cobarde que te dice que lo dejes para mañana. Véncela hoy."
  },
  {
    id: 52,
    text: "En la guerra contra la debilidad, no existen los atajos. El guerrero sabio conquista primero su propia pereza antes de salir a conquistar el mundo.",
    author: "Sun Tzu",
    role: "'El Arte de la Guerra'",
    category: "Filosofía",
    sourceTag: "Sun Tzu",
    insight: "Si no tienes disciplina en lo más básico (lo que comes y cómo te mueves), no esperes tener éxito en nada más grande."
  },
  {
    id: 53,
    text: "Una vez que has elegido un camino, no mires atrás con arrepentimiento ni te dejes seducir por sendas fáciles que no conducen a ninguna parte.",
    author: "Miyamoto Musashi",
    role: "'El Camino de la Soledad' (Dokkodo)",
    category: "Filosofía",
    sourceTag: "Musashi",
    insight: "Ya decidiste transformar tu físico. No negocies la meta en los días difíciles."
  },
  {
    id: 54,
    text: "No te apegues a la comodidad temporal. La comodidad prolongada es el veneno que anestesia el alma de los hombres que nacieron para cosas grandes.",
    author: "Miyamoto Musashi",
    role: "'El Libro de los Cinco Anillos'",
    category: "Filosofía",
    sourceTag: "Musashi",
    insight: "Acostúmbrate a tolerar la fricción y el esfuerzo deliberado. Ahí es donde se forja la grandeza."
  },

  // ==========================================
  // 🎬 CINE, TELEVISIÓN & CULTO ÉPICO
  // ==========================================
  {
    id: 55,
    text: "El mundo no es todo alegría y color. Es un lugar cruel y duro, y no le importa qué tan fuerte seas: te golpeará hasta ponerte de rodillas y te dejará ahí si se lo permites. Pero no se trata de qué tan duro golpees; se trata de qué tan duro puedan golpearte y seguir avanzando. ¡Cuánto puedes resistir y seguir adelante! ¡Así es como se gana!",
    author: "Rocky Balboa",
    role: "Rocky Balboa (2006)",
    category: "Cine & Culto",
    sourceTag: "Rocky",
    insight: "Habrá semanas de estancamiento o problemas personales. La diferencia entre quien triunfa y quien fracasa es quién sigue levantándose a entrenar."
  },
  {
    id: 56,
    text: "Lo que hacemos en esta vida tiene un eco imborrable en la eternidad.",
    author: "Máximo Décimo Meridio",
    role: "Gladiator (Ridley Scott)",
    category: "Cine & Culto",
    sourceTag: "Gladiator",
    insight: "Cada decisión que tomas con tu cuerpo hoy reverbera en la calidad y fortaleza de tus próximos 30 años."
  },
  {
    id: 57,
    text: "No tendré miedo. El miedo mata la mente. El miedo es la pequeña muerte que conduce a la destrucción total. Permitiré que pase sobre mí y a través de mí, y cuando se haya ido, solo quedaré yo: inquebrantable.",
    author: "Letanía contra el Miedo",
    role: "Dune (Frank Herbert)",
    category: "Cine & Culto",
    sourceTag: "Dune",
    insight: "No temas al peso sobre tus hombros. Respira hondo, neutraliza la duda mental y ejecuta el levantamiento con autoridad."
  },
  {
    id: 58,
    text: "No hay descanso en este mundo terrenal para quienes nacieron con el fuego de la ambición. Quizás descansemos en el próximo.",
    author: "Thomas Shelby",
    role: "Peaky Blinders",
    category: "Cine & Culto",
    sourceTag: "Peaky Blinders",
    insight: "No busques excusas para aplazar tu trabajo físico. El descanso bien merecido llega después de haber cumplido la tarea."
  },
  {
    id: 59,
    text: "Solo después de haberlo perdido todo somos verdaderamente libres para hacer lo que queramos. Deja de proteger tus comodidades y conquista tu fuerza.",
    author: "Tyler Durden",
    role: "Fight Club (Chuck Palahniuk)",
    category: "Cine & Culto",
    sourceTag: "Fight Club",
    insight: "Deshazte del miedo al esfuerzo físico. Tu verdadera libertad empieza cuando dejas de ser esclavo de la comodidad."
  },
  {
    id: 60,
    text: "Hay dos tipos de dolor en este mundo: el dolor que te hace fuerte, o el dolor inútil, el dolor que solo engendra sufrimiento sin recompensa. Yo no tengo paciencia para las cosas inútiles.",
    author: "Frank Underwood",
    role: "House of Cards",
    category: "Cine & Culto",
    sourceTag: "Cine & Series",
    insight: "El dolor del esfuerzo en el gimnasio tiene un propósito noble: construirte. El dolor de quedarte estancado es inútil y amargo."
  },
  {
    id: 61,
    text: "Un hombre que no dedica tiempo a cuidar su propio cuerpo y su propia casa jamás podrá ser respetado como un hombre de verdad.",
    author: "Vito Corleone",
    role: "El Padrino (Mario Puzo)",
    category: "Cine & Culto",
    sourceTag: "El Padrino",
    insight: "Cuidar tu salud y tu capacidad física es el primer deber ineludible de cualquier persona que se respete a sí misma."
  },
  {
    id: 62,
    text: "¡Espartanos! ¡Preparen su desayuno y coman con furia, porque esta noche cenaremos en el infierno con la satisfacción del deber cumplido!",
    author: "Rey Leónidas",
    role: "300 (Zack Snyder)",
    category: "Cine & Culto",
    sourceTag: "300",
    insight: "Afronta cada sesión de entrenamiento como una batalla decisiva. Entra al gimnasio sin reservar nada para la retirada."
  },
  {
    id: 63,
    text: "No existen las casualidades ni los milagros gratuitos. Solo existe la implacable ley del esfuerzo y la consecuencia biológica.",
    author: "Capitán Miller",
    role: "Salvando al Soldado Ryan",
    category: "Cine & Culto",
    sourceTag: "Cine Bélico",
    insight: "Tu físico actual es la consecuencia matemática exacta de lo que has comido y entrenado los últimos 6 meses. Si quieres otra consecuencia, cambia la ecuación."
  },

  // ==========================================
  // ⚡ DUREZA MENTAL, DISCIPLINA & RENDIMIENTO
  // ==========================================
  {
    id: 64,
    text: "La motivación es una emoción barata, volátil y pasajera. La disciplina es levantarte y hacer exactamente lo que juraste hacer, especialmente los días en que no tienes ganas.",
    author: "David Goggins",
    role: "Navy SEAL & Ultramaratonista ('Can't Hurt Me')",
    category: "Disciplina",
    sourceTag: "David Goggins",
    insight: "Esperar a sentirte motivado para entrenar es la fórmula matemática de los aficionados. Los profesionales se presentan sin importar cómo se sienten."
  },
  {
    id: 65,
    text: "No te detengas cuando estés cansado. Detente únicamente cuando la tarea esté completamente terminada.",
    author: "David Goggins",
    role: "Atleta de Resistencia Extrema",
    category: "Disciplina",
    sourceTag: "David Goggins",
    insight: "Cuando tu mente te diga que ya diste suficiente, apenas estás al 40% de tu capacidad real. Saca esa última serie."
  },
  {
    id: 66,
    text: "El dolor de la disciplina pesa unos cuantos gramos; el dolor del arrepentimiento pesa toneladas y te persigue durante años.",
    author: "Jim Rohn",
    role: "Mentor de Rendimiento y Filosofía",
    category: "Disciplina",
    sourceTag: "Jim Rohn",
    insight: "El esfuerzo de un entrenamiento dura 60 minutos; el remordimiento de haber abandonado tus metas puede durar toda tu vida."
  },
  {
    id: 67,
    text: "Tu cuerpo es el único lugar sobre la faz de la tierra donde tendrás que vivir cada segundo de tu vida. Trátalo como a tu más sagrada fortaleza, no como un vertedero de antojos baratos.",
    author: "Jim Rohn",
    role: "Filósofo de Vida",
    category: "Disciplina",
    sourceTag: "Jim Rohn",
    insight: "Cada bocado de comida y cada gota de agua es una señal que le envías a tus células sobre el valor que te das a ti mismo."
  },
  {
    id: 68,
    text: "No estás entrenando para el cuerpo que tienes hoy frente al espejo; estás entrenando para ganarte el respeto absoluto del hombre o la mujer en quien te vas a convertir.",
    author: "Alex Hormozi",
    role: "Atleta de Fuerza & Empresario",
    category: "Disciplina",
    sourceTag: "Alex Hormozi",
    insight: "Un físico imponente es el trofeo visible de miles de promesas privadas que no rompiste contigo mismo."
  },
  {
    id: 69,
    text: "La confianza en uno mismo no se construye con afirmaciones vacías frente al espejo; se construye con un historial innegable de promesas cumplidas a solas.",
    author: "Alex Hormozi",
    role: "Autor de '$100M Offers'",
    category: "Disciplina",
    sourceTag: "Alex Hormozi",
    insight: "Cada vez que dijiste que ibas a ir a entrenar y fuiste, depositaste respeto en tu cuenta de autoimagen."
  },
  {
    id: 70,
    text: "El hierro nunca te miente. Puedes engañar a tus amigos, a tu báscula o a tu entrenador, pero ante 100 kilos en la barra solo existe la más pura e implacable verdad.",
    author: "Henry Rollins",
    role: "'El Hierro y el Alma' (The Iron and the Soul)",
    category: "Disciplina",
    sourceTag: "Henry Rollins",
    insight: "Las pesas son el juez más incorruptible del planeta: te devuelven con milimétrica precisión exactamente lo que te has ganado."
  },
  {
    id: 71,
    text: "La diferencia entre un aficionado y un verdadero maestro está en lo que hacen los días que no tienen el más mínimo deseo de levantarse.",
    author: "Kobe Bryant",
    role: "5 Veces Campeón NBA & Mamba Mentality",
    category: "Disciplina",
    sourceTag: "Mamba Mentality",
    insight: "En los días fáciles cualquiera entrena. La grandeza se forja en los martes grises y lluviosos donde nadie quiere estar ahí."
  },
  {
    id: 72,
    text: "Si estás buscando resultados que el 99% de la población jamás conseguirá, debes estar dispuesto a tolerar sacrificios y esfuerzos que el 99% jamás soportaría.",
    author: "Arnold Schwarzenegger",
    role: "7 Veces Mr. Olympia",
    category: "Disciplina",
    sourceTag: "Arnold Schwarzenegger",
    insight: "No busques la validación de quienes prefieren la pereza. Tu camino exige una dedicación fuera de lo común."
  },
  {
    id: 73,
    text: "Las últimas tres o cuatro repeticiones son las que hacen que el músculo crezca. Esa zona de dolor es lo que separa a un campeón de alguien que no lo es.",
    author: "Arnold Schwarzenegger",
    role: "Leyenda del Culturismo",
    category: "Disciplina",
    sourceTag: "Arnold Schwarzenegger",
    insight: "No cuentes las repeticiones fáciles. El verdadero estímulo biológico comienza cuando el músculo te suplica que sueltes la carga."
  },
  {
    id: 74,
    text: "Cada repetición que completas cuando tu mente te pide parar no solo construye masa muscular hipertrófica; aniquila a tu versión perezosa y mediocre.",
    author: "Dorian Yates",
    role: "6 Veces Mr. Olympia ('The Shadow')",
    category: "Disciplina",
    sourceTag: "Dorian Yates",
    insight: "El entrenamiento pesado es una cirugía psicológica para extirpar la debilidad de tu carácter."
  },
  {
    id: 75,
    text: "No sacrifiques lo que más deseas en esta vida por aquello que deseas en este instante fugaz.",
    author: "Ley de la Gratificación Retardada",
    role: "Principio de Rendimiento",
    category: "Disciplina",
    sourceTag: "Autocontrol",
    insight: "Ese postre o esa comida chatarra duran 4 minutos en tu boca; tus metas físicas y tu autoestima duran toda tu vida."
  },
  {
    id: 76,
    text: "Cuando el picapedrero golpea la roca noventa y nueve veces sin ver una sola grieta, no desiste. Al golpe número cien la roca se parte en dos, sabiendo que fueron todos los golpes anteriores los que hicieron el trabajo.",
    author: "Jacob Riis",
    role: "Periodista y Filósofo de la Constancia",
    category: "Disciplina",
    sourceTag: "Persistencia",
    insight: "No te desanimes si no ves cambios en el espejo esta semana. Cada entrenamiento es un golpe a la roca que terminará partiéndose."
  },
  {
    id: 77,
    text: "La consistencia mediocre siempre vencerá por goleada a la intensidad esporádica. No necesitas ser perfecto; necesitas ser un maníaco que no falla dos veces seguidas.",
    author: "James Clear",
    role: "Autor de 'Hábitos Atómicos'",
    category: "Disciplina",
    sourceTag: "James Clear",
    insight: "Un mal día no destruye tu progreso; lo que destruye tu progreso es permitir que un mal día se convierta en una mala semana."
  },
  {
    id: 78,
    text: "Tú no decides tu futuro. Decides tus hábitos diarios, y son tus hábitos diarios los que construyen tu futuro de manera implacable e inevitable.",
    author: "F.M. Alexander",
    role: "Pionero del Control Fisiológico",
    category: "Disciplina",
    sourceTag: "Hábitos",
    insight: "Olvida la obsesión por el resultado final. Enamórate de la disciplina diaria de cumplir tus macros y tu rutina."
  },
  {
    id: 79,
    text: "Un mal entrenamiento que lograste terminar sigue siendo infinitamente superior al mejor de los entrenamientos que decidiste aplazar para mañana.",
    author: "Dan John",
    role: "Entrenador Olímpico de Fuerza",
    category: "Disciplina",
    sourceTag: "Fuerza Olímpica",
    insight: "Incluso si tuviste poca fuerza y levantaste menos peso, el simple hecho de presentarte fortalece tu identidad de guerrero."
  },
  {
    id: 80,
    text: "El hambre emocional busca dopamina barata e inmediata; la verdadera disciplina busca paz interna y orgullo duradero.",
    author: "Dr. Andrew Huberman",
    role: "Neurocientífico de Stanford",
    category: "Disciplina",
    sourceTag: "Neurociencia",
    insight: "Cuando sientas un antojo impulsivo, respira y espera 10 minutos. Es solo una ola química en tu cerebro buscando placer fácil."
  },
  {
    id: 81,
    text: "El acero más filoso y resistente no se forja en aguas tibias ni en comodidades hogareñas. Tu carácter y tu cuerpo tampoco.",
    author: "Proverbio del Guerrero",
    role: "Sabiduría Tradicional de Forja",
    category: "Disciplina",
    sourceTag: "Proverbio Guerrillero",
    insight: "Agradece la dificultad del camino. Cuanto más duro sea el proceso, más respetable será el resultado final."
  },
  {
    id: 82,
    text: "No bajes la altura de la meta cuando el camino se ponga escarpado; eleva el estándar despiadado de tu propia disciplina.",
    author: "Jocko Willink",
    role: "Comandante SEAL ('Discipline Equals Freedom')",
    category: "Disciplina",
    sourceTag: "Jocko Willink",
    insight: "Cuando no estés progresando, no busques excusas biológicas. Revisa tus números, tu descanso y tu honestidad al entrenar."
  },

  // ==========================================
  // ⚜️ WARHAMMER 40,000 (DUREZA & VOLUNTAD IMPERIAL)
  // ==========================================
  {
    id: 83,
    text: "La carne es débil; pero la voluntad de someterla, forjarla y disciplinarla a través del dolor del hierro es lo que nos vuelve invencibles.",
    author: "Ferrus Manus",
    role: "Primarca de los Manos de Hierro (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Tu cuerpo siempre preferirá el sillón y la pereza. Tu mente tiene el deber de someter la carne al rigor de la barra."
  },
  {
    id: 84,
    text: "No cedo terreno. No retrocedo. Ni un solo paso atrás ante la fatiga, ni un solo milímetro concedido a la duda.",
    author: "Rogal Dorn",
    role: "Primarca de los Puños Imperiales (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Cuando una serie pesada queme tus fibras, no negocies ni des un paso atrás. Aguanta y empuja."
  },
  {
    id: 85,
    text: "El dolor es el más fiel de los maestros. Te muestra exactamente en qué punto eres frágil y te exige que te reconstruyas con acero.",
    author: "Rogal Dorn",
    role: "Defensor de Terra (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "No temas al cansancio muscular ni a los errores pasados; son las grietas por donde entra la disciplina."
  },
  {
    id: 86,
    text: "El dolor es una ilusión de los sentidos; la desesperación es una ilusión de la mente. Mantente firme ante ambos y nada podrá doblegarte.",
    author: "Letanía de la Voluntad Inquebrantable",
    role: "Códice Astartes (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "El ardor de tus músculos en la última repetición es solo ruido biológico. Mantén la calma y ejecuta."
  },
  {
    id: 87,
    text: "No reces a los cielos pidiendo una carga más ligera ni un camino fácil; reza pidiendo hombros más anchos y fuertes para soportarla.",
    author: "Oración de la Batalla",
    role: "Adepta Sororitas (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Deja de desear que la dieta o el entrenamiento sean más fáciles. Conviértete tú en una persona más dura y disciplinada."
  },
  {
    id: 88,
    text: "El deber solo termina cuando se apaga el último aliento. La fatiga es una sugerencia cobarde que la mente disciplinada tiene la obligación de ignorar.",
    author: "Roboute Guilliman",
    role: "Lord Comandante del Imperio (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Estar cansado después del trabajo no es una razón válida para fallar a tu cuerpo. La fatiga desaparece con la primera serie."
  },
  {
    id: 89,
    text: "Sin piedad. Sin remordimiento. Sin miedo. Cuando entres a la arena, entra a aniquilar sin contemplaciones a tu propia debilidad.",
    author: "Sigismund",
    role: "Primer Campeón del Emperador (Black Templars)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Entra al gimnasio con una determinación marcial: no estás ahí para pasear el celular, estás ahí para destruir tu versión perezosa."
  },
  {
    id: 90,
    text: "La victoria se paga con el sudor de la preparación silenciosa. Aquel que no esté dispuesto a sufrir en el entrenamiento jamás será digno de la victoria.",
    author: "Gabriel Angelos",
    role: "Capítulo Blood Ravens (Dawn of War)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "El físico estético que deseas no se desea, se paga por adelantado con semanas de disciplina invisible."
  },
  {
    id: 91,
    text: "Solo en la muerte termina el deber. Mientras el pulso siga latiendo en tus venas, hay una serie más por terminar y una batalla más por ganar.",
    author: "Máxima de los Adeptus Astartes",
    role: "Ángeles de la Muerte (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "No te retires antes de tiempo. Si te quedan 2 repeticiones en la rutina, cúmplelas con honor."
  },
  {
    id: 92,
    text: "No es la ausencia de miedo lo que nos hace nobles, sino mirar fijamente al abismo más aterrador y dar el paso al frente con el arma en alto.",
    author: "Sanguinius",
    role: "El Gran Ángel de Baal (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Tener dudas o flojera antes de entrenar es humano. Presentarte a levantar a pesar de eso es lo que te forja."
  },
  {
    id: 93,
    text: "La lealtad a tus principios es su propia recompensa. No entrenes buscando el aplauso barato de los demás; forja el orgullo íntimo de saber quién eres.",
    author: "Lion El'Jonson",
    role: "Primarca de los Ángeles Oscuros (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "No entrenes por likes o validación ajena. Entrena por el respeto sagrado de cumplir tu palabra contigo mismo."
  },
  {
    id: 94,
    text: "Ellos creen que nos rendiremos porque nos ven sangrar y jadear. No comprenden que el dolor solo nos vuelve infinitamente más peligrosos.",
    author: "Comisario Yarrick",
    role: "Héroe de Armageddon (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Cuando una semana sea difícil o estés agotado, úsalo como combustible. Que cada golpe de la vida te haga más implacable."
  },
  {
    id: 95,
    text: "Un cuerpo débil engendra una mente débil y complaciente. La carne no es más que un instrumento que debe ser templado sin piedad en el yunque de la constancia.",
    author: "Pensamiento del Día",
    role: "Archivos Imperiales de Terra (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Tu mente nunca alcanzará su máximo potencial de lucidez y seguridad si tu cuerpo está abandonado."
  },
  {
    id: 96,
    text: "El hierro perdura a través de los siglos porque desconoce la pereza, el autoengaño y la debilidad. Haz de tu disciplina un mecanismo frío e implacable.",
    author: "Cánticos del Mechanicus",
    role: "Sacerdotes de Marte (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "No dependas de emociones variables para entrenar. Conviértete en un mecanismo que ejecuta sus hábitos sin vacilar."
  },
  {
    id: 97,
    text: "Mi armadura puede abollarse y mi carne puede desgarrarse, pero mi determinación ante la misión permanecerá intacta hasta el final.",
    author: "Capitán Demetrian Titus",
    role: "Space Marine II (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Habrá días con dolores musculares o jornadas pesadas. Mantén tu meta fija en el horizonte sin perder el rumbo."
  },
  {
    id: 98,
    text: "No les prometo una victoria fácil ni un camino cómodo. Les prometo que cuando termine la jornada, sabrán con exactitud de qué madera estamos hechos.",
    author: "Capellán Merek Grimaldus",
    role: "Héroe de Helsreach (Black Templars)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Transformar tu físico no es un paseo dominical: es una prueba de carácter donde se demuestra quién eres de verdad."
  },
  {
    id: 99,
    text: "¿Acaso quieren vivir para siempre en la mediocridad? ¡Dejen de compadecerse de ustedes mismos y avancen hacia el fuego con la cabeza en alto!",
    author: "Comisario Ibram Gaunt",
    role: "Primero y Único de Tanith (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "La autocompasión es veneno. Deja las quejas en la puerta del gimnasio y concéntrate en levantar con fuerza."
  },
  {
    id: 100,
    text: "No te detengas a lamentar lo que has dejado atrás ni los días que perdiste. La velocidad del verdadero progreso solo pertenece a los que miran fijamente hacia adelante.",
    author: "Jaghatai Khan",
    role: "El Gran Khan (Cicatrices Blancas - Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "El tiempo perdido ya no existe. Acelera hacia tus metas a partir de este preciso segundo."
  },
  {
    id: 101,
    text: "Desde las sombras más profundas de la prueba y la desolación surge la luz de los que supieron soportar la oscuridad sin quebrarse.",
    author: "Corvus Corax",
    role: "Primarca de la Guardia del Cuervo (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Los meses en los que entrenas a solas sin que nadie note tus cambios son el preludio de una transformación asombrosa."
  },
  {
    id: 102,
    text: "En el fuego de la forja, el metal no se destruye: se purifica de sus impurezas para convertirse en un arma indestructible. Acepta el fuego de tu esfuerzo.",
    author: "Vulkan",
    role: "Primarca de los Salamandras (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "El sudor y el cansancio están quemando tu versión débil para dar paso a un físico forjado en piedra."
  },
  {
    id: 103,
    text: "El Códice Astartes es solo una guía, Leandros. Te marca el camino, pero lo que realmente nos define como guerreros no son las páginas escritas, sino el coraje y la resolución con la que decidimos actuar cuando las cosas se ponen difíciles.",
    author: "Demetrian Titus",
    role: "Capitán de los Ultramarines (Space Marine 1)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Tener la rutina perfecta en papel no sirve de nada si no tienes el coraje de empujar con verdadera intensidad cuando la serie quema."
  },
  {
    id: 104,
    text: "No me importa el rango que me hayan quitado ni las cicatrices que lleve en la carne. Mientras tenga aire en los pulmones, mi deber sigue siendo exactamente el mismo: dar un paso al frente y avanzar.",
    author: "Teniente Demetrian Titus",
    role: "Veterano de los Deathwatch (Space Marine 2)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Da igual si perdiste meses sin entrenar o retrocediste en tus marcas. Tu deber con tu propio cuerpo empieza hoy, sin quejas."
  },
  {
    id: 105,
    text: "Que vengan todos. No estoy buscando una salida fácil ni un respiro de la tormenta; estoy aquí para ver cuántos obstáculos caen antes de que logren frenar mi marcha.",
    author: "Demetrian Titus",
    role: "Space Marine 2 (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Deja de desear entrenamientos ligeros o cómodos. Afronta cada serie pesada con la convicción de quien viene a conquistarla."
  },
  {
    id: 106,
    text: "No duden de su propia fuerza. Cuando la fatiga les nuble la vista y el dolor les suplique que retrocedan, confíen en las horas de entrenamiento, afirmen los pies y sigan adelante.",
    author: "Demetrian Titus",
    role: "Comandante de Escuadra (Space Marine 2)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "En la última repetición, cuando tu mente empiece a dudar si puedes sacarla: afirma los pies en el suelo, respira y levanta el peso."
  },
  {
    id: 107,
    text: "¿Crees que me quebraré ante el dolor o la duda? He caminado por el fuego de mil campos de batalla y he enterrado a hermanos de armas. Tu debilidad no tiene ningún poder sobre mí.",
    author: "Demetrian Titus",
    role: "Space Marine 1 (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Cuando la pereza o las ganas de romper la dieta intenten seducirte, recuérdate a ti mismo que la debilidad momentánea no manda sobre tu vida."
  },
  {
    id: 108,
    text: "Mi lealtad y mi disciplina no se demuestran con palabras bonitas ni discursos vacíos; se demuestran con el sudor, la sangre y los hechos concretos en el campo de batalla.",
    author: "Demetrian Titus",
    role: "Ultramarines (Warhammer 40K)",
    category: "Warhammer 40K",
    sourceTag: "Warhammer 40K",
    insight: "Deja de hablar de tus planes en redes o con amigos. Guarda silencio, entrena duro y deja que tu físico hable por ti."
  }
];

export function getDailyQuote(): Quote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % quotesLibrary.length;
  return quotesLibrary[index] || quotesLibrary[0];
}

export function getRandomQuote(excludeId?: number, categoryFilter?: string): Quote {
  let pool = quotesLibrary;
  if (categoryFilter && categoryFilter !== "Todos") {
    pool = quotesLibrary.filter(q => q.category === categoryFilter);
  }
  const filtered = excludeId && pool.length > 1 ? pool.filter(q => q.id !== excludeId) : pool;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || quotesLibrary[0];
}
