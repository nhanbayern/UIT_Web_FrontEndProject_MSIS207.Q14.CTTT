export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  region?: string;
  description?: string;
  stock?: number;

  // optional fields found in mockData / used in UI
  currency?: string;
  hero_image?: string;
  images?: { url: string; type?: string }[];
  short_description?: string;
  long_description?: string;
  detailedDescription?: string;
  prod_content_img?: string;

  // alcohol / volume related
  abv?: string; // e.g. "19.0%"
  alcoholContent?: string; // UI uses this name
  volume?: string; // e.g. "750ml"
  volume_ml?: number;

  origin?: string;
  ingredients?: string[];

  // allow other extras without TS errors
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface Address {
  address_line: string;
  ward: string;
  district: string;
  province: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  orderCode?: string;
  items: CartItem[];
  total: number;
  status: "processing" | "shipping" | "delivered" | "cancelled";
  paymentMethod: "cash";
  date: string;
  shippingAddress: Address;
  customerName: string;
  customerPhone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses?: Address[];
}
