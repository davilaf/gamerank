import React, { useState } from 'react';
import { Gamepad2, ImageOff } from 'lucide-react';
import { getCoverUrlForTitle } from '../../services/covers';

interface GameCoverProps {
  title: string;
  coverUrl?: string;
  className?: string;
  aspectRatio?: 'poster' | 'square' | 'video';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: string;
  onClick?: () => void;
  priority?: boolean;
}

export function GameCover({
  title,
  coverUrl,
  className = '',
  aspectRatio = 'poster',
  size = 'md',
  rounded = 'rounded-xl',
  onClick,
  priority = false,
}: GameCoverProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Intentar obtener la URL desde prop o desde el catálogo curado
  const resolvedUrl = coverUrl || getCoverUrlForTitle(title);

  // Iniciales del juego para el fallback estético
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '🎮';

  // Dimensiones sugeridas según tamaño
  const sizeClasses = {
    xs: 'w-8 h-11 text-[9px]',      // para tabla compacta
    sm: 'w-11 h-15 text-xs',        // para tablero tiers
    md: 'w-14 sm:w-16 h-20 sm:h-22 text-xs', // para lista de ranking
    lg: 'w-24 h-34 text-sm',        // para recomendaciones
    xl: 'w-32 sm:w-44 h-48 sm:h-64 text-base', // para modal de duelo
  }[size];

  const aspectClass = aspectRatio === 'poster' ? 'aspect-[2/3]' : aspectRatio === 'video' ? 'aspect-video' : 'aspect-square';

  return (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 overflow-hidden select-none bg-slate-950 border border-slate-800/80 shadow-md ${sizeClasses} ${aspectClass} ${rounded} ${
        onClick ? 'cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all' : ''
      } ${className}`}
    >
      {resolvedUrl && !hasError ? (
        <>
          {/* Skeleton o fondo mientras carga */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-slate-700 animate-spin-slow" />
            </div>
          )}
          <img
            src={resolvedUrl}
            alt={`Carátula de ${title}`}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        /* Fallback Gamer Estilizado */
        <div className="w-full h-full bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-1 text-center border border-slate-800">
          <Gamepad2 className="w-4 h-4 text-purple-400/60 mb-0.5" />
          <span className="font-black text-slate-300 tracking-tighter truncate max-w-full">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
