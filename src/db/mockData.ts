import { Product, Category, StoreSettings, CashMovement } from '../types';

export const initialStoreSettings: StoreSettings = {
  id: 'store-default-1',
  name: 'Boutique & Café Demo',
  slug: 'boutique-demo',
  phoneWhatsApp: '+5215500000000',
  currency: '$',
  taxRate: 16,
  taxIncluded: false,
  receiptHeader: '¡Gracias por tu compra!\nAv. Principal 123, Ciudad de México\nRFC: DEMO123456XYZ',
  receiptFooter: 'Conserva este ticket para cambios o devoluciones dentro de los 30 días posteriores a la compra.',
  address: 'Av. Principal 123, Centro',
  adminUsername: 'admin',
  adminPassword: '123'
};

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Ropa & Moda', color: '#6366f1', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Bebidas & Café', color: '#10b981', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Snacks & Postres', color: '#f59e0b', createdAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Accesorios', color: '#ec4899', createdAt: new Date().toISOString() },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Playera Casual Premium',
    description: '100% Algodón peinado de alto gramaje.',
    categoryId: 'cat-1',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
    hasVariants: true,
    basePrice: 25.00,
    costPrice: 12.00,
    sku: 'TSHIRT-001',
    trackStock: true,
    stockQuantity: 42,
    minStockAlert: 10,
    isActive: true,
    showInCatalog: true,
    variants: [
      {
        id: 'var-1-1',
        productId: 'prod-1',
        name: 'Talla M / Negro',
        sku: 'TSHIRT-BLK-M',
        price: 25.00,
        costPrice: 12.00,
        stockQuantity: 18,
        attributes: { 'Talla': 'M', 'Color': 'Negro' }
      },
      {
        id: 'var-1-2',
        productId: 'prod-1',
        name: 'Talla L / Negro',
        sku: 'TSHIRT-BLK-L',
        price: 25.00,
        costPrice: 12.00,
        stockQuantity: 14,
        attributes: { 'Talla': 'L', 'Color': 'Negro' }
      },
      {
        id: 'var-1-3',
        productId: 'prod-1',
        name: 'Talla XL / Blanco',
        sku: 'TSHIRT-WHT-XL',
        price: 28.00,
        costPrice: 13.50,
        stockQuantity: 10,
        attributes: { 'Talla': 'XL', 'Color': 'Blanco' }
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Café Espresso Doble',
    description: 'Grano de especialidad tostado artesanalmente.',
    categoryId: 'cat-2',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
    hasVariants: false,
    basePrice: 3.50,
    costPrice: 0.80,
    sku: 'CAF-ESP-002',
    trackStock: true,
    stockQuantity: 95,
    minStockAlert: 15,
    isActive: true,
    showInCatalog: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Latte Helado con Vainilla',
    description: 'Espresso con leche espumada fría y jarabe de vainilla.',
    categoryId: 'cat-2',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
    hasVariants: true,
    basePrice: 4.80,
    costPrice: 1.20,
    sku: 'CAF-LAT-003',
    trackStock: true,
    stockQuantity: 30,
    minStockAlert: 8,
    isActive: true,
    showInCatalog: true,
    variants: [
      {
        id: 'var-3-1',
        productId: 'prod-3',
        name: 'Regular 12oz',
        sku: 'LAT-REG-12',
        price: 4.80,
        costPrice: 1.20,
        stockQuantity: 20,
        attributes: { 'Tamaño': '12oz' }
      },
      {
        id: 'var-3-2',
        productId: 'prod-3',
        name: 'Grande 16oz',
        sku: 'LAT-GRD-16',
        price: 5.80,
        costPrice: 1.50,
        stockQuantity: 10,
        attributes: { 'Tamaño': '16oz' }
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Croissant Francés Mantequilla',
    description: 'Recién horneado todos los días con mantequilla pura.',
    categoryId: 'cat-3',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
    hasVariants: false,
    basePrice: 3.20,
    costPrice: 1.10,
    sku: 'SNK-CRST-004',
    trackStock: true,
    stockQuantity: 4, // Alerta stock bajo
    minStockAlert: 8,
    isActive: true,
    showInCatalog: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Gorra Urbana Snapback',
    description: 'Estilo clásico con visera plana y bordado en alto relieve.',
    categoryId: 'cat-4',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=60',
    hasVariants: false,
    basePrice: 22.00,
    costPrice: 9.00,
    sku: 'ACC-GOR-005',
    trackStock: true,
    stockQuantity: 15,
    minStockAlert: 5,
    isActive: true,
    showInCatalog: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Mochila Urbana Resistente al Agua',
    description: 'Compartimento para laptop hasta 15.6 pulgadas y puerto USB.',
    categoryId: 'cat-4',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
    hasVariants: false,
    basePrice: 48.00,
    costPrice: 22.00,
    sku: 'ACC-MOC-006',
    trackStock: true,
    stockQuantity: 2, // Alerta stock bajo
    minStockAlert: 5,
    isActive: true,
    showInCatalog: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialCashMovements: CashMovement[] = [
  {
    id: 'cash-1',
    type: 'cash_in',
    category: 'Apertura de Caja',
    amount: 150.00,
    description: 'Fondo inicial de caja chica para cambio',
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    syncStatus: 'synced'
  },
  {
    id: 'cash-2',
    type: 'expense_fixed',
    category: 'Servicios',
    amount: 45.00,
    description: 'Pago de internet de fibra óptica del local',
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    syncStatus: 'synced'
  }
];
