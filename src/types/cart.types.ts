/**
 * Cart Type Definitions
 * Production-ready cart models for frontend state management
 */

export interface CartItem {
  productId: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
  lastSyncedQuantity?: number; // Track last successfully synced quantity to avoid unnecessary API calls
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Record<string, number>; // productId -> timestamp of last sync
}

export interface CartContextValue {
  // State
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;

  // Actions
  addToCart: (
    productId: string,
    productName: string,
    image: string,
    price: number
  ) => Promise<void>;
  updateLocalQuantity: (productId: string, newQuantity: number) => void;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCartFromAPI: () => Promise<void>;
}

// API Response types
export interface CartAPIResponse {
  success: boolean;
  items: Array<{
    itemId: number;
    productId: string;
    productName: string;
    image: string;
    price: number;
    quantity: number;
    createdAt: string;
  }>;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  item: {
    itemId: number;
    productId: string;
    productName: string;
    image: string;
    price: number;
    quantity: number;
    updatedAt: string;
  };
}
