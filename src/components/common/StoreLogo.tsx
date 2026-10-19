import React from 'react';
import { 
  Store, 
  ShoppingBag, 
  Coffee, 
  Utensils, 
  Sparkles, 
  Shirt, 
  Scissors, 
  Zap, 
  Heart, 
  Gift, 
  Tag,
  Flame,
  Award,
  Cake
} from 'lucide-react';
import { StoreSettings } from '../../types';

export const STORE_ICONS: Record<string, any> = {
  store: Store,
  shopping: ShoppingBag,
  coffee: Coffee,
  restaurant: Utensils,
  beauty: Sparkles,
  clothing: Shirt,
  barber: Scissors,
  tech: Zap,
  health: Heart,
  gift: Gift,
  tag: Tag,
  flame: Flame,
  award: Award,
  cake: Cake
};

interface StoreLogoProps {
  store: Partial<StoreSettings>;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const StoreLogo: React.FC<StoreLogoProps> = ({ 
  store, 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10'
  };

  // Si tiene un logo personalizado subido (imagen o Base64)
  if (store.logoUrl) {
    return (
      <img
        src={store.logoUrl}
        alt={store.name || 'Logo del negocio'}
        className={`${sizeClasses[size]} object-cover border border-gray-200/80 shadow-xs ${className}`}
      />
    );
  }

  // Si no tiene logo de imagen, usar el icono seleccionado o el Store por defecto
  const iconKey = store.storeIcon || 'store';
  const IconComponent = STORE_ICONS[iconKey] || Store;
  const themeColor = store.themeColor || 'from-indigo-600 to-indigo-500';

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-tr ${themeColor} flex items-center justify-center text-white shadow-md shadow-indigo-100/50 ${className}`}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
};
