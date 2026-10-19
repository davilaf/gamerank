import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncService } from '../db/syncService';
import { Product, ProductVariant, Category, CartItem, StoreSettings } from '../types';
import { formatCurrency } from '../utils/currency';
import { generateCatalogOrderWhatsAppLink } from '../utils/whatsapp';
import { VariantPickerModal } from '../components/pos/VariantPickerModal';
import { StoreLogo } from '../components/common/StoreLogo';
import { 
  ShoppingBag, 
  Store, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Share2, 
  MessageSquare, 
  Layers, 
  Copy, 
  Check, 
  MapPin, 
  Phone, 
  User, 
  X,
  ArrowRight
} from 'lucide-react';

interface PublicCatalogPageProps {
  store: StoreSettings;
  onBackToPOS?: () => void;
}

export const PublicCatalogPage: React.FC<PublicCatalogPageProps> = ({ store, onBackToPOS }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal de variantes para el cliente
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  // Formulario de datos del cliente
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [expandedDescIds, setExpandedDescIds] = useState<Record<string, boolean>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Sincronizar catálogo con la nube en tiempo real al abrir
  useEffect(() => {
    syncService.pullFromCloud();
    syncService.initRealtime();
  }, []);

  // Cargar productos del catálogo público desde IndexedDB
  const products = useLiveQuery(async () => {
    const allProds = await db.products.toArray();
    const prods = allProds.filter((p) => (p.showInCatalog === true || p.showInCatalog === undefined) && p.isActive !== false);
    return Promise.all(
      prods.map(async (p) => {
        if (p.hasVariants) {
          const variants = await db.variants.where('productId').equals(p.id).toArray();
          return { ...p, variants };
        }
        return p;
      })
    );
  }, []) || [];

  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  // Filtrado de catálogo (solo productos activos y con stock disponible)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isActive === false) return false;

      // Filtrar productos agotados: solo mostrar productos con stock disponible
      if (p.trackStock) {
        if (p.hasVariants && p.variants && p.variants.length > 0) {
          // Si tiene variantes, debe tener al menos una variante con stock disponible (> 0)
          const hasInStockVariant = p.variants.some((v) => (v.stockQuantity || 0) > 0);
          if (!hasInStockVariant) return false;
        } else {
          // Producto simple sin variantes
          if ((p.stockQuantity ?? 0) <= 0) return false;
        }
      }

      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Manejo de carrito
  const addToCart = (product: Product, variant?: ProductVariant) => {
    if (product.hasVariants && !variant) {
      setVariantProduct(product);
      return;
    }

    setCartItems((prev) => {
      const lineId = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = prev.find((i) => i.id === lineId);
      const unitPrice = variant ? variant.price : product.basePrice;

      if (existing) {
        return prev.map((i) => (i.id === lineId ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        return [
          ...prev,
          {
            id: lineId,
            productId: product.id,
            variantId: variant?.id,
            productName: product.name,
            variantName: variant?.name,
            unitPrice,
            unitCost: 0,
            quantity: 1,
            imageUrl: product.imageUrl,
            trackStock: product.trackStock,
            maxStock: variant ? variant.stockQuantity : product.stockQuantity
          }
        ];
      }
    });
  };

  const updateQuantity = (lineId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.id === lineId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCopyShareLink = () => {
    const catalogUrl = `${window.location.origin}?mode=catalog&store=${store.slug}`;
    navigator.clipboard.writeText(catalogUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor ingresa tu nombre y teléfono de contacto.');
      return;
    }

    const whatsappLink = generateCatalogOrderWhatsAppLink(cartItems, cartTotal, store, {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
      notes: customerNotes.trim()
    });

    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Top Banner / Store Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <StoreLogo store={store} size="lg" />
            <div>
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest block">
                Catálogo Web Oficial
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">{store.name}</h1>
              {store.address && (
                <p className="text-xs text-indigo-200/90 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{store.address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Share & POS buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyShareLink}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all backdrop-blur-xs"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Compartir Catálogo'}</span>
            </button>

            {onBackToPOS && (
              <button
                onClick={onBackToPOS}
                className="px-3.5 py-2 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-gray-100 transition-all shadow-xs"
              >
                Volver al POS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Catalog Body */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        
        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos en el catálogo..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
              }`}
            >
              Todos los Productos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === c.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700">No hay productos disponibles</h3>
            <p className="text-xs text-gray-400 mt-1">Prueba con otra categoría o búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.trackStock && p.stockQuantity <= 0;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all group"
                >
                  <div>
                    {/* Image - Click to view detail */}
                    <div 
                      onClick={() => setDetailProduct(p)}
                      className="relative aspect-4/3 bg-gray-100 overflow-hidden cursor-pointer"
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      {p.hasVariants && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900/80 text-white backdrop-blur-xs">
                          <Layers className="w-3 h-3" />
                          Variantes
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3 space-y-1">
                      <h3 
                        onClick={() => setDetailProduct(p)}
                        className="font-bold text-gray-900 text-sm sm:text-base leading-snug cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        {p.name}
                      </h3>
                      {p.description && (
                        <div className="pt-0.5">
                          <p className={`text-xs text-gray-600 leading-relaxed ${
                            expandedDescIds[p.id] ? 'whitespace-pre-line' : 'line-clamp-4'
                          }`}>
                            {p.description}
                          </p>
                          {p.description.length > 90 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedDescIds((prev) => ({
                                  ...prev,
                                  [p.id]: !prev[p.id]
                                }));
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline mt-1 block"
                            >
                              {expandedDescIds[p.id] ? '▲ Ver menos' : '▼ Ver más...'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="p-3 pt-0 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase">Precio</div>
                      <div className="font-extrabold text-indigo-600 text-sm sm:text-base">
                        {p.hasVariants && p.variants && p.variants.length > 0
                          ? `Desde ${formatCurrency(Math.min(...p.variants.map((v) => v.price)), store.currency)}`
                          : formatCurrency(p.basePrice, store.currency)}
                      </div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p)}
                      className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 active:scale-95'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Agregar</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-4 rounded-full shadow-2xl shadow-emerald-400 active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {totalCartCount}
              </span>
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-emerald-200">Ver Carrito</div>
              <div className="text-base">{formatCurrency(cartTotal, store.currency)}</div>
            </div>
          </button>
        </div>
      )}

      {/* Slide-over Customer Cart & WhatsApp Order Form */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-base">Mi Carrito de Compras</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 flex items-center justify-between"
                >
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-xs text-gray-900">{item.productName}</h4>
                    {item.variantName && (
                      <span className="text-[11px] font-semibold text-indigo-600">
                        {item.variantName}
                      </span>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatCurrency(item.unitPrice, store.currency)} c/u
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-bold text-xs text-gray-900 w-16 text-right">
                      {formatCurrency(item.unitPrice * item.quantity, store.currency)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Form */}
              <form id="catalogOrderForm" onSubmit={handleSendWhatsAppOrder} className="pt-4 border-t border-gray-200 space-y-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Datos de Envío y Contacto
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Tu Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Tu Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 5512345678"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Dirección de Entrega
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Calle, número, colonia, código postal"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Instrucciones Especiales / Notas
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Instrucciones para el repartidor o detalles..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>

            </div>

            {/* Cart Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-base font-black text-gray-900">
                <span>Total Estimado:</span>
                <span className="text-emerald-600 text-xl">
                  {formatCurrency(cartTotal, store.currency)}
                </span>
              </div>

              <button
                type="submit"
                form="catalogOrderForm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Enviar Pedido por WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Variant Picker Modal for Public Customers */}
      {variantProduct && (
        <VariantPickerModal
          product={variantProduct}
          currency={store.currency}
          onSelectVariant={addToCart}
          onClose={() => setVariantProduct(null)}
        />
      )}

      {/* Full Product Detail Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Image Header */}
            <div className="relative aspect-16/10 bg-gray-100">
              {detailProduct.imageUrl ? (
                <img
                  src={detailProduct.imageUrl}
                  alt={detailProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ShoppingBag className="w-12 h-12" />
                </div>
              )}

              <button
                onClick={() => setDetailProduct(null)}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-xs"
              >
                <X className="w-5 h-5" />
              </button>

              {detailProduct.hasVariants && (
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-900/90 text-white backdrop-blur-xs">
                  <Layers className="w-3.5 h-3.5" />
                  Con Variantes
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900 leading-snug">
                  {detailProduct.name}
                </h3>
                {detailProduct.sku && (
                  <span className="text-xs text-gray-400 font-medium">SKU: {detailProduct.sku}</span>
                )}
              </div>

              {detailProduct.description && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Descripción del Producto
                  </span>
                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {detailProduct.description}
                  </p>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Precio</span>
                  <span className="text-2xl font-black text-indigo-600">
                    {detailProduct.hasVariants && detailProduct.variants && detailProduct.variants.length > 0
                      ? `Desde ${formatCurrency(Math.min(...detailProduct.variants.map((v) => v.price)), store.currency)}`
                      : formatCurrency(detailProduct.basePrice, store.currency)}
                  </span>
                </div>

                <button
                  disabled={detailProduct.trackStock && detailProduct.stockQuantity <= 0}
                  onClick={() => {
                    addToCart(detailProduct);
                    setDetailProduct(null);
                  }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
