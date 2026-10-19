import { db } from './index';
import { Order, OrderItem, SyncQueueItem, CashMovement, Product, Category, StoreSettings } from '../types';
import { getSupabaseClient } from './supabaseClient';

export interface SyncStatusReport {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  error: string | null;
  isCloudConnected: boolean;
}

export const SUPABASE_SQL_SCHEMA = `-- Copia y pega este script en el SQL Editor de tu proyecto de Supabase:

-- 1. Tabla de Configuración de la Tienda
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  phone_whatsapp TEXT,
  currency TEXT,
  tax_rate NUMERIC,
  tax_included BOOLEAN,
  receipt_header TEXT,
  receipt_footer TEXT,
  address TEXT,
  logo_url TEXT,
  store_icon TEXT,
  theme_color TEXT,
  admin_username TEXT,
  admin_password TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  base_price NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  sku TEXT,
  barcode TEXT,
  image_url TEXT,
  track_stock BOOLEAN DEFAULT true,
  stock_quantity NUMERIC DEFAULT 0,
  min_stock_alert NUMERIC DEFAULT 5,
  has_variants BOOLEAN DEFAULT false,
  show_in_catalog BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Variantes
CREATE TABLE IF NOT EXISTS variants (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  stock_quantity NUMERIC DEFAULT 0,
  attributes JSONB DEFAULT '{}'::jsonb
);

-- 5. Tabla de Órdenes / Ventas
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  type TEXT,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal NUMERIC,
  tax_amount NUMERIC,
  discount_amount NUMERIC,
  discount_type TEXT,
  total_amount NUMERIC,
  payment_method TEXT,
  payment_status TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Items de Órdenes
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  product_id TEXT,
  variant_id TEXT,
  product_name TEXT,
  variant_name TEXT,
  quantity NUMERIC,
  unit_price NUMERIC,
  total_price NUMERIC,
  cost_price NUMERIC
);

-- 7. Flujo de Caja / Gastos
CREATE TABLE IF NOT EXISTS cash_movements (
  id TEXT PRIMARY KEY,
  type TEXT,
  category TEXT,
  amount NUMERIC,
  description TEXT,
  reference_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar permisos de lectura/escritura anónima para la PWA
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access variants" ON variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cash_movements" ON cash_movements FOR ALL USING (true) WITH CHECK (true);

-- Habilitar Realtime para reflejo instantáneo en todos los dispositivos
ALTER PUBLICATION supabase_realtime ADD TABLE store_settings, categories, products, variants, orders, cash_movements;
`;

class SyncService {
  private isSyncing = false;
  private lastSyncTime: string | null = null;
  private listeners: Array<(report: SyncStatusReport) => void> = [];
  private realtimeChannel: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Evento de reconexión
      window.addEventListener('online', () => {
        console.log('[SyncService] Conexión online detectada. Sincronizando con Supabase...');
        this.processQueue();
        this.pullFromCloud();
      });

      // Cuando la pestaña vuelve a ser visible en el celular (desbloqueo de pantalla / cambio de app)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.pullFromCloud();
          this.processQueue();
        }
      });

      window.addEventListener('focus', () => {
        this.pullFromCloud();
        this.processQueue();
      });

      // Polling de respaldo en segundo plano cada 30 segundos (el tiempo real ya se maneja vía Supabase Realtime)
      setInterval(() => {
        if (navigator.onLine && !this.isSyncing && document.visibilityState === 'visible') {
          this.pullFromCloud();
        }
      }, 30000);

      // Iniciar sync y realtime de inmediato
      setTimeout(() => {
        this.initRealtime();
        this.pullFromCloud();
      }, 300);
    }
  }

  initRealtime() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    if (this.realtimeChannel) {
      try {
        supabase.removeChannel(this.realtimeChannel);
      } catch (e) {
        // ignore
      }
      this.realtimeChannel = null;
    }

    try {
      this.realtimeChannel = supabase
        .channel('fd_pos_realtime_sync_' + Math.random().toString(36).substring(2, 7))
        .on('postgres_changes', { event: '*', schema: 'public' }, async (payload) => {
          console.log('[Realtime] Cambio detectado en Supabase:', payload.table, payload.eventType);
          await this.pullFromCloud();
        })
        .subscribe((status) => {
          console.log('[Realtime] Estado de conexión Realtime:', status);
        });
    } catch (e) {
      console.error('[Realtime] Error inicializando realtime:', e);
    }
  }

  subscribe(callback: (report: SyncStatusReport) => void) {
    this.listeners.push(callback);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private async notify(error: string | null = null) {
    const pendingCount = await db.syncQueue.where('status').equals('pending').count();
    const supabase = getSupabaseClient();
    const report: SyncStatusReport = {
      pendingCount,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      error,
      isCloudConnected: Boolean(supabase)
    };
    this.listeners.forEach((cb) => cb(report));
  }

  async enqueueMutation(
    tableName: SyncQueueItem['tableName'],
    operation: SyncQueueItem['operation'],
    recordId: string,
    payload: any
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tableName,
      operation,
      recordId,
      payload,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    await db.syncQueue.add(queueItem);
    this.notify();

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processSaleOffline(order: Order, items: OrderItem[]): Promise<Order> {
    // 1. Descontar en base de datos local Dexie
    await db.transaction('rw', [db.orders, db.orderItems, db.products, db.variants, db.cashMovements, db.syncQueue], async () => {
      await db.orders.add(order);

      for (const item of items) {
        await db.orderItems.add(item);

        if (item.variantId) {
          const variant = await db.variants.get(item.variantId);
          if (variant) {
            const newVarStock = Math.max(0, (variant.stockQuantity || 0) - item.quantity);
            await db.variants.update(item.variantId, { stockQuantity: newVarStock });
          }
          const product = await db.products.get(item.productId);
          if (product && product.trackStock) {
            const newProdStock = Math.max(0, (product.stockQuantity || 0) - item.quantity);
            await db.products.update(item.productId, {
              stockQuantity: newProdStock,
              updatedAt: new Date().toISOString()
            });
          }
        } else {
          const product = await db.products.get(item.productId);
          if (product && product.trackStock) {
            const newProdStock = Math.max(0, (product.stockQuantity || 0) - item.quantity);
            await db.products.update(item.productId, {
              stockQuantity: newProdStock,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }

      if (order.paymentStatus === 'paid') {
        const cashMovement: CashMovement = {
          id: `cash-sale-${order.id}`,
          type: 'sale_income',
          category: 'Venta POS',
          amount: order.totalAmount,
          description: `Cobro Orden ${order.orderNumber} (${order.paymentMethod.toUpperCase()})`,
          referenceOrderId: order.id,
          createdAt: order.createdAt,
          syncStatus: 'pending'
        };
        await db.cashMovements.add(cashMovement);
        await db.syncQueue.add({
          id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          tableName: 'cash_movements',
          operation: 'INSERT',
          recordId: cashMovement.id,
          payload: cashMovement,
          status: 'pending',
          retryCount: 0,
          createdAt: new Date().toISOString()
        });
      }

      await db.syncQueue.add({
        id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tableName: 'orders',
        operation: 'INSERT',
        recordId: order.id,
        payload: { order, items },
        status: 'pending',
        retryCount: 0,
        createdAt: new Date().toISOString()
      });

      for (const item of items) {
        if (item.variantId) {
          await db.syncQueue.add({
            id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            tableName: 'variants',
            operation: 'UPDATE',
            recordId: item.variantId,
            payload: {},
            status: 'pending',
            retryCount: 0,
            createdAt: new Date().toISOString()
          });
        }
        await db.syncQueue.add({
          id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          tableName: 'products',
          operation: 'UPDATE',
          recordId: item.productId,
          payload: {},
          status: 'pending',
          retryCount: 0,
          createdAt: new Date().toISOString()
        });
      }
    });

    this.notify();

    // 2. Actualizar stock inmediatamente en Supabase en paralelo
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      try {
        for (const item of items) {
          if (item.variantId) {
            const v = await db.variants.get(item.variantId);
            if (v) {
              await supabase.from('variants').update({ stock_quantity: v.stockQuantity }).eq('id', item.variantId);
            }
          }
          const p = await db.products.get(item.productId);
          if (p && p.trackStock) {
            await supabase.from('products').update({
              stock_quantity: p.stockQuantity,
              updated_at: new Date().toISOString()
            }).eq('id', item.productId);
          }
        }
      } catch (cloudErr) {
        console.warn('Error en actualización directa de stock a Supabase:', cloudErr);
      }
      this.processQueue();
    }

    return order;
  }

  // Enviar mutaciones pendientes a Supabase de forma segura y completa
  async processQueue(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase || this.isSyncing || !navigator.onLine) {
      return;
    }

    const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();
    if (pendingItems.length === 0) {
      this.notify();
      return;
    }

    this.isSyncing = true;
    this.notify();

    try {
      for (const item of pendingItems) {
        await db.syncQueue.update(item.id, { status: 'syncing' });

        if (item.tableName === 'products') {
          if (item.operation === 'DELETE') {
            await supabase.from('products').delete().eq('id', item.recordId);
          } else {
            // Obtener el producto completo de Dexie para asegurar que todos los campos requeridos existan
            const localProd = await db.products.get(item.recordId);
            if (localProd) {
              const { error: prodErr } = await supabase.from('products').upsert({
                id: localProd.id,
                name: localProd.name,
                description: localProd.description || null,
                category_id: localProd.categoryId || null,
                base_price: localProd.basePrice || 0,
                cost_price: localProd.costPrice || 0,
                sku: localProd.sku || null,
                barcode: localProd.barcode || null,
                image_url: localProd.imageUrl || null,
                track_stock: localProd.trackStock ?? true,
                stock_quantity: localProd.stockQuantity ?? 0,
                min_stock_alert: localProd.minStockAlert || 5,
                has_variants: localProd.hasVariants || false,
                show_in_catalog: localProd.showInCatalog ?? true,
                is_active: localProd.isActive ?? true,
                updated_at: localProd.updatedAt || new Date().toISOString()
              });

              if (prodErr) {
                console.error('[Sync] Error upserting product in Supabase:', prodErr);
              }

              // Si tiene variantes, sincronizarlas
              if (localProd.hasVariants) {
                const vars = await db.variants.where('productId').equals(localProd.id).toArray();
                for (const v of vars) {
                  await supabase.from('variants').upsert({
                    id: v.id,
                    product_id: localProd.id,
                    name: v.name,
                    sku: v.sku || null,
                    price: v.price || 0,
                    cost_price: v.costPrice || 0,
                    stock_quantity: v.stockQuantity ?? 0,
                    attributes: v.attributes || {}
                  });
                }
              }
            }
          }
        } else if (item.tableName === 'variants') {
          if (item.operation === 'DELETE') {
            await supabase.from('variants').delete().eq('id', item.recordId);
          } else {
            const localVar = await db.variants.get(item.recordId);
            if (localVar) {
              await supabase.from('variants').upsert({
                id: localVar.id,
                product_id: localVar.productId,
                name: localVar.name,
                sku: localVar.sku || null,
                price: localVar.price || 0,
                cost_price: localVar.costPrice || 0,
                stock_quantity: localVar.stockQuantity ?? 0,
                attributes: localVar.attributes || {}
              });
            }
          }
        } else if (item.tableName === 'categories') {
          if (item.operation === 'DELETE') {
            await supabase.from('categories').delete().eq('id', item.recordId);
          } else {
            const localCat = await db.categories.get(item.recordId);
            if (localCat) {
              await supabase.from('categories').upsert({
                id: localCat.id,
                name: localCat.name,
                color: localCat.color,
                icon: localCat.icon || null
              });
            }
          }
        } else if (item.tableName === 'orders') {
          if (item.operation === 'DELETE') {
            await supabase.from('order_items').delete().eq('order_id', item.recordId);
            await supabase.from('orders').delete().eq('id', item.recordId);
            await supabase.from('cash_movements').delete().eq('reference_order_id', item.recordId);
          } else if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
            const ord = item.payload?.order || await db.orders.get(item.recordId);
            if (ord) {
              await supabase.from('orders').upsert({
                id: ord.id,
                order_number: ord.orderNumber,
                type: ord.type,
                customer_id: ord.customerId || null,
                customer_name: ord.customerName || null,
                customer_phone: ord.customerPhone || null,
                customer_address: ord.customerAddress || null,
                subtotal: ord.subtotal,
                tax_amount: ord.taxAmount,
                discount_amount: ord.discountAmount,
                discount_type: ord.discountType,
                total_amount: ord.totalAmount,
                payment_method: ord.paymentMethod,
                payment_status: ord.paymentStatus,
                status: ord.status,
                notes: ord.notes || null,
                created_at: ord.createdAt
              });

              if (item.payload.items && item.payload.items.length > 0) {
                for (const itm of item.payload.items) {
                  await supabase.from('order_items').upsert({
                    id: itm.id,
                    order_id: ord.id,
                    product_id: itm.productId,
                    variant_id: itm.variantId || null,
                    product_name: itm.productName,
                    variant_name: itm.variantName || null,
                    quantity: itm.quantity,
                    unit_price: itm.unitPrice,
                    total_price: itm.totalPrice,
                    cost_price: itm.costPrice || 0
                  });
                }
              }
            }
          }
        } else if (item.tableName === 'cash_movements') {
          if (item.operation === 'DELETE') {
            await supabase.from('cash_movements').delete().eq('id', item.recordId);
          } else {
            const cm = item.payload;
            if (cm) {
              await supabase.from('cash_movements').upsert({
                id: cm.id || item.recordId,
                type: cm.type,
                category: cm.category,
                amount: cm.amount,
                description: cm.description || null,
                reference_order_id: cm.referenceOrderId || null,
                created_at: cm.createdAt || new Date().toISOString()
              });
            }
          }
        } else if (item.tableName === 'settings') {
          const st = item.payload;
          if (st) {
            await supabase.from('store_settings').upsert({
              id: st.id,
              name: st.name,
              slug: st.slug,
              phone_whatsapp: st.phoneWhatsApp,
              currency: st.currency,
              tax_rate: st.taxRate,
              tax_included: st.taxIncluded,
              receipt_header: st.receiptHeader,
              receipt_footer: st.receiptFooter,
              address: st.address || null,
              logo_url: st.logoUrl || null,
              store_icon: st.storeIcon || null,
              theme_color: st.themeColor || null,
              admin_username: st.adminUsername || null,
              admin_password: st.adminPassword || null
            });
          }
        }

        await db.syncQueue.delete(item.id);
      }

      this.lastSyncTime = new Date().toLocaleTimeString();
      this.notify();
    } catch (err: any) {
      console.error('[SyncService] Error sincronizando a Supabase:', err);
      this.notify(err?.message || 'Error de sincronización con Supabase');
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  // Helper para reconciliar tablas sin hacer .clear() ni disparar re-renderizados innecesarios
  private async reconcileTable<T extends { id: string }>(
    table: any,
    remoteItems: T[],
    areEqual: (local: T, remote: T) => boolean
  ): Promise<boolean> {
    try {
      const localItems = await table.toArray();
      const localMap = new Map<string, T>();
      localItems.forEach((item: T) => localMap.set(item.id, item));

      const remoteMap = new Map<string, T>();
      remoteItems.forEach((item: T) => remoteMap.set(item.id, item));

      const toPut: T[] = [];
      const toDelete: string[] = [];

      for (const remote of remoteItems) {
        const local = localMap.get(remote.id);
        if (!local || !areEqual(local, remote)) {
          toPut.push(remote);
        }
      }

      for (const local of localItems) {
        if (!remoteMap.has(local.id)) {
          toDelete.push(local.id);
        }
      }

      if (toPut.length > 0 || toDelete.length > 0) {
        await db.transaction('rw', table, async () => {
          if (toPut.length > 0) await table.bulkPut(toPut);
          if (toDelete.length > 0) await table.bulkDelete(toDelete);
        });
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[SyncService] Error en reconcileTable:', e);
      return false;
    }
  }

  // Descargar datos reales de Supabase a IndexedDB de forma delta (sin parpadeos de UI)
  async pullFromCloud(): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase || !navigator.onLine) return false;

    // Primero procesar y subir cualquier mutación pendiente local para evitar que sea sobreescrita
    try {
      const pendingCount = await db.syncQueue.where('status').equals('pending').count();
      if (pendingCount > 0 && !this.isSyncing) {
        await this.processQueue();
      }
    } catch (e) {
      // ignore
    }

    try {
      this.isSyncing = true;

      // 1. Productos
      const { data: cloudProds } = await supabase.from('products').select('*');
      if (cloudProds && cloudProds.length > 0) {
        const mappedProds = cloudProds.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          categoryId: p.category_id,
          basePrice: Number(p.base_price || 0),
          costPrice: Number(p.cost_price || 0),
          sku: p.sku,
          barcode: p.barcode,
          imageUrl: p.image_url,
          trackStock: p.track_stock,
          stockQuantity: Number(p.stock_quantity || 0),
          minStockAlert: Number(p.min_stock_alert || 5),
          hasVariants: p.has_variants,
          showInCatalog: p.show_in_catalog,
          isActive: p.is_active,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));

        await this.reconcileTable(
          db.products,
          mappedProds,
          (l, r) =>
            l.name === r.name &&
            l.description === r.description &&
            l.categoryId === r.categoryId &&
            l.basePrice === r.basePrice &&
            l.costPrice === r.costPrice &&
            l.sku === r.sku &&
            l.barcode === r.barcode &&
            l.imageUrl === r.imageUrl &&
            l.trackStock === r.trackStock &&
            l.stockQuantity === r.stockQuantity &&
            l.minStockAlert === r.minStockAlert &&
            l.hasVariants === r.hasVariants &&
            l.showInCatalog === r.showInCatalog &&
            l.isActive === r.isActive
        );
      }

      // 2. Variantes
      const { data: cloudVariants } = await supabase.from('variants').select('*');
      if (cloudVariants && cloudVariants.length > 0) {
        const mappedVariants = cloudVariants.map((v) => ({
          id: v.id,
          productId: v.product_id,
          name: v.name,
          sku: v.sku,
          price: Number(v.price || 0),
          costPrice: Number(v.cost_price || 0),
          stockQuantity: Number(v.stock_quantity || 0),
          attributes: v.attributes || {}
        }));

        await this.reconcileTable(
          db.variants,
          mappedVariants,
          (l, r) =>
            l.productId === r.productId &&
            l.name === r.name &&
            l.sku === r.sku &&
            l.price === r.price &&
            l.costPrice === r.costPrice &&
            l.stockQuantity === r.stockQuantity
        );
      }

      // 3. Categorías
      const { data: cloudCats } = await supabase.from('categories').select('*');
      if (cloudCats && cloudCats.length > 0) {
        const mappedCats = cloudCats.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          createdAt: c.created_at
        }));

        await this.reconcileTable(
          db.categories,
          mappedCats,
          (l, r) => l.name === r.name && l.color === r.color && l.icon === r.icon
        );
      }

      // 4. Configuración
      const { data: cloudSettings } = await supabase.from('store_settings').select('*').limit(1);
      if (cloudSettings && cloudSettings.length > 0) {
        const s = cloudSettings[0];
        const mappedSetting = {
          id: s.id,
          name: s.name,
          slug: s.slug,
          phoneWhatsApp: s.phone_whatsapp,
          currency: s.currency,
          taxRate: Number(s.tax_rate || 0),
          taxIncluded: s.tax_included,
          receiptHeader: s.receipt_header,
          receiptFooter: s.receipt_footer,
          address: s.address,
          logoUrl: s.logo_url,
          storeIcon: s.store_icon,
          themeColor: s.theme_color,
          adminUsername: s.admin_username,
          adminPassword: s.admin_password
        };

        const localSetting = await db.settings.get(s.id);
        if (
          !localSetting ||
          localSetting.name !== mappedSetting.name ||
          localSetting.phoneWhatsApp !== mappedSetting.phoneWhatsApp ||
          localSetting.currency !== mappedSetting.currency ||
          localSetting.taxRate !== mappedSetting.taxRate ||
          localSetting.address !== mappedSetting.address ||
          localSetting.logoUrl !== mappedSetting.logoUrl ||
          localSetting.themeColor !== mappedSetting.themeColor
        ) {
          await db.settings.put(mappedSetting);
        }
      }

      // 5. Órdenes / Ventas
      const { data: cloudOrders } = await supabase.from('orders').select('*');
      if (cloudOrders) {
        const mappedOrders = cloudOrders.map((o) => ({
          id: o.id,
          orderNumber: o.order_number || '#0001',
          type: o.type || 'direct',
          customerId: o.customer_id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerAddress: o.customer_address,
          subtotal: Number(o.subtotal || 0),
          taxAmount: Number(o.tax_amount || 0),
          discountAmount: Number(o.discount_amount || 0),
          discountType: o.discount_type || 'none',
          totalAmount: Number(o.total_amount || 0),
          paymentMethod: o.payment_method || 'cash',
          paymentStatus: o.payment_status || 'paid',
          status: o.status || 'completed',
          notes: o.notes,
          createdAt: o.created_at,
          syncStatus: 'synced' as const,
          syncedAt: o.created_at
        }));

        await this.reconcileTable(
          db.orders,
          mappedOrders,
          (l, r) =>
            l.orderNumber === r.orderNumber &&
            l.totalAmount === r.totalAmount &&
            l.paymentMethod === r.paymentMethod &&
            l.paymentStatus === r.paymentStatus &&
            l.status === r.status
        );
      }

      // 6. Items de Órdenes
      const { data: cloudItems } = await supabase.from('order_items').select('*');
      if (cloudItems) {
        const mappedItems = cloudItems.map((itm) => ({
          id: itm.id,
          orderId: itm.order_id,
          productId: itm.product_id,
          variantId: itm.variant_id,
          productName: itm.product_name,
          variantName: itm.variant_name,
          quantity: Number(itm.quantity || 1),
          unitPrice: Number(itm.unit_price || 0),
          totalPrice: Number(itm.total_price || (itm.unit_price * itm.quantity)),
          costPrice: Number(itm.cost_price || 0),
          unitCost: Number(itm.cost_price || 0)
        }));

        await this.reconcileTable(
          db.orderItems,
          mappedItems,
          (l, r) =>
            l.orderId === r.orderId &&
            l.productId === r.productId &&
            l.quantity === r.quantity &&
            l.unitPrice === r.unitPrice &&
            l.totalPrice === r.totalPrice
        );
      }

      // 7. Flujo de Caja y Gastos
      const { data: cloudCash } = await supabase.from('cash_movements').select('*');
      if (cloudCash) {
        const mappedCash = cloudCash.map((cm) => ({
          id: cm.id,
          type: cm.type,
          category: cm.category,
          amount: Number(cm.amount || 0),
          description: cm.description,
          referenceOrderId: cm.reference_order_id,
          createdAt: cm.created_at,
          syncStatus: 'synced' as const
        }));

        await this.reconcileTable(
          db.cashMovements,
          mappedCash,
          (l, r) =>
            l.type === r.type &&
            l.category === r.category &&
            l.amount === r.amount &&
            l.referenceOrderId === r.referenceOrderId
        );
      }

      this.lastSyncTime = new Date().toLocaleTimeString();
      return true;
    } catch (err) {
      console.error('[SyncService] Error en pullFromCloud:', err);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // Subir todos los datos locales a Supabase
  async uploadAllLocalDataToCloud(): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase no está configurado.' };
    }

    try {
      this.isSyncing = true;
      this.notify();

      // 1. Subir configuración
      const currentSettings = await db.settings.toArray();
      if (currentSettings.length > 0) {
        const s = currentSettings[0];
        await supabase.from('store_settings').upsert({
          id: s.id,
          name: s.name,
          slug: s.slug,
          phone_whatsapp: s.phoneWhatsApp,
          currency: s.currency,
          tax_rate: s.taxRate,
          tax_included: s.taxIncluded,
          receipt_header: s.receiptHeader,
          receipt_footer: s.receiptFooter,
          address: s.address || null,
          logo_url: s.logoUrl || null,
          store_icon: s.storeIcon || null,
          theme_color: s.themeColor || null,
          admin_username: s.adminUsername || null,
          admin_password: s.adminPassword || null
        });
      }

      // 2. Subir categorías
      const cats = await db.categories.toArray();
      for (const c of cats) {
        await supabase.from('categories').upsert({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon || null
        });
      }

      // 3. Subir productos
      const prods = await db.products.toArray();
      for (const p of prods) {
        await supabase.from('products').upsert({
          id: p.id,
          name: p.name,
          description: p.description || null,
          category_id: p.categoryId || null,
          base_price: p.basePrice || 0,
          cost_price: p.costPrice || 0,
          sku: p.sku || null,
          barcode: p.barcode || null,
          image_url: p.imageUrl || null,
          track_stock: p.trackStock ?? true,
          stock_quantity: p.stockQuantity ?? 0,
          min_stock_alert: p.minStockAlert || 5,
          has_variants: p.hasVariants || false,
          show_in_catalog: p.showInCatalog ?? true,
          is_active: p.isActive ?? true,
          updated_at: new Date().toISOString()
        });
      }

      // 4. Subir variantes
      const vars = await db.variants.toArray();
      for (const v of vars) {
        await supabase.from('variants').upsert({
          id: v.id,
          product_id: v.productId,
          name: v.name,
          sku: v.sku || null,
          price: v.price || 0,
          cost_price: v.costPrice || 0,
          stock_quantity: v.stockQuantity ?? 0,
          attributes: v.attributes || {}
        });
      }

      // 5. Subir órdenes
      const ords = await db.orders.toArray();
      for (const o of ords) {
        await supabase.from('orders').upsert({
          id: o.id,
          order_number: o.orderNumber,
          type: o.type,
          customer_id: o.customerId || null,
          customer_name: o.customerName || null,
          customer_phone: o.customerPhone || null,
          customer_address: o.customerAddress || null,
          subtotal: o.subtotal,
          tax_amount: o.taxAmount,
          discount_amount: o.discountAmount,
          discount_type: o.discountType,
          total_amount: o.totalAmount,
          payment_method: o.paymentMethod,
          payment_status: o.paymentStatus,
          status: o.status,
          notes: o.notes || null,
          created_at: o.createdAt
        });
      }

      // 6. Subir items de órdenes
      const items = await db.orderItems.toArray();
      for (const itm of items) {
        await supabase.from('order_items').upsert({
          id: itm.id,
          order_id: itm.orderId,
          product_id: itm.productId,
          variant_id: itm.variantId || null,
          product_name: itm.productName,
          variant_name: itm.variantName || null,
          quantity: itm.quantity,
          unit_price: itm.unitPrice,
          total_price: itm.totalPrice,
          cost_price: itm.costPrice || 0
        });
      }

      // 7. Subir movimientos de caja
      const cash = await db.cashMovements.toArray();
      for (const cm of cash) {
        await supabase.from('cash_movements').upsert({
          id: cm.id,
          type: cm.type,
          category: cm.category,
          amount: cm.amount,
          description: cm.description || null,
          reference_order_id: cm.referenceOrderId || null,
          created_at: cm.createdAt
        });
      }

      this.lastSyncTime = new Date().toLocaleTimeString();
      return { success: true, message: `¡Sincronización exitosa! Se subieron ${prods.length} productos, ${ords.length} ventas y métricas a Supabase.` };
    } catch (err: any) {
      console.error('Error subiendo datos a Supabase:', err);
      return { success: false, message: `Error al subir: ${err?.message || 'Verifica la conexión'}` };
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  async getPendingCount(): Promise<number> {
    return await db.syncQueue.where('status').equals('pending').count();
  }
}

export const syncService = new SyncService();
