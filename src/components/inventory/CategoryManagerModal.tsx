import React, { useState } from 'react';
import { db } from '../../db';
import { syncService } from '../../db/syncService';
import { Category, Product } from '../../types';
import { X, Plus, Edit2, Trash2, Tag, Check, Palette, AlertCircle } from 'lucide-react';

interface CategoryManagerModalProps {
  categories: Category[];
  products: Product[];
  onClose: () => void;
}

const PRESET_COLORS = [
  { hex: '#6366f1', name: 'Índigo' },
  { hex: '#10b981', name: 'Esmeralda' },
  { hex: '#f59e0b', name: 'Ámbar' },
  { hex: '#ec4899', name: 'Rosa' },
  { hex: '#ef4444', name: 'Rojo' },
  { hex: '#8b5cf6', name: 'Púrpura' },
  { hex: '#06b6d4', name: 'Cian' },
  { hex: '#3b82f6', name: 'Azul' },
  { hex: '#64748b', name: 'Pizarra' },
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  products,
  onClose
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const startCreate = () => {
    setEditingCategory(null);
    setName('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex);
    setIsCreatingNew(true);
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color || '#6366f1');
    setIsCreatingNew(false);
  };

  const cancelForm = () => {
    setEditingCategory(null);
    setIsCreatingNew(false);
    setName('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('El nombre de la categoría no puede estar vacío.');
      return;
    }

    if (editingCategory) {
      // Editar categoría existente
      await db.categories.update(editingCategory.id, {
        name: name.trim(),
        color
      });
      await syncService.enqueueMutation('categories', 'UPDATE', editingCategory.id, {
        name: name.trim(),
        color
      });
    } else {
      // Crear nueva categoría
      const newCat: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: name.trim(),
        color,
        createdAt: new Date().toISOString()
      };
      await db.categories.add(newCat);
      await syncService.enqueueMutation('categories', 'INSERT', newCat.id, newCat);
    }

    cancelForm();
  };

  const handleDelete = async (category: Category) => {
    const productCount = products.filter((p) => p.categoryId === category.id).length;
    const confirmMsg = productCount > 0
      ? `¿Estás seguro de eliminar la categoría "${category.name}"?\n\n${productCount} producto(s) quedarán en "Sin Categoría".`
      : `¿Estás seguro de eliminar la categoría "${category.name}"?`;

    if (confirm(confirmMsg)) {
      // Desasociar productos de esta categoría en IndexedDB
      const matchingProds = await db.products.where('categoryId').equals(category.id).toArray();
      for (const p of matchingProds) {
        await db.products.update(p.id, { categoryId: undefined });
      }

      // Eliminar categoría
      await db.categories.delete(category.id);
      await syncService.enqueueMutation('categories', 'DELETE', category.id, { id: category.id });

      if (editingCategory?.id === category.id) {
        cancelForm();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Administrar Categorías</h3>
              <p className="text-xs text-gray-500">Crea, edita o elimina las categorías de tu tienda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Action to create or form */}
          {!isCreatingNew && !editingCategory ? (
            <button
              onClick={startCreate}
              className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 border border-indigo-200/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nueva Categoría</span>
            </button>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  {editingCategory ? `Editar "${editingCategory.name}"` : 'Nueva Categoría'}
                </span>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Bebidas Calientes, Ropa de Invierno..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Color Picker Palette */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-gray-500" />
                  <span>Color Distintivo:</span>
                </label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      title={c.name}
                      className={`w-7 h-7 rounded-full transition-transform shrink-0 flex items-center justify-center ${
                        color === c.hex ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {color === c.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Guardar Cambios' : 'Crear'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Categorías Existentes ({categories.length})
            </span>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                No tienes categorías registradas aún.
              </div>
            ) : (
              categories.map((category) => {
                const count = products.filter((p) => p.categoryId === category.id).length;
                const isSelectedForEdit = editingCategory?.id === category.id;

                return (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isSelectedForEdit
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-2xs shrink-0"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      <div>
                        <span className="font-bold text-sm text-gray-900 leading-tight">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          {count} {count === 1 ? 'producto' : 'productos'} asociados
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Editar nombre o color"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
