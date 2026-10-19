import Dexie, { type Table } from 'dexie';
import { Product, ProductVariant, Category, Order, OrderItem, CashMovement, Customer, SyncQueueItem, StoreSettings } from '../types';
import { initialProducts, initialCategories, initialStoreSettings, initialCashMovements } from './mockData';
import { getSupabaseClient } from './supabaseClient';

export class KytePOSDatabase extends Dexie {
  products!: Table<Product, string>;
  variants!: Table<ProductVariant, string>;
  categories!: Table<Category, string>;
  orders!: Table<Order, string>;
  orderItems!: Table<OrderItem, string>;
  cashMovements!: Table<CashMovement, string>;
  customers!: Table<Customer, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  settings!: Table<StoreSettings, string>;

  constructor() {
    super('KytePOSDatabase');
    this.version(1).stores({
      products: 'id, categoryId, sku, barcode, isActive, showInCatalog, createdAt',
      variants: 'id, productId, sku, barcode',
      categories: 'id, name, createdAt',
      orders: 'id, orderNumber, customerId, paymentMethod, paymentStatus, syncStatus, createdAt',
      orderItems: 'id, orderId, productId, variantId',
      cashMovements: 'id, type, category, referenceOrderId, syncStatus, createdAt',
      customers: 'id, name, phone, createdAt',
      syncQueue: 'id, status, tableName, createdAt',
      settings: 'id'
    });
  }
}

export const db = new KytePOSDatabase();

// Inicialización de datos locales
export async function initializeLocalDatabase(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    let cloudHasData = false;

    if (supabase && navigator.onLine) {
      try {
        const { data: cloudProds } = await supabase.from('products').select('id').limit(1);
        if (cloudProds && cloudProds.length > 0) {
          cloudHasData = true;
        }
      } catch (e) {
        console.warn('No se pudo verificar Supabase al inicio:', e);
      }
    }

    // Si la nube ya tiene productos reales, no sembramos demo
    if (cloudHasData) {
      return;
    }

    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add(initialStoreSettings);
    }

    const categoriesCount = await db.categories.count();
    if (categoriesCount === 0) {
      await db.categories.bulkAdd(initialCategories);
    }

    const productsCount = await db.products.count();
    if (productsCount === 0) {
      for (const prod of initialProducts) {
        await db.products.add(prod);
        if (prod.variants && prod.variants.length > 0) {
          await db.variants.bulkAdd(prod.variants);
        }
      }
    }

    const movementsCount = await db.cashMovements.count();
    if (movementsCount === 0) {
      await db.cashMovements.bulkAdd(initialCashMovements);
    }
  } catch (err) {
    console.error('Error inicializando IndexedDB:', err);
  }
}
