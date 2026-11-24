import { DEFAULT_SAREES } from './demo-data';
import { BagItem, SareeProduct, WholesaleOrder } from './types';

const KEYS = {
  SAREES: 'vv_b2b_sarees_v1',
  BAG: 'vv_b2b_bag_v1',
  ORDERS: 'vv_b2b_orders_v1',
  ADMIN: 'vv_b2b_admin_logged_in',
};

export const formatINR = (amount: number): string =>
  '₹' + Math.round(amount).toLocaleString('en-IN');

// --- Sarees Catalog ---
export function getSarees(): SareeProduct[] {
  if (typeof window === 'undefined') return DEFAULT_SAREES;
  try {
    const raw = localStorage.getItem(KEYS.SAREES);
    if (!raw) return DEFAULT_SAREES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SAREES;
  } catch {
    return DEFAULT_SAREES;
  }
}

export function saveSarees(list: SareeProduct[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SAREES, JSON.stringify(list));
  window.dispatchEvent(new Event('vv-store-update'));
}

export function resetSareesToDemo(): SareeProduct[] {
  if (typeof window === 'undefined') return DEFAULT_SAREES;
  localStorage.removeItem(KEYS.SAREES);
  window.dispatchEvent(new Event('vv-store-update'));
  return DEFAULT_SAREES;
}

// --- Wholesale Inquiry Bag ---
export function getBag(): BagItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.BAG);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBag(items: BagItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.BAG, JSON.stringify(items));
  window.dispatchEvent(new Event('vv-bag-update'));
}

export function addToBag(saree: SareeProduct, packOption: string, sets = 1): BagItem[] {
  const bag = getBag();
  const existing = bag.find(
    (b) => b.id === saree.id && b.pack_option === packOption
  );
  if (existing) {
    existing.sets += sets;
  } else {
    bag.push({
      id: saree.id,
      sku: saree.sku,
      name: saree.name,
      model_image: saree.model_image,
      wholesale_price: saree.wholesale_price,
      moq: saree.moq,
      sets,
      pack_option: packOption,
    });
  }
  saveBag(bag);
  return bag;
}

// --- Wholesale Orders ---
export function getOrders(): WholesaleOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: WholesaleOrder): void {
  if (typeof window === 'undefined') return;
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  window.dispatchEvent(new Event('vv-orders-update'));
}

export function updateOrderStatus(
  orderCode: string,
  status: WholesaleOrder['status'],
  trackingInfo?: string
): void {
  if (typeof window === 'undefined') return;
  const orders = getOrders().map((o) =>
    o.order_code === orderCode
      ? { ...o, status, tracking_info: trackingInfo ?? o.tracking_info }
      : o
  );
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  window.dispatchEvent(new Event('vv-orders-update'));
}

// --- Simple Demo Admin Session ---
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.ADMIN) === 'true';
}

export function setAdminSession(loggedIn: boolean): void {
  if (typeof window === 'undefined') return;
  if (loggedIn) localStorage.setItem(KEYS.ADMIN, 'true');
  else localStorage.removeItem(KEYS.ADMIN);
}
