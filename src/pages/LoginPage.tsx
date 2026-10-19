import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { StoreLogo } from '../components/common/StoreLogo';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  ExternalLink,
  Store
} from 'lucide-react';

interface LoginPageProps {
  store: StoreSettings;
  onLoginSuccess: () => void;
  onGoToCatalog: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  store,
  onLoginSuccess,
  onGoToCatalog
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const expectedUsername = store.adminUsername || 'admin';
  const expectedPassword = store.adminPassword || '123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    if (cleanUser === expectedUsername && cleanPass === expectedPassword) {
      if (rememberMe) {
        localStorage.setItem('fd_pos_auth_session', JSON.stringify({
          authenticated: true,
          username: cleanUser,
          timestamp: Date.now()
        }));
      } else {
        sessionStorage.setItem('fd_pos_auth_session', JSON.stringify({
          authenticated: true,
          username: cleanUser,
          timestamp: Date.now()
        }));
      }
      onLoginSuccess();
    } else {
      setErrorMsg('Usuario o contraseña incorrectos. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      
      {/* Container */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header with Store Branding */}
        <div className="bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-800 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex justify-center mb-3">
            <StoreLogo store={store} size="xl" className="border-2 border-white/40 shadow-lg" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">{store.name}</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold text-indigo-100 mt-2 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso Seguro de Administración</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in shake duration-150">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-600">Mantener sesión iniciada</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 text-sm transition-all active:scale-[0.99] mt-2"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Public Customer Catalog Direct Link */}
          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2.5">¿Eres un cliente o buscas ver los productos?</p>
            <button
              type="button"
              onClick={onGoToCatalog}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200/80 flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Ver Catálogo Web Público (Sin Contraseña)</span>
            </button>
          </div>

          {/* Default hint */}
          {expectedUsername === 'admin' && expectedPassword === '123' && (
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-center text-[11px] text-gray-500">
              💡 <strong>Credenciales de fábrica:</strong> Usuario: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-800">admin</code> / Contraseña: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-800">123</code>
              <br />
              <span className="text-[10px] text-gray-400">Puedes cambiarlas cuando quieras en Ajustes ⚙️.</span>
            </div>
          )}

        </div>

      </div>

      <div className="text-center text-xs text-indigo-300/80 mt-6 flex items-center gap-1">
        <Store className="w-3.5 h-3.5" />
        <span>FD POS PWA — Sistema Offline-First Seguro</span>
      </div>

    </div>
  );
};
