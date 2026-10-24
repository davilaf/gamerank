import { getCoverUrlForTitle } from './covers';

export interface GameSearchResult {
  title: string;
  coverUrl?: string;
  genres: string[];
  platform?: string;
  description?: string;
}

const RAWG_API_KEY = 'c542e67aec3a4340908f9de9e86038af';

/**
 * Busca información y carátula de un videojuego en línea (RAWG API) con fallback a la base local
 */
export async function searchGameCoverAndInfo(query: string): Promise<GameSearchResult | null> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  // 1. Revisar primero si está en nuestro catálogo local de carátulas en alta resolución
  const localCover = getCoverUrlForTitle(cleanQuery);

  try {
    // 2. Buscar en RAWG API (soporta CORS universal y tiene cientos de miles de juegos)
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(
      cleanQuery
    )}&page_size=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const firstResult = data.results?.[0];

      if (firstResult) {
        const rawgCover = firstResult.background_image || undefined;
        const genres = firstResult.genres?.map((g: any) => g.name) || [];
        const platforms =
          firstResult.platforms?.slice(0, 3).map((p: any) => p.platform?.name).join(' / ') ||
          'Multiplataforma';

        return {
          title: firstResult.name || cleanQuery,
          // Priorizar carátula local vertical curada si existe, sino la de RAWG
          coverUrl: localCover || rawgCover,
          genres: mapRawgGenresToSpanish(genres),
          platform: platforms,
        };
      }
    }
  } catch (err) {
    console.warn('[gameSearch] Error al consultar RAWG API:', err);
  }

  // 3. Si la API no respondió o falló, pero tenemos la carátula local, la devolvemos
  if (localCover) {
    return {
      title: cleanQuery,
      coverUrl: localCover,
      genres: ['Acción'],
      platform: 'Multiplataforma',
    };
  }

  return null;
}

/**
 * Mapea géneros de RAWG al español
 */
function mapRawgGenresToSpanish(genres: string[]): string[] {
  const map: Record<string, string> = {
    Action: 'Acción',
    Adventure: 'Aventura',
    RPG: 'Acción RPG',
    Shooter: 'Shooter',
    Platformer: 'Plataformas',
    Puzzle: 'Puzles',
    Sports: 'Deportes',
    Racing: 'Carreras',
    Fighting: 'Lucha',
    Indie: 'Indie',
  };

  const translated = genres.map((g) => map[g] || g);
  return translated.length > 0 ? translated : ['Acción'];
}

/**
 * Catálogo de sugerencias rápidas de videojuegos populares listos para rankear
 */
export const POPULAR_SUGGESTED_GAMES: Array<{
  title: string;
  platform: string;
  genres: string[];
  coverUrl?: string;
  notes: string;
}> = [
  {
    title: 'Lies of P',
    platform: 'PC / PlayStation 5 / Xbox Series',
    genres: ['Soulslike', 'Acción RPG', 'Fantasía Oscura'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1627720/library_600x900_2x.jpg',
    notes: 'Increíble sistema de parry y desvíos estilo Sekiro con una ambientación gótica soberbia. Los jefes finales son memorables.',
  },
  {
    title: 'Black Myth: Wukong',
    platform: 'PC / PlayStation 5',
    genres: ['Acción RPG', 'Mitología', 'Soulslike'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg',
    notes: 'Apartado visual imponente en Unreal Engine 5 y combates vertiginosos con el bastón y transformaciones mágicas.',
  },
  {
    title: 'Silent Hill 2 (Remake)',
    platform: 'PC / PlayStation 5',
    genres: ['Survival Horror', 'Terror Psicológico'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_600x900_2x.jpg',
    notes: 'Reinvención magistral de un clásico. Atmósfera asfixiante con la niebla, diseño sonoro aterrador y combate muy tenso.',
  },
  {
    title: 'Hades II',
    platform: 'PC / Consolas',
    genres: ['Roguelite', 'Acción', 'Hack and Slash'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/library_600x900_2x.jpg',
    notes: 'Melínoe ofrece hechizos y brujería con un control perfecto. Banda sonora sensacional y narrativa que engancha desde el primer intento.',
  },
  {
    title: 'Blasphemous 2',
    platform: 'Multiplataforma',
    genres: ['Metroidvania', 'Soulslike 2D', 'Plataformas'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2114740/library_600x900_2x.jpg',
    notes: 'Perfecciona al primero en movilidad, armas versátiles y diseño de mapa. El apartado artístico en pixel art es una obra de arte.',
  },
  {
    title: 'Nioh 2',
    platform: 'PC / PlayStation',
    genres: ['Soulslike', 'Acción RPG', 'Samuráis'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1325200/library_600x900_2x.jpg',
    notes: 'El sistema de combate más técnico y gratificante del género. Variedad infinita de builds y habilidades Yokai espectaculares.',
  },
  {
    title: 'Alan Wake 2',
    platform: 'PC / PlayStation 5 / Xbox Series',
    genres: ['Survival Horror', 'Terror Psicológico', 'Misterio'],
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co79t2.jpg',
    notes: 'Narrativa brillante de misterio y terror. La gestión del inventario y el uso de la linterna y disparos son soberbios.',
  },
  {
    title: 'Armored Core VI: Fires of Rubicon',
    platform: 'PC / PlayStation / Xbox',
    genres: ['Acción', 'Mecas', 'Ciencia Ficción'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888160/library_600x900_2x.jpg',
    notes: 'Combates omnidireccionales a toda velocidad. Gran satisfacción al personalizar el meca para contrarrestar jefes desafiantes.',
  },
  {
    title: 'Nine Sols',
    platform: 'PC / Consolas',
    genres: ['Metroidvania', 'Acción 2D', 'Parry'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1809540/library_600x900_2x.jpg',
    notes: 'El "Sekiro en 2D": combate basado en deflexiones perfectas, estética taopunk única y jefes con coreografías exquisitas.',
  },
  {
    title: 'Stellar Blade',
    platform: 'PlayStation 5',
    genres: ['Acción', 'Hack and Slash', 'Ciencia Ficción'],
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8jox.jpg',
    notes: 'Combate dinámico con parry y esquivas precisas, banda sonora sensacional y combates contra Naytibas colosales.',
  },
  {
    title: 'Sifu',
    platform: 'Multiplataforma',
    genres: ['Beat em up', 'Acción', 'Artes Marciales'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2138710/library_600x900_2x.jpg',
    notes: 'Mecánica de envejecimiento original y coreografías de kung-fu al estilo de las mejores películas de acción. Dificultad pura y dura.',
  },
  {
    title: 'Cyberpunk 2077: Phantom Liberty',
    platform: 'PC / PlayStation 5 / Xbox Series',
    genres: ['Acción RPG', 'Mundo Abierto', 'Ciencia Ficción'],
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2138330/library_600x900_2x.jpg',
    notes: 'Night City en su máxima expresión. Trama de espionaje apasionante con Idris Elba y tiroteos sumamente fluidos y divertidos.',
  },
];

/**
 * Genera impresiones o notas personales automáticas según el título y los géneros del juego
 */
export function generateSmartImpressions(title: string, genres: string[] = []): string {
  const cleanTitle = title.trim();
  const lowerGenres = genres.map((g) => g.toLowerCase());

  const isSoulslike = lowerGenres.some((g) => g.includes('souls') || g.includes('parry') || g.includes('fromsoft'));
  const isMetroidvania = lowerGenres.some((g) => g.includes('metroid') || g.includes('vania'));
  const isHorror = lowerGenres.some((g) => g.includes('horror') || g.includes('terror') || g.includes('survival'));
  const isHackSlash = lowerGenres.some((g) => g.includes('hack') || g.includes('slash') || g.includes('beat'));
  const isPlatformer = lowerGenres.some((g) => g.includes('plataform'));
  const isRpg = lowerGenres.some((g) => g.includes('rpg') || g.includes('rol'));

  const soulslikeOptions = [
    `Excelente experiencia desafiante. El combate es milimétrico, los jefes exigen aprender sus patrones a la perfección y la sensación de victoria es insuperable.`,
    `Atmósfera oscura envolvente y combate técnico muy satisfactorio. El timing de los desvíos y la tensión de cada enfrentamiento lo hacen inolvidable.`,
    `Diseño de niveles soberbio con atajos ingeniosos. El lore y la ambientación son una delicia para los que amamos los retos exigentes.`,
  ];

  const metroidvaniaOptions = [
    `Exploración brillante. El diseño del mapa interconectado, las nuevas habilidades que abren caminos previamente bloqueados y los secretos son de 10.`,
    `Adictivo de principio a fin. El ritmo de progreso se siente fluido, el combate es ágil y el apartado audiovisual acompaña de maravilla.`,
    `Un plataformeo muy pulido y una sensación constante de descubrimiento. Cada rincón del mapa premia la curiosidad del jugador.`,
  ];

  const horrorOptions = [
    `Tensión constante y una ambientación asfixiante. La gestión de munición e inventario te mantiene al borde del asiento todo el tiempo.`,
    `Dirección de arte y diseño sonoro espectaculares. Logra meterte el miedo en el cuerpo y hacer que cada paso hacia lo desconocido pese.`,
    `Un survival horror como debe ser: recursos justos, puzles bien pensados y enemigos amenazantes que te obligan a medir cada bala.`,
  ];

  const hackSlashOptions = [
    `Acción pura sin respiro. Los combos son sumamente fluidos y satisfactorios, y la banda sonora le da una inyección de adrenalina a cada pelea.`,
    `Combate rápido, vistoso y con gran respuesta en los controles. Ideal para desconectar y disfrutar destrozando oleadas de enemigos.`,
  ];

  const genericOptions = [
    `Una grata sorpresa. Apartado visual muy cuidado, jugabilidad sólida y una historia que se disfruta de principio a fin. Totalmente recomendado.`,
    `Gran ritmo de juego, controles precisos y momentos cumbre muy memorables. Me dejó un excelente sabor de boca tras completarlo.`,
    `Juegazo muy entretenido con mecánicas bien pulidas. Cumple con creces lo que promete y ofrece una experiencia muy redonda.`,
  ];

  let pool = genericOptions;
  if (isSoulslike) pool = soulslikeOptions;
  else if (isMetroidvania) pool = metroidvaniaOptions;
  else if (isHorror) pool = horrorOptions;
  else if (isHackSlash) pool = hackSlashOptions;

  const randomIdx = Math.floor(Math.random() * pool.length);
  return pool[randomIdx];
}
