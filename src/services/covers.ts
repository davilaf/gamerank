/**
 * Servicio de carátulas para videojuegos.
 * Mapeo curado de URLs de carátulas verticales oficiales en alta resolución (Steam CDN, IGDB, PlayStation, Nintendo).
 */

export const GAME_COVERS_MAP: Record<string, string> = {
  // Top 10 S-Tier
  'Sekiro: Shadows Die Twice': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900_2x.jpg',
  'Sekiro': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900_2x.jpg',
  'Elden Ring': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg',
  'Dark Souls 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/335300/library_600x900_2x.jpg',
  'Dark Souls 3': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/library_600x900_2x.jpg',
  'Ghost Of Tsushima': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/library_600x900_2x.jpg',
  'Hollow Knight': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900_2x.jpg',
  'Ender Lilies: Quietus of the Knights': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1369630/library_600x900_2x.jpg',
  'Ender Lilies': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1369630/library_600x900_2x.jpg',
  'Metroid Dread': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3905.jpg',
  'Super Mario Odyssey': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1m59.jpg',
  'Mario Oddysey': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1m59.jpg',
  'Resident Evil 2 (Remake)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/883710/library_600x900_2x.jpg',
  'Resident Evil 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/883710/library_600x900_2x.jpg',

  // Puestos 11 al 25 (A-Tier)
  'Dark Souls': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570940/library_600x900_2x.jpg',
  'Bloodborne': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg',
  'Hellpoint': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/628670/library_600x900_2x.jpg',
  "Yoshi's Crafted World": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nvd.jpg',
  "Yoshi'S Crafted World": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nvd.jpg',
  'Prince Of Persia: The Lost Crown': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2751000/library_600x900_2x.jpg',
  'Prince Of Persia The Lost Crown': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2751000/library_600x900_2x.jpg',
  'Afterimage': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1701520/library_600x900_2x.jpg',
  "Marvel's Spider-Man": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900_2x.jpg',
  'Marvel Spider Man': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900_2x.jpg',
  'God Of War (2018)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900_2x.jpg',
  'God Of War': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900_2x.jpg',
  'Dead Cells': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/588650/library_600x900_2x.jpg',
  'Mortal Shell': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1110910/library_600x900_2x.jpg',
  'Resident Evil Village': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1196590/library_600x900_2x.jpg',
  'The Last Of Us Part I': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900_2x.jpg',
  'The Last Of Us 1': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900_2x.jpg',
  'Immortals Fenyx Rising': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2221920/library_600x900_2x.jpg',
  'Inmortals Fenix Rising': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2221920/library_600x900_2x.jpg',
  'Salt And Sanctuary': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/283640/library_600x900_2x.jpg',
  'Far Cry 5': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/552520/library_600x900_2x.jpg',

  // Puestos 26 al 50 (B-Tier)
  "Marvel's Guardians Of The Galaxy": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1088850/library_600x900_2x.jpg',
  'Guardians Of The Galaxy': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1088850/library_600x900_2x.jpg',
  'Resident Evil 3 (Remake)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/952060/library_600x900_2x.jpg',
  'Resident Evil 3': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/952060/library_600x900_2x.jpg',
  'Batman: Arkham Origins': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/209000/library_600x900_2x.jpg',
  'Batman Arkham Origins': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/209000/library_600x900_2x.jpg',
  "Uncharted: Drake's Fortune": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20ee.jpg',
  "Uncharted Drake'S Fortune": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20ee.jpg',
  'Resident Evil 4 (Original / HD)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/254700/library_600x900_2x.jpg',
  'Resident Evil 4': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/254700/library_600x900_2x.jpg',
  'Batman: Arkham Asylum': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/35140/library_600x900_2x.jpg',
  'Batman Arkham Asylum': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/35140/library_600x900_2x.jpg',
  'Hitman (2016)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/236870/library_600x900_2x.jpg',
  'Hitman 1': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/236870/library_600x900_2x.jpg',
  'Judgment': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2058180/library_600x900_2x.jpg',
  'Record of Lodoss War: Deedlit in Wonder Labyrinth': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1209420/library_600x900_2x.jpg',
  'deedlit in Wonder Labyrinth Record of Lodoss War': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1209420/library_600x900_2x.jpg',
  'Metro Exodus': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/412020/library_600x900_2x.jpg',
  'Guacamelee!': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275390/library_600x900_2x.jpg',
  'Guacamelee': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275390/library_600x900_2x.jpg',
  'Mortal Kombat X': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/307780/library_600x900_2x.jpg',
  'Resident Evil (HD Remaster)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/304240/library_600x900_2x.jpg',
  'Resident Evil Remake': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/304240/library_600x900_2x.jpg',
  'Deadpool': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1w6k.jpg',
  'Sniper Ghost Warrior Contracts 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1338770/library_600x900_2x.jpg',
  'Sniper Contracts 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1338770/library_600x900_2x.jpg',
  'Chronos: Before the Ashes': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/967390/library_600x900_2x.jpg',
  'Chronos Before The Ashes': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/967390/library_600x900_2x.jpg',
  'Marvel Ultimate Alliance': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x20.jpg',
  'Marvel Ultimate Alliance 1': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x20.jpg',
  'A Plague Tale: Innocence': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/752590/library_600x900_2x.jpg',
  'A Plague Tale Inocence': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/752590/library_600x900_2x.jpg',
  "Luigi's Mansion 3": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1o36.jpg',
  "Luigi'S Mansion 3": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1o36.jpg',
  'Maneater': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/629820/library_600x900_2x.jpg',
  'Middle-earth: Shadow of Mordor': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/241930/library_600x900_2x.jpg',
  'Shadow Of Mordor': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/241930/library_600x900_2x.jpg',
  "The Legend of Zelda: Link's Awakening (Remake)": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nhv.jpg',
  "The Legend Of Zelda: Link'S Awakening": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nhv.jpg',
  'Elderand': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1413660/library_600x900_2x.jpg',
  'The Last Hero of Nostalgaia': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1766100/library_600x900_2x.jpg',
  'The Last Hero Of Nostalgaia': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1766100/library_600x900_2x.jpg',
  'Brütal Legend': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/225260/library_600x900_2x.jpg',
  'Brutal Legend': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/225260/library_600x900_2x.jpg',

  // Puestos 51 al 75 (C-Tier)
  "Marvel's Avengers": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/997070/library_600x900_2x.jpg',
  'Marvel Avengers': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/997070/library_600x900_2x.jpg',
  'Battlefield 4': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1238860/library_600x900_2x.jpg',
  'Call of Duty: Black Ops III': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/311210/library_600x900_2x.jpg',
  'Call Of Duty Black Ops 3': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/311210/library_600x900_2x.jpg',
  'Cobra Kai: The Karate Kid Saga Continues': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1279970/library_600x900_2x.jpg',
  'Cobra Kai': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1279970/library_600x900_2x.jpg',
  'Control': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/870780/library_600x900_2x.jpg',
  'DmC: Devil May Cry': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220440/library_600x900_2x.jpg',
  'Dmc Devil May Cry': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220440/library_600x900_2x.jpg',
  "Hellblade: Senua's Sacrifice": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/414340/library_600x900_2x.jpg',
  'Hellblade Senuas Sacrifice': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/414340/library_600x900_2x.jpg',
  "Assassin's Creed (Original)": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x17.jpg',
  'Assasins Creed': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x17.jpg',
  'Call of Duty: Black Ops Cold War': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1985810/library_600x900_2x.jpg',
  'Call Of Duty Cold War': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1985810/library_600x900_2x.jpg',
  'Biomutant': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/597820/library_600x900_2x.jpg',
  'Gears of War': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x18.jpg',
  'Streets of Rage 4': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/985890/library_600x900_2x.jpg',
  'Gears of War 2': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k9x.jpg',
  'Days Gone': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259420/library_600x900_2x.jpg',
  'Astérix & Obélix XXL: Romastered': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1384070/library_600x900_2x.jpg',
  'Asterix & Obélix Xxl': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1384070/library_600x900_2x.jpg',
  'FIFA 22': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1506830/library_600x900_2x.jpg',
  'Fifa 22': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1506830/library_600x900_2x.jpg',
  "TMNT: Shredder's Revenge": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1361510/library_600x900_2x.jpg',
  'Tmnt Shedder Revenge': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1361510/library_600x900_2x.jpg',
  'The Ascent': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/979690/library_600x900_2x.jpg',
  'Ninja Gaiden Sigma': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1580780/library_600x900_2x.jpg',
  'Vampyr': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/427720/library_600x900_2x.jpg',
  'TMNT: Mutants in Manhattan': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wqb.jpg',
  'Tmnt: Mutants In Manhattan': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wqb.jpg',
  'Double Dragon Gaiden: Rise of the Dragons': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1967200/library_600x900_2x.jpg',
  'Double Dragon Gaiden Rose Of The Dragons': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1967200/library_600x900_2x.jpg',
  'UnMetal': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1203710/library_600x900_2x.jpg',
  '9 Monkeys of Shaolin': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/739080/library_600x900_2x.jpg',
  'Shaq Fu: A Legend Reborn': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x2h.jpg',
  'Shaq Fu': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x2h.jpg',

  // Puestos 76 al 93 (D-Tier)
  'FIFA 16': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k0c.jpg',
  'Fifa 16': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k0c.jpg',
  'The First Templar': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/57680/library_600x900_2x.jpg',
  'Homefront: The Revolution': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/223100/library_600x900_2x.jpg',
  'Homefront The Revolution': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/223100/library_600x900_2x.jpg',
  'PES 2012': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k5j.jpg',
  'Pes 2012': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k5j.jpg',
  'Deadlight': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/211400/library_600x900_2x.jpg',
  'PES 2010': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k5g.jpg',
  'Pes 2010': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k5g.jpg',
  'Inside': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/304430/library_600x900_2x.jpg',
  'Bud Spencer & Terence Hill - Slaps And Beans': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/564050/library_600x900_2x.jpg',
  'Slaps And Beans': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/564050/library_600x900_2x.jpg',
  'The Wolf Among Us': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/250320/library_600x900_2x.jpg',
  'A Memoir Blue': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1497450/library_600x900_2x.jpg',
  'Synchro Hedgehogs': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1336040/library_600x900_2x.jpg',
  'The Little Acre': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2044.jpg',
  'Butterfly 2': 'https://cdn.cloudflare.steamstatic.com/steam/apps/1484670/header.jpg',
  'Butterfly': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1393660/library_600x900_2x.jpg',
  'Smart Moves': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1183350/library_600x900_2x.jpg',
  'Smart Moves 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1373510/library_600x900_2x.jpg',
  '112th Seed': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1207130/library_600x900_2x.jpg',
  '112Th Seed': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1207130/library_600x900_2x.jpg',
  'Aborigenus': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814400/library_600x900_2x.jpg',

  // Recomendados Principales
  'Lies of P': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1627720/library_600x900_2x.jpg',
  'Blasphemous': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/774361/library_600x900_2x.jpg',
  'Blasphemous 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2114740/library_600x900_2x.jpg',
  'Nioh 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1325200/library_600x900_2x.jpg',
  'Armored Core VI: Fires of Rubicon': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888160/library_600x900_2x.jpg',
  'Alan Wake 2': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co79t2.jpg',
  'Castlevania: Symphony of the Night': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x3c.jpg',
  'Ori and the Will of the Wisps': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1057090/library_600x900_2x.jpg',
  'Star Wars Jedi: Fallen Order': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172380/library_600x900_2x.jpg',
  'Star Wars Jedi: Survivor': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1774580/library_600x900_2x.jpg',
  'The Last Of Us Part II': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5ziw.jpg',
  "Demon's Souls (PS5 Remake)": 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2947.jpg',
  'Dead Space (Remake 2023)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1693980/library_600x900_2x.jpg',
  'Black Myth: Wukong': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg',
  'Stellar Blade': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8jox.jpg',
  'Nine Sols': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1809540/library_600x900_2x.jpg',
  'Silent Hill 2 (Remake 2024)': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_600x900_2x.jpg',
  'Axiom Verge': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/332200/library_600x900_2x.jpg',
  'Grime': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1129580/library_600x900_2x.jpg',
  'Remnant 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1282100/library_600x900_2x.jpg',
  'Sifu': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2138710/library_600x900_2x.jpg',
  'Batman: Arkham City': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/200260/library_600x900_2x.jpg',
  'Resident Evil 7: Biohazard': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/418370/library_600x900_2x.jpg',
};

/**
 * Normaliza el título de un juego para búsqueda flexible
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Obtiene la URL de carátula recomendada o precargada para un título dado
 */
export function getCoverUrlForTitle(title: string): string | undefined {
  if (!title) return undefined;

  // Búsqueda directa
  if (GAME_COVERS_MAP[title]) {
    return GAME_COVERS_MAP[title];
  }

  // Búsqueda normalizada
  const targetNorm = normalizeTitle(title);
  for (const [key, url] of Object.entries(GAME_COVERS_MAP)) {
    if (normalizeTitle(key) === targetNorm) {
      return url;
    }
  }

  // Búsqueda por subcadena
  for (const [key, url] of Object.entries(GAME_COVERS_MAP)) {
    const keyNorm = normalizeTitle(key);
    if (targetNorm.includes(keyNorm) || keyNorm.includes(targetNorm)) {
      return url;
    }
  }

  return undefined;
}
