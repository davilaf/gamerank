import React, { useState, useRef } from 'react';
import { db } from '../../db';
import { StoreSettings } from '../../types';
import { STORE_ICONS, StoreLogo } from '../common/StoreLogo';
import { getStoredCloudConfig, saveCloudConfig } from '../../db/supabaseClient';
import { syncService, SUPABASE_SQL_SCHEMA } from '../../db/syncService';
import { 
  X, 
  Store, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Phone, 
  MapPin, 
  Receipt, 
  Check, 
  Palette,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Download,
  UploadCloud,
  Database,
  Cloud,
  CloudLightning,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface StoreSettingsModalProps {
  settings: StoreSettings;
  onSave: (newSettings: StoreSettings) => Promise<void>;
  onClose: () => void;
}

const COLOR_GRADIENTS = [
  { id: 'from-indigo-600 to-indigo-500', name: 'Índigo', hex: '#4f46e5' },
  { id: 'from-blue-600 to-cyan-500', name: 'Azul Océano', hex: '#2563eb' },
  { id: 'from-emerald-600 to-teal-500', name: 'Esmeralda', hex: '#059669' },
  { id: 'from-amber-500 to-orange-500', name: 'Ámbar', hex: '#d97706' },
  { id: 'from-rose-600 to-pink-500', name: 'Rosa / Coral', hex: '#e11d48' },
  { id: 'from-purple-600 to-violet-500', name: 'Púrpura', hex: '#7c3aed' },
  { id: 'from-gray-900 to-gray-700', name: 'Negro Elegante', hex: '#111827' },
];

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  settings,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(settings.name);
  const [slug, setSlug] = useState(settings.slug);
  const [phoneWhatsApp, setPhoneWhatsApp] = useState(settings.phoneWhatsApp);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [address, setAddress] = useState(settings.address || '');
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader || '');
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || '');
  
  // Logo e Icono
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || '');
  const [storeIcon, setStoreIcon] = useState<string>(settings.storeIcon || 'store');
  const [themeColor, setThemeColor] = useState<string>(settings.themeColor || 'from-indigo-600 to-indigo-500');

  // Credenciales de acceso
  const [adminUsername, setAdminUsername] = useState<string>(settings.adminUsername || 'admin');
  const [adminPassword, setAdminPassword] = useState<string>(settings.adminPassword || '123');
  const [showAdminPass, setShowAdminPass] = useState<boolean>(false);

  // Configuración de Supabase Cloud
  const initialCloud = getStoredCloudConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCloud.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCloud.anonKey);
  const [isCloudEnabled, setIsCloudEnabled] = useState(initialCloud.enabled);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejador de subida de imagen (Convierte a Base64 y optimiza)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP).');
      return;
    }

    // Comprimir/redimensionar la imagen antes de guardarla en base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300; // 300x300px es ideal y liviano para IndexedDB
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/png', 0.85);
          setLogoUrl(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const backupInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: await db.settings.toArray(),
        categories: await db.categories.toArray(),
        products: await db.products.toArray(),
        variants: await db.variants.toArray(),
        orders: await db.orders.toArray(),
        orderItems: await db.orderItems.toArray(),
        cashMovements: await db.cashMovements.toArray(),
        customers: await db.customers.toArray(),
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fd_pos_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar la copia de seguridad.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('¿Deseas restaurar esta copia de seguridad? Se importarán todos los productos, categorías y configuraciones del archivo.')) {
      if (backupInputRef.current) backupInputRef.current.value = '';
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      let backup: any;
      try {
        backup = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('El archivo seleccionado no tiene formato JSON válido. Por favor selecciona el archivo de copia de seguridad (.json) que descargaste previamente.');
      }

      if (!backup || typeof backup !== 'object') {
        throw new Error('Formato de copia de seguridad no reconocido.');
      }

      if (backup.settings && Array.isArray(backup.settings) && backup.settings.length > 0) {
        await db.settings.clear();
        await db.settings.bulkPut(backup.settings);
      }
      if (backup.categories && Array.isArray(backup.categories) && backup.categories.length > 0) {
        await db.categories.clear();
        await db.categories.bulkPut(backup.categories);
      }
      if (backup.products && Array.isArray(backup.products) && backup.products.length > 0) {
        await db.products.clear();
        await db.products.bulkPut(backup.products);
      }
      if (backup.variants && Array.isArray(backup.variants) && backup.variants.length > 0) {
        await db.variants.clear();
        await db.variants.bulkPut(backup.variants);
      }
      if (backup.orders && Array.isArray(backup.orders) && backup.orders.length > 0) {
        await db.orders.bulkPut(backup.orders);
      }
      if (backup.orderItems && Array.isArray(backup.orderItems) && backup.orderItems.length > 0) {
        await db.orderItems.bulkPut(backup.orderItems);
      }
      if (backup.cashMovements && Array.isArray(backup.cashMovements) && backup.cashMovements.length > 0) {
        await db.cashMovements.bulkPut(backup.cashMovements);
      }
      if (backup.customers && Array.isArray(backup.customers) && backup.customers.length > 0) {
        await db.customers.bulkPut(backup.customers);
      }

      // Subir automáticamente todos los datos restaurados a Supabase
      try {
        await syncService.uploadAllLocalDataToCloud();
      } catch (uploadErr) {
        console.warn('Error subiendo a Supabase tras restaurar:', uploadErr);
      }

      alert('¡Copia de seguridad restaurada y sincronizada con la nube con éxito!');
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(`Error al importar: ${err?.message || 'Asegúrate de que sea un archivo .json válido.'}`);
    } finally {
      setIsImporting(false);
      if (backupInputRef.current) backupInputRef.current.value = '';
    }
  };

  const handleForcePullCloud = async () => {
    setIsTestingCloud(true);
    setCloudMessage(null);
    try {
      const success = await syncService.pullFromCloud();
      if (success) {
        setCloudMessage({ success: true, text: '¡Datos actualizados desde la nube exitosamente!' });
        setTimeout(() => window.location.reload(), 800);
      } else {
        setCloudMessage({ success: false, text: 'No se pudo descargar de la nube. Verifica la conexión a internet.' });
      }
    } catch (e: any) {
      setCloudMessage({ success: false, text: `Error al descargar: ${e?.message || 'Error desconocido'}` });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleSaveAndTestCloud = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setCloudMessage({ success: false, text: 'Ingresa la URL y la Anon Key de tu proyecto de Supabase.' });
      return;
    }

    saveCloudConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim(),
      enabled: true
    });
    setIsCloudEnabled(true);
    setIsTestingCloud(true);
    setCloudMessage(null);

    try {
      const success = await syncService.pullFromCloud();
      if (success) {
        setCloudMessage({ success: true, text: '¡Conexión exitosa con Supabase! La sincronización automática en la nube está activa.' });
        syncService.initRealtime();
      } else {
        setCloudMessage({
          success: false,
          text: 'Se guardaron las credenciales, pero las tablas aún no existen en Supabase. Asegúrate de ejecutar el Script SQL en tu panel de Supabase.'
        });
      }
    } catch (err: any) {
      setCloudMessage({ success: false, text: `Error de conexión: ${err?.message || 'Verifica la URL y la clave.'}` });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleUploadLocalToCloud = async () => {
    if (!confirm('¿Deseas subir todos tus productos, categorías y configuraciones de esta computadora a la nube de Supabase? Esto permitirá que aparezcan en tu celular y en el catálogo web público de inmediato.')) {
      return;
    }

    setIsUploadingToCloud(true);
    setCloudMessage(null);

    const res = await syncService.uploadAllLocalDataToCloud();
    setCloudMessage({ success: res.success, text: res.message });
    setIsUploadingToCloud(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('El nombre del negocio es obligatorio.');
      return;
    }

    const updated: StoreSettings = {
      ...settings,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      phoneWhatsApp: phoneWhatsApp.trim(),
      currency: currency.trim() || '$',
      taxRate: parseFloat(taxRate) || 0,
      address: address.trim(),
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
      logoUrl: logoUrl.trim() || undefined,
      storeIcon,
      themeColor,
      adminUsername: adminUsername.trim() || 'admin',
      adminPassword: adminPassword.trim() || '123'
    };

    await onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <StoreLogo store={{ logoUrl, storeIcon, themeColor, name }} size="md" />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Ajustes del Negocio</h3>
              <p className="text-xs text-gray-500">Logo, nombre, tickets e impuestos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Logo Upload & Custom Icon Section */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Logo o Ícono del Negocio
              </span>
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar foto</span>
                </button>
              )}
            </div>

            {/* Current preview & Upload Button */}
            <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <StoreLogo store={{ logoUrl, storeIcon, themeColor, name }} size="lg" />
              
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  id="store-logo-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{logoUrl ? 'Cambiar imagen...' : 'Subir imagen / logo...'}</span>
                </button>
                <p className="text-[11px] text-gray-400 mt-1">
                  Recomendado: PNG o JPG cuadrado.
                </p>
              </div>
            </div>

            {/* If no custom image, allow selecting vector icon & theme gradient */}
            {!logoUrl && (
              <div className="space-y-3 pt-2 border-t border-gray-200/60">
                <div>
                  <span className="text-[11px] font-bold text-gray-600 block mb-1.5">
                    O elige un ícono predeterminado:
                  </span>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Object.keys(STORE_ICONS).map((key) => {
                      const Icon = STORE_ICONS[key];
                      const isSelected = storeIcon === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setStoreIcon(key)}
                          className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-600 block mb-1.5">
                    Color de fondo del ícono:
                  </span>
                  <div className="flex items-center space-x-2">
                    {COLOR_GRADIENTS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setThemeColor(color.id)}
                        title={color.name}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          themeColor === color.id ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Business Info */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nombre de la Tienda / Negocio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                WhatsApp del Negocio *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value)}
                  placeholder="+5215512345678"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Símbolo de Moneda
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="$"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tasa de Impuesto / IVA (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Dirección Física
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Juárez 100, Col. Centro"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Ticket Header & Footer */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Personalización de Recibos Térmicos y WhatsApp
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Encabezado adicional del ticket (RFC, Lema, etc.)
              </label>
              <textarea
                rows={2}
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                placeholder="¡Gracias por tu compra!\nRFC: AAA010101AAA"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Pie de página del ticket (Políticas de devolución, agradecimiento)
              </label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                placeholder="Cambios válidos con ticket dentro de 30 días."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Security & Access Credentials */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Seguridad y Contraseña del Administrador</span>
            </div>
            <p className="text-[11px] text-indigo-900/80">
              Estas credenciales protegerán tu panel de ventas, inventario y finanzas contra accesos no autorizados. El catálogo para clientes seguirá siendo libre y público.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Usuario Administrador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-8 pr-8 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Database Migration Block */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Copia de Seguridad y Migración de Datos</span>
            </div>
            <p className="text-[11px] text-emerald-900/80">
              Descarga una copia completa de tus productos, fotos, inventario y ventas en un archivo JSON para respaldar o transferir a Netlify / otro dispositivo.
            </p>

            <input
              type="file"
              ref={backupInputRef}
              onChange={handleImportBackup}
              accept=".json,application/json"
              className="hidden"
              id="backup-file-input"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportBackup}
                className="py-2.5 px-3 bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors active:scale-95"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{isExporting ? 'Generando...' : 'Descargar Copia (.json)'}</span>
              </button>

              <button
                type="button"
                disabled={isImporting}
                onClick={() => backupInputRef.current?.click()}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-all active:scale-95"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isImporting ? 'Restaurando...' : 'Restaurar Copia de Seguridad'}</span>
              </button>
            </div>
          </div>

          {/* Cloud Database (Supabase) Block */}
          <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-950 font-bold text-xs uppercase tracking-wider">
                <Cloud className="w-4 h-4 text-sky-600" />
                <span>Base de Datos en la Nube (Supabase Gratuito)</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCloudEnabled && supabaseUrl
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {isCloudEnabled && supabaseUrl ? '● Nube Conectada' : '○ No Configurado'}
              </span>
            </div>

            <p className="text-[11px] text-sky-900/80 leading-relaxed">
              Conecta tu proyecto gratuito de <strong>Supabase</strong> para que cualquier producto que crees en tu PC se actualice automáticamente en tu celular y en el catálogo web público de Netlify en tiempo real.
            </p>

            {cloudMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                cloudMessage.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${cloudMessage.success ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span>{cloudMessage.text}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzabcdefghijklm.supabase.co"
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Supabase Anon Key (Public API Key)
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Cloud Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  disabled={isTestingCloud}
                  onClick={handleSaveAndTestCloud}
                  className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
                  <span>{isTestingCloud ? 'Conectando...' : 'Guardar y Probar'}</span>
                </button>

                <button
                  type="button"
                  disabled={isTestingCloud}
                  onClick={handleForcePullCloud}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Nube</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="py-2 px-3 bg-white hover:bg-sky-100/70 text-sky-800 border border-sky-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-600" />
                  <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                </button>

                <button
                  type="button"
                  disabled={isUploadingToCloud || !supabaseUrl}
                  onClick={handleUploadLocalToCloud}
                  className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <CloudLightning className="w-3.5 h-3.5" />
                  <span>{isUploadingToCloud ? 'Subiendo...' : 'Subir a Nube'}</span>
                </button>
              </div>

              {/* Toggle SQL schema display */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSqlSchema(!showSqlSchema)}
                  className="text-[11px] text-sky-700 hover:underline font-semibold"
                >
                  {showSqlSchema ? '▲ Ocultar Script SQL' : '▼ Ver Script SQL para crear las tablas en Supabase'}
                </button>

                {showSqlSchema && (
                  <div className="mt-2 p-3 bg-gray-900 text-green-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48">
                    <pre>{SUPABASE_SQL_SCHEMA}</pre>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Backup & Database Migration Block */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
