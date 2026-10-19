import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant, Category } from '../../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Layers, 
  DollarSign, 
  Package, 
  Tag, 
  Barcode, 
  AlertTriangle, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon 
} from 'lucide-react';

interface ProductFormModalProps {
  productToEdit?: Product | null;
  categories: Category[];
  currency: string;
  onSave: (productData: Partial<Product>, variants: ProductVariant[]) => Promise<void>;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productToEdit,
  categories,
  currency,
  onSave,
  onClose
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [basePrice, setBasePrice] = useState<string>('0');
  const [costPrice, setCostPrice] = useState<string>('0');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [trackStock, setTrackStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState<string>('10');
  const [minStockAlert, setMinStockAlert] = useState<string>('5');
  const [hasVariants, setHasVariants] = useState(false);
  const [showInCatalog, setShowInCatalog] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Variantes
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentEditKey = productToEdit ? productToEdit.id : '__new__';
    if (initializedIdRef.current === currentEditKey) {
      return; // Ya inicializado para este producto. No resetear lo que el usuario está escribiendo.
    }
    initializedIdRef.current = currentEditKey;

    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setCategoryId(productToEdit.categoryId || (categories[0]?.id || ''));
      setImageUrl(productToEdit.imageUrl || '');
      setBasePrice(productToEdit.basePrice?.toString() || '0');
      setCostPrice(productToEdit.costPrice?.toString() || '0');
      setSku(productToEdit.sku || '');
      setBarcode(productToEdit.barcode || '');
      setTrackStock(productToEdit.trackStock ?? true);
      setStockQuantity(productToEdit.stockQuantity?.toString() || '0');
      setMinStockAlert(productToEdit.minStockAlert?.toString() || '5');
      setHasVariants(productToEdit.hasVariants || false);
      setShowInCatalog(productToEdit.showInCatalog ?? true);
      setIsActive(productToEdit.isActive ?? true);
      setVariants(productToEdit.variants ? [...productToEdit.variants] : []);
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setBasePrice('0');
      setCostPrice('0');
      setSku('');
      setBarcode('');
      setTrackStock(true);
      setStockQuantity('10');
      setMinStockAlert('5');
      setHasVariants(false);
      setShowInCatalog(true);
      setIsActive(true);
      setVariants([]);
      if (categories.length > 0) setCategoryId(categories[0].id);
    }
  }, [productToEdit?.id]);

  // Manejador de subida de fotos (JPG, PNG, WebP) con compresión automática a Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen en formato JPG, PNG o WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Image = canvas.toDataURL('image/jpeg', 0.85);
          setImageUrl(base64Image);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: productToEdit?.id || '',
      name: `Variante ${variants.length + 1}`,
      sku: sku ? `${sku}-V${variants.length + 1}` : '',
      price: parseFloat(basePrice) || 0,
      costPrice: parseFloat(costPrice) || 0,
      stockQuantity: 5,
      attributes: {}
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('El nombre del producto es obligatorio.');
      return;
    }

    const parsedBasePrice = parseFloat(basePrice) || 0;
    const parsedCostPrice = parseFloat(costPrice) || 0;
    const parsedStock = hasVariants
      ? variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
      : parseInt(stockQuantity) || 0;
    const parsedMinStock = parseInt(minStockAlert) || 5;

    const productPayload: Partial<Product> = {
      id: productToEdit?.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      description: description.trim(),
      categoryId: categoryId || undefined,
      imageUrl: imageUrl.trim() || undefined,
      hasVariants,
      basePrice: parsedBasePrice,
      costPrice: parsedCostPrice,
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      trackStock,
      stockQuantity: parsedStock,
      minStockAlert: parsedMinStock,
      isActive,
      showInCatalog,
      updatedAt: new Date().toISOString()
    };

    if (!productToEdit) {
      productPayload.createdAt = new Date().toISOString();
    }

    const updatedVariants = variants.map((v) => ({
      ...v,
      productId: productPayload.id!
    }));

    await onSave(productPayload, hasVariants ? updatedVariants : []);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <p className="text-xs text-gray-500">Configura fotos, precios, inventario y variantes</p>
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
          
          {/* General Information */}
          <div className="space-y-3">
            
            {/* Image Upload Box */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Foto del Producto (JPG / PNG)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                id="product-image-file-input"
              />

              {imageUrl ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <img
                    src={imageUrl}
                    alt="Preview producto"
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-2xs shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800 block">Imagen Cargada</span>
                    <span className="text-[11px] text-gray-400 block mb-2">Visible en POS y Catálogo Web</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 text-indigo-700 border border-gray-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Cambiar foto
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-800">
                      Haz clic para subir foto del producto
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      Formatos soportados: JPG, PNG, WebP
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{showUrlInput ? 'Ocultar campo de URL' : 'O pegar enlace web (URL)'}</span>
                    </button>
                  </div>

                  {showUrlInput && (
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Camiseta Algodón Cuello V"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">Sin Categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  SKU (Código único)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU-001"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles sobre materiales, tamaño, preparación..."
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Pricing & Barcodes */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Precios y Código de Barras
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Precio Venta ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Costo Compra ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="7501234..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Stock Controls */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Control de Stock e Inventario
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackStock}
                  onChange={(e) => setTrackStock(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">Controlar existencias</span>
              </label>
            </div>

            {trackStock && !hasVariants && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Cantidad Actual en Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Alerta de Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-amber-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Variants Matrix Builder */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Variantes de Producto (Tallas, Colores, etc.)
                </span>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => {
                    setHasVariants(e.target.checked);
                    if (e.target.checked && variants.length === 0) {
                      handleAddVariant();
                    }
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">Tiene variantes</span>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-2.5 pt-2">
                {variants.map((v, idx) => (
                  <div
                    key={v.id}
                    className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                        placeholder="Ej. Talla M / Rojo"
                        className="font-bold text-xs text-gray-900 border-b border-gray-200 focus:border-indigo-600 focus:outline-hidden flex-1 mr-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Precio ({currency})</span>
                        <input
                          type="number"
                          step="0.01"
                          value={v.price}
                          onChange={(e) =>
                            handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg font-bold text-indigo-600"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block">Stock</span>
                        <input
                          type="number"
                          value={v.stockQuantity}
                          onChange={(e) =>
                            handleUpdateVariant(idx, 'stockQuantity', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-800"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block">SKU</span>
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                          placeholder="SKU-VAR"
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg uppercase"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar otra variante</span>
                </button>
              </div>
            )}
          </div>

          {/* Visibility switches */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInCatalog}
                onChange={(e) => setShowInCatalog(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-gray-700">Mostrar en catálogo público</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-gray-700">Producto activo</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all"
            >
              {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
