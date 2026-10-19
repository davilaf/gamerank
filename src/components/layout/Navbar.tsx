import React from 'react';
import { 
  Store, 
  ShoppingBag, 
  Package, 
  History, 
  DollarSign, 
  BarChart3, 
  ExternalLink, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { StoreLogo } from '../common/StoreLogo';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  store: StoreSettings;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  store,
  onOpenSettings,
  onLogout
}) => {
  const { isOnline, isSyncing, pendingCount, triggerManualSync } = useNetworkStatus();

  const navItems = [
    { id: 'pos', label: 'Venta (POS)', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'sales', label: 'Historial', icon: History },
    { id: 'cashflow', label: 'Caja & Gastos', icon: DollarSign },
    { id: 'dashboard', label: 'Métricas', icon: BarChart3 },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Store Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('pos')}>
            <StoreLogo store={store} size="md" />
            <div>
              <div className="font-bold text-gray-900 leading-tight text-base sm:text-lg flex items-center gap-1.5">
                {store.name}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>FD POS PWA</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right actions: Online/Offline Badge, Public Catalog, Settings */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Sync & Network status badge */}
            <button
              onClick={triggerManualSync}
              title={isOnline ? 'En línea. Clic para sincronizar' : 'Modo Offline activado'}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                isOnline
                  ? pendingCount > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              )}
              <span className="hidden sm:inline">
                {isOnline ? (pendingCount > 0 ? `${pendingCount} pendiente(s)` : 'Online') : 'Offline'}
              </span>
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-gray-400'}`}
              />
            </button>

            {/* Public Catalog Link */}
            <button
              onClick={() => setCurrentTab('catalog')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200"
              title="Abrir Catálogo Web Público"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catálogo Web</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configuración de la Tienda"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Bloquear / Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
