import { useState, useMemo } from 'react';
import { Product, ProductVariant, CartItem, DiscountType, Customer } from '../types';

export function usePOSCart(taxRate: number = 0) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [customer, setCustomer] = useState<{ id?: string; name: string; phone?: string }>({
    name: '',
    phone: ''
  });
  const [notes, setNotes] = useState<string>('');

  // Agregar producto o variante al carrito
  const addItem = (product: Product, variant?: ProductVariant) => {
    setItems((prevItems) => {
      const lineId = variant ? `${product.id}-${variant.id}` : product.id;
      const existingIndex = prevItems.findIndex((item) => item.id === lineId);

      const unitPrice = variant ? variant.price : product.basePrice;
      const unitCost = (variant ? variant.costPrice : product.costPrice) || 0;
      const maxStock = variant ? variant.stockQuantity : product.stockQuantity;
      const trackStock = product.trackStock;

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        if (trackStock && currentQty >= maxStock) {
          alert(`¡Stock máximo alcanzado (${maxStock} unidades disponibles)!`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + 1
        };
        return updated;
      } else {
        if (trackStock && maxStock <= 0) {
          alert('¡Este producto no tiene stock disponible!');
          return prevItems;
        }

        const newItem: CartItem = {
          id: lineId,
          productId: product.id,
          variantId: variant?.id,
          productName: product.name,
          variantName: variant?.name,
          unitPrice,
          unitCost,
          quantity: 1,
          imageUrl: product.imageUrl,
          trackStock,
          maxStock
        };
        return [...prevItems, newItem];
      }
    });
  };

  // Modificar cantidad
  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          if (item.trackStock && newQty > item.maxStock) {
            alert(`Stock máximo disponible: ${item.maxStock}`);
            return { ...item, quantity: item.maxStock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Eliminar un item del carrito
  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Limpiar carrito por completo
  const clearCart = () => {
    setItems([]);
    setDiscountType('none');
    setDiscountValue(0);
    setCustomer({ name: '', phone: '' });
    setNotes('');
  };

  // Aplicar descuento
  const setDiscount = (type: DiscountType, value: number) => {
    setDiscountType(type);
    setDiscountValue(Math.max(0, value));
  };

  // Totales calculados
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = Math.min(subtotal, discountValue);
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxRate > 0 ? (taxableAmount * taxRate) / 100 : 0;
    const totalAmount = taxableAmount + taxAmount;
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      totalAmount,
      totalItemsCount
    };
  }, [items, discountType, discountValue, taxRate]);

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    discountType,
    discountValue,
    setDiscount,
    customer,
    setCustomer,
    notes,
    setNotes,
    ...totals
  };
}
