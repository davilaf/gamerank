# 🎮 GameRank - Tu Ranking Personal & Sistema de Duelos 1v1

> Aplicación web moderna, responsiva y completa para gestionar tu ranking personal de videojuegos terminados, clasificarlos interactivamente con el algoritmo de **Búsqueda Binaria (*Binary Search Insertion*)**, y recibir recomendaciones inteligentes basadas en tus gustos.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_Cloud_Sync-3ECF8E?logo=supabase)](https://supabase.com/)

---

## ✨ Características Principales

### ⚔️ 1. Sistema de Duelos 1 vs 1 (Búsqueda Binaria)
- Para valorar nuevos juegos terminados sin tener que elegir un puesto manualmente.
- Enfrentamiento directo entre el nuevo juego y el juego existente en la posición media: *"¿Cuál disfrutaste más?"*.
- En un promedio de **6 a 7 comparaciones**, el algoritmo ubica con precisión matemática el puesto exacto del juego y desplaza automáticamente los puestos inferiores.
- Atajos de teclado en PC (<kbd>1</kbd>, <kbd>2</kbd>, flechas <kbd>←</kbd> <kbd>→</kbd>, deshacer con <kbd>Ctrl+Z</kbd>) y efectos de confeti y fanfarria al completar el duelo.

### 🖼️ 2. Carátulas Oficiales en Alta Resolución (*Thumbnails*)
- Catálogo de carátulas verticales en alta resolución (Steam CDN e IGDB) para los **93 juegos iniciales** y recomendaciones.
- Visualización de carátulas en:
  - Lista detallada de juegos con modo drag-and-drop.
  - Tablero visual organizado por **Tiers (S, A, B, C, D)**.
  - Tabla compacta para revisión rápida.
  - Cartas grandes en la Arena de Duelos 1v1.
  - Tarjetas de recomendaciones.
- Resiliente con degradado neón e iniciales en caso de modo offline.

### ☁️ 3. Sincronización en la Nube en Tiempo Real (*Cloud Sync*)
- Conexión a la nube mediante **Supabase con WebSockets en Tiempo Real**.
- Cualquier cambio que realices en tu computadora (corregir portadas, notas, añadir títulos o disputar duelos) se guarda y **se refleja al instante en tu celular**.
- Botón y modal de **Nube** con estado de sincronización, enlaces directos y **Código QR** para sincronizar dispositivos en un toque.

### 🧭 4. Motor de Recomendaciones Inteligentes
- Analiza tu Top 25 (con alta afinidad en Soulslikes de FromSoftware, Metroidvanias profundos, Survival Horror y Aventuras en 3ra persona).
- Catálogo curado de más de 25 títulos sugeridos (*Lies of P, Blasphemous 1 y 2, Nioh 2, Armored Core VI, Alan Wake 2, Castlevania: SOTN, Ori, Demon's Souls, etc.*).
- Cada sugerencia incluye:
  - Porcentaje de afinidad (*Match Score*).
  - Explicación de *"¿Por qué te gustará?"* conectando con tus juegos del Top.
  - Botón directo para iniciar el duelo 1v1 y rankearlo en el acto.
  - Soporte opcional para **Google Gemini API**.

### 📱 5. Diseño Gamer & PWA Móvil
- Estética gamer oscura con paleta carbón profundo, acentos en púrpura y cian neón.
- Totalmente responsiva y optimizada para pulgar con barra inferior táctil (*BottomNav*).
- Instalable en Android e iOS como PWA nativa con pantalla completa y sin barra del navegador.

### 📊 6. Exportación e Importación
- Exportación a **Excel (.xlsx)** con columnas formateadas.
- Exportación a **CSV** (con UTF-8 BOM para compatibilidad total con Excel).
- Copia de seguridad y restauración en **JSON**.
- Botón de restauración rápida a los 93 juegos iniciales.

---

## 🚀 Instalación y Desarrollo Local

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior.

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/gamerank.git

# 2. Entrar a la carpeta
cd gamerank

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Compilar para producción
npm run build
```

---

## 🌐 Despliegue en la Nube (Hosting Gratuito)

Puedes desplegar esta aplicación de forma gratuita en:
- **Netlify**: Arrastrando la carpeta `dist` en [Netlify Drop](https://app.netlify.com/drop) o vinculando este repositorio.
- **Vercel**: Importando este repositorio desde GitHub en [Vercel](https://vercel.com).
