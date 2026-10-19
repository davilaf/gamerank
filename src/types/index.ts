export interface StoreSettings {
  id: string;
  name: string;
  slug: string;
  phoneWhatsApp: string; // Ej: +5215512345678 o 5215512345678
  currency: string;
  taxRate: number; // Porcentaje, ej: 16 para 16%
  taxIncluded: boolean;
  receiptHeader: string;
  receiptFooter: string;
  address?: string;
  logoUrl?: string;
  storeIcon?: string;
  themeColor?: string;
  adminUsername?: string;
  adminPassword?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'admin' | 'cashier';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // Ej: "Talla L / Rojo"
  sku?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  attributes: Record<string, string>; // Ej: { "Talla": "L", "Color": "Rojo" }
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  imageUrl?: string;
  hasVariants: boolean;
  basePrice: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  trackStock: boolean;
  stockQuantity: number;
  minStockAlert: number;
  isActive: boolean;
  showInCatalog: boolean;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // Unique cart line ID
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  imageUrl?: string;
  trackStock: boolean;
  maxStock: number;
}

export type DiscountType = 'none' | 'percentage' | 'fixed';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit' | 'mixed';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  subtotal: number;
  discountAmount: number;
  total: number;
}

export interface Order {
  id: string; // Local UUID
  orderNumber: string; // Ej: #1001
  storeId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountReceived?: number;
  changeAmount?: number;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  syncedAt?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export type CashMovementType = 'cash_in' | 'cash_out' | 'expense_fixed' | 'expense_variable' | 'sale_income';

export interface CashMovement {
  id: string;
  type: CashMovementType;
  category: string; // "Alquiler", "Servicios", "Inyección Caja", "Retiro Socio", etc.
  amount: number;
  description: string;
  referenceOrderId?: string;
  createdAt: string;
  syncStatus: 'synced' | 'pending';
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balanceCredit: number; // Saldo pendiente
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  tableName: 'products' | 'variants' | 'orders' | 'cash_movements' | 'categories' | 'customers' | 'settings';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  payload: any;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
}
