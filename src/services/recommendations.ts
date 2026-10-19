import { Game, Recommendation } from '../types/game';

export interface RawgGameResult {
  name: string;
  background_image?: string;
  genres?: { name: string }[];
  platforms?: { platform: { name: string } }[];
  description_raw?: string;
}

export const MASTER_RECOMMENDATIONS_DATABASE: Omit<Recommendation, 'matchScore'>[] = [
  {
    id: 'rec-lies-of-p',
    title: 'Lies of P',
    genres: ['Soulslike', 'Acción RPG', 'Gótico', 'Parry'],
    platform: 'PC / PlayStation 5 / Xbox Series',
    whyYouWillLoveIt:
      'Combina el sistema de desvíos y parry milimétrico que amas en Sekiro con la atmósfera gótica victoriana y armas transformables de Bloodborne.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'Bloodborne', 'Dark Souls 3'],
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    synopsis: 'Inspirado en la historia de Pinocho, un títere mecanizado lucha en la ciudad en ruinas de Krat contra marionetas asesinas.',
  },
  {
    id: 'rec-blasphemous-1',
    title: 'Blasphemous',
    genres: ['Metroidvania', 'Soulslike 2D', 'Fantasía Oscura', 'Pixel Art'],
    platform: 'Multiplataforma',
    whyYouWillLoveIt:
      'Combate no piadoso con ejecuciones sangrientas, parry reactivo y lore críptico que deleitará a los fanáticos de Hollow Knight y Dark Souls.',
    connectedWith: ['Hollow Knight', 'Dark Souls', 'Salt And Sanctuary'],
    synopsis: 'Explora la tierra de Cvstodia como El Penitente en una peregrinación marcada por la penitencia y el dolor religioso.',
  },
  {
    id: 'rec-blasphemous-2',
    title: 'Blasphemous 2',
    genres: ['Metroidvania', 'Acción 2D', 'Plataformas', 'Fantasía Oscura'],
    platform: 'Multiplataforma',
    whyYouWillLoveIt:
      'Perfecciona la movilidad, introduce tres tipos de armas intercambiables y un diseño de mapa brillante que fascinará a los que disfrutaron Ender Lilies y Metroid Dread.',
    connectedWith: ['Ender Lilies: Quietus of the Knights', 'Metroid Dread', 'Afterimage'],
    synopsis: 'El Penitente despierta en una nueva tierra maldita para impedir el nacimiento del nuevo vástago del Milagro.',
  },
  {
    id: 'rec-nioh-2',
    title: 'Nioh 2',
    genres: ['Soulslike', 'Acción RPG', 'Samuráis', 'Mitología Japonesa'],
    platform: 'PC / PlayStation',
    whyYouWillLoveIt:
      'El sistema de combate en tercera persona más profundo y técnico del género, con posturas de katana, habilidades Yokai y un ritmo frenético.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'Ghost Of Tsushima', 'Ninja Gaiden Sigma'],
    synopsis: 'Crea a tu propio guerrero mitad humano y mitad Yokai en el Japón feudal devastado por la guerra civil Sengoku.',
  },
  {
    id: 'rec-armored-core-6',
    title: 'Armored Core VI: Fires of Rubicon',
    genres: ['Acción', 'Mecas', 'FromSoftware', 'Ciencia Ficción'],
    platform: 'PC / PlayStation / Xbox',
    whyYouWillLoveIt:
      'Desarrollado por el mismo director de combate de Sekiro (Masaru Yamamura), ofrece batallas aéreas vertiginosas, stagger de jefes y ensamblaje táctico.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'Elden Ring'],
    synopsis: 'Controla mecas blindados personalizables en combates omnidireccionales ultrarrápidos en el planeta Rubicón 3.',
  },
  {
    id: 'rec-alan-wake-2',
    title: 'Alan Wake 2',
    genres: ['Survival Horror', 'Terror Psicológico', 'Misterio', 'Narrativo'],
    platform: 'PC / PlayStation 5 / Xbox Series',
    whyYouWillLoveIt:
      'Atmósfera asfixiante con inventario tipo cuadrícula de Resident Evil 2 Remake, disparos tácticos y la narrativa conectada del universo Remedy.',
    connectedWith: ['Resident Evil 2 (Remake)', 'Control', 'Resident Evil Village'],
    synopsis: 'La agente del FBI Saga Anderson y el escritor atrapado Alan Wake entrelazan sus pesadillas en Bright Falls.',
  },
  {
    id: 'rec-castlevania-sotn',
    title: 'Castlevania: Symphony of the Night',
    genres: ['Metroidvania', 'Acción RPG 2D', 'Gótico', 'Clásico'],
    platform: 'PlayStation / Xbox / Mobile',
    whyYouWillLoveIt:
      'El patriarca absoluto del género Metroidvania. Alucard, el castillo invertido y la banda sonora de Michiru Yamane son historia viva.',
    connectedWith: ['Record of Lodoss War: Deedlit', 'Afterimage', 'Hollow Knight'],
    synopsis: 'Alucard, hijo de Drácula, despierta de su letargo para destruir el castillo resurgido de su padre.',
  },
  {
    id: 'rec-ori-will-wisps',
    title: 'Ori and the Will of the Wisps',
    genres: ['Metroidvania', 'Plataformas', 'Acción', 'Emocional'],
    platform: 'PC / Xbox / Switch',
    whyYouWillLoveIt:
      'Plataformeo de fluidez inigualable, combate ágil con amuletos estilo Hollow Knight y un apartado visual y musical de ensueño.',
    connectedWith: ['Hollow Knight', 'Ender Lilies: Quietus of the Knights', 'Prince Of Persia: The Lost Crown'],
    synopsis: 'Ori se embarca en un viaje más allá del bosque de Nibel para desentrañar el verdadero destino de la pequeña lechuza Ku.',
  },
  {
    id: 'rec-sw-jedi-fallen-order',
    title: 'Star Wars Jedi: Fallen Order',
    genres: ['Acción', 'Aventura', 'Soulslite', 'Metroidvania 3D'],
    platform: 'PC / PlayStation / Xbox',
    whyYouWillLoveIt:
      'Combate con sable de luz con bloqueo y parry inspirado directamente en Sekiro, exploración de planetas estilo Metroidvania y tumbas Jedi.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'God Of War (2018)', 'Prince Of Persia: The Lost Crown'],
    synopsis: 'El padawan Cal Kestis sobrevive a la Orden 66 y busca restaurar la Orden Jedi mientras huye de los Inquisidores.',
  },
  {
    id: 'rec-sw-jedi-survivor',
    title: 'Star Wars Jedi: Survivor',
    genres: ['Acción', 'Aventura', 'Soulslite', 'Metroidvania 3D'],
    platform: 'PC / PlayStation 5 / Xbox Series',
    whyYouWillLoveIt:
      'Cinco posturas de combate con sable (incluyendo sable dual y cruzado), mundos inmensos repletos de atajos y una evolución narrativa sobresaliente.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'Elden Ring', 'Ghost Of Tsushima'],
    synopsis: 'Cal Kestis continúa su lucha contra el Imperio en una galaxia cada vez más sombría en busca de un refugio seguro.',
  },
  {
    id: 'rec-tlou-part-2',
    title: 'The Last Of Us Part II',
    genres: ['Acción', 'Sigilo', 'Supervivencia', 'Narrativo'],
    platform: 'PlayStation',
    whyYouWillLoveIt:
      'La continuación directa de tu #22. Sigilo tenso con esquivas, escenarios semiabiertos de Seattle y un impacto emocional devastador.',
    connectedWith: ['The Last Of Us Part I', 'Uncharted: Drake\'s Fortune', 'Days Gone'],
    synopsis: 'Cinco años después de su peligroso viaje, Ellie se embarca en una implacable búsqueda de justicia y venganza.',
  },
  {
    id: 'rec-demons-souls',
    title: "Demon's Souls (PS5 Remake)",
    genres: ['Soulslike', 'Acción RPG', 'Fantasía Oscura'],
    platform: 'PlayStation 5',
    whyYouWillLoveIt:
      'Donde nació todo. Gráficos de nueva generación apabullantes de Bluepoint Games, atmósfera lúgubre de Boletaria y la esencia pura de FromSoftware.',
    connectedWith: ['Dark Souls', 'Dark Souls 3', 'Elden Ring'],
    synopsis: 'Adéntrate en el reino de Boletaria devorado por una densa niebla y monstruos insaciables desatados por el Anciano.',
  },
  {
    id: 'rec-dead-space-remake',
    title: 'Dead Space (Remake 2023)',
    genres: ['Survival Horror', 'Ciencia Ficción', 'Terror'],
    platform: 'PC / PlayStation 5 / Xbox Series',
    whyYouWillLoveIt:
      'Tensión implacable, mutilación estratégica de extremidades en gravedad cero y atmósfera sonora escalofriante a la altura de Resident Evil 2.',
    connectedWith: ['Resident Evil 2 (Remake)', 'Hellpoint', 'Resident Evil 4'],
    synopsis: 'El ingeniero Isaac Clarke investiga la nave minera USG Ishimura infestada de terroríficos necromorfos.',
  },
  {
    id: 'rec-black-myth-wukong',
    title: 'Black Myth: Wukong',
    genres: ['Acción RPG', 'Mitología', 'Boss Rush', 'Soulslike'],
    platform: 'PC / PlayStation 5',
    whyYouWillLoveIt:
      'Inspirado en Viaje al Oeste, ofrece combates vertiginosos con bastón, transformaciones espectaculares y decenas de jefes colosales.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'God Of War (2018)', '9 Monkeys of Shaolin'],
    synopsis: 'Como el Predestinado, aventúrate en leyendas del folklore chino para recuperar reliquias místicas.',
  },
  {
    id: 'rec-stellar-blade',
    title: 'Stellar Blade',
    genres: ['Acción', 'Hack and Slash', 'Parry', 'Ciencia Ficción'],
    platform: 'PlayStation 5 / PC',
    whyYouWillLoveIt:
      'Ritmo electrizante basado en desvíos perfectos (parry) y esquivas milimétricas, jefes imponentes y banda sonora fabulosa.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'Ghost Of Tsushima', 'Dmc Devil May Cry'],
    synopsis: 'La guerrera Eve desciende a una Tierra postapocalíptica invadida por monstruos Naytiba para salvar a la humanidad.',
  },
  {
    id: 'rec-nine-sols',
    title: 'Nine Sols',
    genres: ['Metroidvania', 'Taopunk', 'Acción 2D', 'Parry'],
    platform: 'PC / Switch / PlayStation / Xbox',
    whyYouWillLoveIt:
      'Apodado "el Sekiro 2D", su mecánica central es la deflexión con espada en un mundo cyberpunk-taoísta de diseño artístico excepcional.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'Hollow Knight', 'Ender Lilies: Quietus of the Knights'],
    synopsis: 'Yi despierta en Nueva Kunlun en una misión de venganza contra los 9 reyes solares que dominan este reino.',
  },
  {
    id: 'rec-silent-hill-2-remake',
    title: 'Silent Hill 2 (Remake 2024)',
    genres: ['Survival Horror', 'Terror Psicológico', 'Puzles'],
    platform: 'PC / PlayStation 5',
    whyYouWillLoveIt:
      'Recreación magistral de Bloober Team con niebla volumétrica envolvente, combate tenso con radio chirriante y una de las historias más profundas del medio.',
    connectedWith: ['Resident Evil 2 (Remake)', 'Hellblade: Senua\'s Sacrifice', 'Resident Evil Remake'],
    synopsis: 'James Sunderland viaja a la niebla de Silent Hill tras recibir una carta de su difunta esposa Mary.',
  },
  {
    id: 'rec-axiom-verge',
    title: 'Axiom Verge',
    genres: ['Metroidvania', 'Ciencia Ficción', 'Pixel Art', 'Indie'],
    platform: 'Multiplataforma',
    whyYouWillLoveIt:
      'El homenaje más reverente a la saga Metroid clásica, con un arma de alteración de glitches que manipula el propio motor del juego.',
    connectedWith: ['Metroid Dread', 'Hollow Knight'],
    synopsis: 'Tras una explosión de laboratorio, el científico Trace despierta en Sudra, un mundo alienígena biomecánico.',
  },
  {
    id: 'rec-grime',
    title: 'Grime',
    genres: ['Soulslike 2D', 'Metroidvania', 'Acción', 'Surrealista'],
    platform: 'Multiplataforma',
    whyYouWillLoveIt:
      'Tu cabeza es un agujero negro que absorbe los ataques de los enemigos para asimilar sus habilidades corporales.',
    connectedWith: ['Salt And Sanctuary', 'Mortal Shell', 'Ender Lilies: Quietus of the Knights'],
    synopsis: 'Explora un mundo anatómicamente surrealista devorando formas de vida para mutar tu propio cuerpo.',
  },
  {
    id: 'rec-remnant-2',
    title: 'Remnant 2',
    genres: ['Soulslike Shooter', 'Acción RPG', 'Cooperativo', 'Tercera Persona'],
    platform: 'PC / PlayStation 5 / Xbox Series',
    whyYouWillLoveIt:
      'Considerado "Dark Souls con armas de fuego", destaca por sus arquetipos versátiles, generación procedimental de mundos y jefes con puzles.',
    connectedWith: ['Dark Souls 3', 'Hellpoint', 'Control'],
    synopsis: 'Supervivientes de la humanidad viajan por dimensiones desconocidas para detener a la Raíz destructora del multiverso.',
  },
  {
    id: 'rec-sifu',
    title: 'Sifu',
    genres: ['Beat em up', 'Artes Marciales', 'Acción', 'Desvíos'],
    platform: 'Multiplataforma',
    whyYouWillLoveIt:
      'Combate de kung-fu Pak Mei de máxima exigencia donde cada muerte te envejece, exigiendo precisión, reflejos y maestría pura.',
    connectedWith: ['Sekiro: Shadows Die Twice', 'Streets of Rage 4', 'Judgment'],
    synopsis: 'Un estudiante de kung-fu busca vengar a su maestro a lo largo de una vida que se agota con cada caída.',
  },
  {
    id: 'rec-batman-arkham-city',
    title: 'Batman: Arkham City',
    genres: ['Acción', 'Aventura', 'Superhéroes', 'Mundo Abierto'],
    platform: 'PC / PlayStation / Xbox',
    whyYouWillLoveIt:
      'La secuela perfecta de Arkham Asylum (#31) y Arkham Origins (#28), con planeo sobre Gotham, trama electrizante con el Joker y combate perfeccionado.',
    connectedWith: ['Batman: Arkham Asylum', 'Batman: Arkham Origins', 'Marvel\'s Spider-Man'],
    synopsis: 'El Caballero Oscuro es encarcelado dentro de la mega-prisión de Arkham City liderada por el Dr. Hugo Strange.',
  },
  {
    id: 'rec-resident-evil-7',
    title: 'Resident Evil 7: Biohazard',
    genres: ['Survival Horror', 'Terror', 'Primera Persona'],
    platform: 'Multiplataforma',
    whyYouWillLoveIt:
      'El preludio de Resident Evil Village (#21). La mansión de los Baker en Luisiana devuelve la saga a sus raíces de terror más opresivas.',
    connectedWith: ['Resident Evil Village', 'Resident Evil 2 (Remake)', 'Resident Evil Remake'],
    synopsis: 'Ethan Winters busca a su esposa desaparecida Mia en una decrépita plantación sureña controlada por la perturbada familia Baker.',
  },
];

/**
 * Calcula afinidad y filtra recomendaciones contra la lista actual de juegos terminados del usuario.
 */
export function getRecommendations(finishedGames: Game[]): Recommendation[] {
  // Extraer títulos normalizados de los juegos ya terminados
  const finishedTitlesNormalized = new Set(
    finishedGames.map((g) => g.title.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );

  // Analizar géneros más populares en el Top 25
  const top25 = finishedGames.slice(0, 25);
  const genreFrequency: Record<string, number> = {};

  top25.forEach((game, idx) => {
    // Juegos en posiciones más altas dan más peso (Sekiro #1 da más peso que #25)
    const weight = 26 - idx;
    game.genres.forEach((genre) => {
      genreFrequency[genre] = (genreFrequency[genre] || 0) + weight;
    });
  });

  // Filtrar las recomendaciones que el usuario NO haya terminado todavía
  const uncompleted = MASTER_RECOMMENDATIONS_DATABASE.filter((rec) => {
    const norm = rec.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return !finishedTitlesNormalized.has(norm);
  });

  // Calcular Match Score basado en afinidad de géneros y títulos conectados
  const scoredRecommendations: Recommendation[] = uncompleted.map((rec) => {
    let score = 70; // Base score

    // Bonificación por géneros coincidentes con el Top 25
    rec.genres.forEach((g) => {
      if (genreFrequency[g]) {
        score += Math.min(20, Math.floor(genreFrequency[g] / 5));
      }
    });

    // Bonificación si conecta directamente con títulos del Top 10
    rec.connectedWith.forEach((connTitle) => {
      const topMatch = top25.find((tg) => tg.title.toLowerCase().includes(connTitle.toLowerCase().slice(0, 8)));
      if (topMatch) {
        if (topMatch.rank <= 5) score += 10;
        else if (topMatch.rank <= 10) score += 6;
        else score += 3;
      }
    });

    // Limitar puntuación a 99% máximo
    const matchScore = Math.min(99, Math.max(75, score));

    return {
      ...rec,
      matchScore,
    };
  });

  // Ordenar por afinidad de mayor a menor
  return scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Consulta la API de Google Gemini para obtener 3-5 recomendaciones personalizadas en tiempo real
 */
export async function fetchGeminiRecommendations(
  apiKey: string,
  topGames: Game[]
): Promise<Recommendation[]> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Debes ingresar tu clave de Gemini API en la configuración.');
  }

  const topTitlesList = topGames.slice(0, 15).map((g) => `#${g.rank} ${g.title} (${g.genres.join(', ')})`).join('\n');

  const prompt = `Actúa como un crítico y experto en videojuegos. Basado en el Top 15 personal de videojuegos favoritos de este jugador:
${topTitlesList}

Genera exactamente 4 recomendaciones de videojuegos que NO estén en su lista.
Para cada juego, proporciona una conexión profunda explicando por qué le encantará teniendo en cuenta sus gustos específicos (parry, soulslike, metroidvania, atmósfera, combate técnico, etc.).

Responde ÚNICAMENTE con un JSON válido con la siguiente estructura (sin markdown adicional, solo el JSON):
[
  {
    "title": "Nombre del Juego",
    "genres": ["Género1", "Género2"],
    "platform": "Plataforma(s)",
    "whyYouWillLoveIt": "Explicación detallada de por qué le gustará conectando con sus juegos favoritos",
    "connectedWith": ["Juego de su top 1", "Juego de su top 2"],
    "matchScore": 95
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error de Gemini API (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No se recibió respuesta válida del modelo Gemini.');
  }

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('El formato devuelto por la IA no fue una lista.');
  }

  return parsed.map((item, idx) => ({
    id: `gemini-rec-${Date.now()}-${idx}`,
    title: item.title,
    genres: Array.isArray(item.genres) ? item.genres : ['Acción', 'Aventura'],
    platform: item.platform || 'Multiplataforma',
    whyYouWillLoveIt: item.whyYouWillLoveIt,
    connectedWith: Array.isArray(item.connectedWith) ? item.connectedWith : [],
    matchScore: item.matchScore || 95,
    source: 'gemini' as const,
  }));
}
