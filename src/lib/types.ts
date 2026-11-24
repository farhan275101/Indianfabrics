export type SareeCategory =
  | 'Banarasi Silk'
  | 'Cotton & Linen'
  | 'Bridal & Festive'
  | 'Organza & Tissue';

export interface SareeProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: SareeCategory;
  fabric: string;
  wholesale_price: number; // Per saree factory rate (INR)
  moq: number;             // Minimum Order Quantity (pieces per set)
  set_description: string;
  description: string;
  model_image: string;
  gallery_images: string[];
  is_runway: boolean;
  runway_order: number;
  badge?: string;
  in_stock: boolean;
  pin: [number, number];   // [left%, top%] for Runway popup pin
  pack_options: string[];  // Wholesale pack choices
}

export interface BagItem {
  id: string;
  sku: string;
  name: string;
  model_image: string;
  wholesale_price: number;
  moq: number;
  sets: number;            // Number of sets (total pcs = sets * moq)
  pack_option: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Dispatched';

export interface WholesaleOrder {
  order_code: string;
  buyer_name: string;
  business_name: string;
  phone: string;
  city_state: string;
  full_address: string;
  gst_number?: string;
  items: BagItem[];
  total_amount: number;
  notes?: string;
  status: OrderStatus;
  tracking_info?: string;
  created_at: string;
}
