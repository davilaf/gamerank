import React, { useState, useMemo } from 'react';
import { Product, Category, ProductVariant } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { StockAlertBadge } from '../inventory/StockAlertBadge';
import { Search, Layers, ShoppingBag, X } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  currency: string;
  onSelectProduct: (product: Product, variant?: ProductVariant) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  currency,
  onSelectProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrado de productos por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.isActive) return false;

      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory;

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.sku && product.sku.toLowerCase().includes(query)) ||
        (product.barcode && product.barcode.includes(query)) ||
        (product.variants &&
          product.variants.some(
            (v) =>
              v.name.toLowerCase().includes(query) ||
              (v.sku && v.sku.toLowerCase().includes(query))
          ));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="flex flex-col h-full space-y-3.5">
      
      {/* Search Bar & Barcode Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar producto por nombre, SKU o código de barras..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Todos ({products.filter((p) => p.isActive).length})
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.isActive && p.categoryId === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h4 className="font-semibold text-gray-700 text-sm">No se encontraron productos</h4>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              Intenta con otro término de búsqueda o cambia de categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.trackStock && product.stockQuantity <= 0;

              return (
                <button
                  key={product.id}
                  disabled={isOutOfStock}
                  onClick={() => onSelectProduct(product)}
                  className={`group flex flex-col justify-between bg-white rounded-2xl border text-left p-3 transition-all relative overflow-hidden ${
                    isOutOfStock
                      ? 'border-gray-200 opacity-60 cursor-not-allowed bg-gray-50'
                      : 'border-gray-200/80 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                  }`}
                >
                  {/* Top: Image & Badge */}
                  <div>
                    <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      {/* Variant badge overlay */}
                      {product.hasVariants && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-900/80 text-white backdrop-blur-xs">
                          <Layers className="w-3 h-3" />
                          Variantes
                        </span>
                      )}
                    </div>

                    {/* Product Name & SKU */}
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="text-[11px] text-gray-400 truncate mb-1">SKU: {product.sku}</p>
                    )}
                  </div>

                  {/* Bottom: Stock & Price */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <StockAlertBadge
                      stockQuantity={product.stockQuantity}
                      minStockAlert={product.minStockAlert}
                      trackStock={product.trackStock}
                    />
                    <div className="font-extrabold text-base text-indigo-600">
                      {product.hasVariants && product.variants && product.variants.length > 0
                        ? `Desde ${formatCurrency(
                            Math.min(...product.variants.map((v) => v.price)),
                            currency
                          )}`
                        : formatCurrency(product.basePrice, currency)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
