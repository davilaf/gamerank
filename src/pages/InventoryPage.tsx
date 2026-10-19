import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncService } from '../db/syncService';
import { Product, ProductVariant, Category, StoreSettings } from '../types';
import { formatCurrency } from '../utils/currency';
import { StockAlertBadge } from '../components/inventory/StockAlertBadge';
import { ProductFormModal } from '../components/inventory/ProductFormModal';
import { CategoryManagerModal } from '../components/inventory/CategoryManagerModal';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  ChevronDown, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface InventoryPageProps {
  store: StoreSettings;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ store }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

  // Cargar productos y categorías desde IndexedDB
  const products = useLiveQuery(async () => {
    const prods = await db.products.toArray();
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

  // Métricas del inventario
  const metrics = useMemo(() => {
    let totalStockUnits = 0;
    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      if (p.trackStock) {
        totalStockUnits += p.stockQuantity;
        inventoryCostValue += (p.costPrice || 0) * p.stockQuantity;
        inventoryRetailValue += p.basePrice * p.stockQuantity;
        if (p.stockQuantity <= p.minStockAlert) {
          lowStockCount++;
        }
      }
    });

    return {
      totalProducts: products.length,
      totalStockUnits,
      inventoryCostValue,
      inventoryRetailValue,
      lowStockCount
    };
  }, [products]);

  // Filtrado
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.barcode && p.barcode.includes(query));

      const matchesLowStock = !showLowStockOnly || (p.trackStock && p.stockQuantity <= p.minStockAlert);

      return matchesCategory && matchesSearch && matchesLowStock;
    });
  }, [products, selectedCategory, searchTerm, showLowStockOnly]);

  // Ajuste rápido de stock (+ / -)
  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stockQuantity + delta);
    await db.products.update(product.id, {
      stockQuantity: newStock,
      updatedAt: new Date().toISOString()
    });
    await syncService.enqueueMutation('products', 'UPDATE', product.id, {
      stockQuantity: newStock
    });
  };

  const handleQuickVariantStockAdjust = async (variant: ProductVariant, delta: number, product: Product) => {
    const newVarStock = Math.max(0, variant.stockQuantity + delta);
    await db.variants.update(variant.id, { stockQuantity: newVarStock });

    // Actualizar consolidado padre
    const updatedVariants = await db.variants.where('productId').equals(product.id).toArray();
    const newTotalStock = updatedVariants.reduce((sum, v) => sum + (v.id === variant.id ? newVarStock : v.stockQuantity), 0);

    await db.products.update(product.id, { stockQuantity: newTotalStock, updatedAt: new Date().toISOString() });
    await syncService.enqueueMutation('variants', 'UPDATE', variant.id, { stockQuantity: newVarStock });
    await syncService.enqueueMutation('products', 'UPDATE', product.id, { stockQuantity: newTotalStock });
  };

  // Guardar creación o edición
  const handleSaveProduct = async (productData: Partial<Product>, variants: ProductVariant[]) => {
    const isNew = !products.some((p) => p.id === productData.id);

    if (isNew) {
      await db.products.add(productData as Product);
      if (variants.length > 0) {
        await db.variants.bulkAdd(variants);
      }
      await syncService.enqueueMutation('products', 'INSERT', productData.id!, {
        product: productData,
        variants
      });
    } else {
      await db.products.update(productData.id!, productData);
      // Actualizar variantes
      await db.variants.where('productId').equals(productData.id!).delete();
      if (variants.length > 0) {
        await db.variants.bulkAdd(variants);
      }
      await syncService.enqueueMutation('products', 'UPDATE', productData.id!, {
        product: productData,
        variants
      });
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar "${name}" del inventario?`)) {
      await db.products.delete(id);
      await db.variants.where('productId').equals(id).delete();
      await syncService.enqueueMutation('products', 'DELETE', id, { id });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProductIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-24 md:pb-8">
      
      {/* Top Header & New Product Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            <span>Control de Inventario y Stock</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Administra existencias, variantes, alertas de stock mínimo y precios
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-gray-100 text-gray-700 font-bold px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-2xs transition-all active:scale-[0.98] text-xs sm:text-sm"
          >
            <Tag className="w-4 h-4 text-indigo-600" />
            <span>Categorías</span>
          </button>

          <button
            onClick={() => {
              setProductToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-[0.98] text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Total Productos</span>
            <Package className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.totalProducts}</div>
          <div className="text-[11px] text-gray-400 mt-1">{metrics.totalStockUnits} unidades totales</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Alertas Stock Bajo</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-black ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {metrics.lowStockCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Por debajo del umbral</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Valor al Costo</span>
            <DollarSign className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 truncate">
            {formatCurrency(metrics.inventoryCostValue, store.currency)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Capital invertido</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Valor en Venta</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 truncate">
            {formatCurrency(metrics.inventoryRetailValue, store.currency)}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Potencial bruto</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, SKU o código..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle Button */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              showLowStockOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Solo Stock Bajo ({metrics.lowStockCount})</span>
          </button>

        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precio Venta</th>
                <th className="py-3.5 px-4">Costo</th>
                <th className="py-3.5 px-4">Existencias</th>
                <th className="py-3.5 px-4">Ajuste Rápido</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isExpanded = expandedProductIds[product.id];
                  const categoryObj = categories.find((c) => c.id === product.categoryId);

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-gray-50/70 transition-colors">
                        
                        {/* Name & Thumb */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {product.hasVariants && (
                              <button
                                onClick={() => toggleExpand(product.id)}
                                className="text-gray-400 hover:text-indigo-600 p-0.5"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}

                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}

                            <div>
                              <div className="font-bold text-gray-900">{product.name}</div>
                              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                {product.sku && <span>SKU: {product.sku}</span>}
                                {product.hasVariants && (
                                  <span className="inline-flex items-center gap-0.5 text-indigo-600 font-semibold">
                                    <Layers className="w-3 h-3" />
                                    {product.variants?.length || 0} variantes
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          {categoryObj ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                              {categoryObj.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Retail Price */}
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {formatCurrency(product.basePrice, store.currency)}
                        </td>

                        {/* Cost Price */}
                        <td className="py-3 px-4 text-gray-500">
                          {product.costPrice ? formatCurrency(product.costPrice, store.currency) : '-'}
                        </td>

                        {/* Stock status badge */}
                        <td className="py-3 px-4">
                          <StockAlertBadge
                            stockQuantity={product.stockQuantity}
                            minStockAlert={product.minStockAlert}
                            trackStock={product.trackStock}
                          />
                        </td>

                        {/* Quick stock stepper buttons */}
                        <td className="py-3 px-4">
                          {product.trackStock && !product.hasVariants && (
                            <div className="inline-flex items-center space-x-1 bg-gray-100 p-0.5 rounded-lg">
                              <button
                                onClick={() => handleQuickStockAdjust(product, -1)}
                                className="w-6 h-6 rounded bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-bold flex items-center justify-center shadow-2xs"
                                title="Descontar 1 unidad"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-xs">
                                {product.stockQuantity}
                              </span>
                              <button
                                onClick={() => handleQuickStockAdjust(product, 1)}
                                className="w-6 h-6 rounded bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 font-bold flex items-center justify-center shadow-2xs"
                                title="Añadir 1 unidad"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setProductToEdit(product);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar producto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>

                      {/* Nested Variants Breakdown */}
                      {product.hasVariants && isExpanded && product.variants && (
                        <tr className="bg-indigo-50/30">
                          <td colSpan={7} className="p-3 pl-12">
                            <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-2xs space-y-2">
                              <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                                Variantes de {product.name}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {product.variants.map((v) => (
                                  <div
                                    key={v.id}
                                    className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <div className="font-bold text-gray-900">{v.name}</div>
                                      <div className="text-gray-400 text-[10px]">
                                        SKU: {v.sku || 'N/A'}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-indigo-600">
                                        {formatCurrency(v.price, store.currency)}
                                      </span>
                                      <div className="inline-flex items-center space-x-1 bg-white border border-gray-200 rounded p-0.5">
                                        <button
                                          onClick={() => handleQuickVariantStockAdjust(v, -1, product)}
                                          className="w-5 h-5 rounded hover:bg-gray-100 font-bold"
                                        >
                                          -
                                        </button>
                                        <span className="w-5 text-center font-bold text-[11px]">
                                          {v.stockQuantity}
                                        </span>
                                        <button
                                          onClick={() => handleQuickVariantStockAdjust(v, 1, product)}
                                          className="w-5 h-5 rounded hover:bg-gray-100 font-bold"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {isFormModalOpen && (
        <ProductFormModal
          productToEdit={productToEdit}
          categories={categories}
          currency={store.currency}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsFormModalOpen(false);
            setProductToEdit(null);
          }}
        />
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <CategoryManagerModal
          categories={categories}
          products={products}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}

    </div>
  );
};
