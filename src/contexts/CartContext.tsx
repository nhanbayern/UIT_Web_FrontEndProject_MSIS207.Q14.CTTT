/**
 * Cart Context - Production-Ready Implementation
 * Manages cart state with debounced API sync (500-1000ms)
 *
 * Key Features:
 * - Optimistic UI updates
 * - Debounced quantity sync (600ms default)
 * - No unnecessary API calls
 * - Tracks last synced quantity to avoid redundant updates
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { toast } from "sonner";
import {
  CartItem,
  CartState,
  CartContextValue,
  CartAPIResponse,
} from "../types/cart.types";
import {
  getCartItems,
  addToCart as addToCartAPI,
  removeFromCart,
  clearAllCartItems,
  syncQuantityUpdate,
} from "../services/cart.service";
import { CartDebouncer } from "../utils/debounce";

// Action types
type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CART_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM_OPTIMISTIC"; payload: CartItem }
  | {
      type: "UPDATE_LOCAL_QUANTITY";
      payload: { productId: string; quantity: number };
    }
  | { type: "REMOVE_ITEM_OPTIMISTIC"; payload: string }
  | { type: "CLEAR_CART" }
  | {
      type: "UPDATE_SYNCED_QUANTITY";
      payload: { productId: string; quantity: number };
    }
  | {
      type: "UPDATE_LAST_SYNC_TIME";
      payload: { productId: string; timestamp: number };
    };

// Initial state
const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  lastSyncTime: {},
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_CART_ITEMS":
      // Set items from API with lastSyncedQuantity = quantity
      return {
        ...state,
        items: action.payload.map((item) => ({
          ...item,
          lastSyncedQuantity: item.quantity,
        })),
        isLoading: false,
        error: null,
      };

    case "ADD_ITEM_OPTIMISTIC": {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );

      if (existingIndex >= 0) {
        // Item exists - increment quantity
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
        return { ...state, items: newItems };
      } else {
        // New item - add to cart
        return {
          ...state,
          items: [...state.items, { ...action.payload, lastSyncedQuantity: 0 }],
        };
      }
    }

    case "UPDATE_LOCAL_QUANTITY": {
      const { productId, quantity } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        ),
      };
    }

    case "UPDATE_SYNCED_QUANTITY": {
      const { productId, quantity } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === productId
            ? { ...item, lastSyncedQuantity: quantity }
            : item
        ),
      };
    }

    case "UPDATE_LAST_SYNC_TIME": {
      return {
        ...state,
        lastSyncTime: {
          ...state.lastSyncTime,
          [action.payload.productId]: action.payload.timestamp,
        },
      };
    }

    case "REMOVE_ITEM_OPTIMISTIC":
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.payload),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
}

// Context
const CartContext = createContext<CartContextValue | undefined>(undefined);

// Provider Props
interface CartProviderProps {
  children: React.ReactNode;
}

/**
 * Cart Provider Component
 */
export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const debouncerRef = useRef(new CartDebouncer(600)); // 600ms debounce

  // Cleanup debouncer on unmount
  useEffect(() => {
    return () => {
      debouncerRef.current.cancelAll();
    };
  }, []);

  /**
   * Load cart items from API
   */
  const loadCartFromAPI = useCallback(async () => {
    console.log("[CartContext] loadCartFromAPI called");
    console.log("[CartContext] Checking localStorage tokens...");
    console.log(
      "[CartContext] accessToken:",
      localStorage.getItem("accessToken") ? "exists" : "missing"
    );
    console.log(
      "[CartContext] refreshToken:",
      localStorage.getItem("refreshToken") ? "exists" : "missing"
    );

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      console.log("[CartContext] Calling getCartItems()...");

      const response = await getCartItems();
      console.log("[CartContext] getCartItems() response:", response);

      const items: CartItem[] = response.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        image: item.image || "/placeholder-product.png",
        price: item.price,
        quantity: item.quantity,
        lastSyncedQuantity: item.quantity,
      }));

      console.log("[CartContext] Mapped items:", items);
      dispatch({ type: "SET_CART_ITEMS", payload: items });
      console.log(
        "[CartContext] Cart loaded successfully, items count:",
        items.length
      );
    } catch (error) {
      console.error("[CartContext] Error loading cart:", error);
      console.error(
        "[CartContext] Error details:",
        error instanceof Error ? error.message : error
      );
      dispatch({ type: "SET_ERROR", payload: "Failed to load cart" });
      toast.error("Không thể tải giỏ hàng");
    }
  }, []);

  /**
   * Add to cart - Optimistic update with immediate toast
   * Always sends quantity: 1, backend decides INSERT or UPDATE
   */
  const addToCart = useCallback(
    async (
      productId: string,
      productName: string,
      image: string,
      price: number
    ) => {
      // Optimistic update - update UI immediately
      const newItem: CartItem = {
        productId,
        productName,
        image: image || "/placeholder-product.png",
        price,
        quantity: 1,
        lastSyncedQuantity: 0,
      };

      dispatch({ type: "ADD_ITEM_OPTIMISTIC", payload: newItem });

      // Show success toast immediately (don't wait for API)
      toast.success(`Đã thêm ${productName} vào giỏ hàng`);

      // Call API in background (fire and forget)
      try {
        await addToCartAPI({ productId, quantity: 1 });
        // Update synced quantity after successful API call
        const currentItem = state.items.find(
          (item) => item.productId === productId
        );
        const newQuantity = currentItem ? currentItem.quantity + 1 : 1;
        dispatch({
          type: "UPDATE_SYNCED_QUANTITY",
          payload: { productId, quantity: newQuantity },
        });
      } catch (error) {
        console.error("[CartContext] Error adding to cart:", error);
        // Optionally: revert optimistic update or show error
        // For now, we keep the optimistic update
      }
    },
    [state.items]
  );

  /**
   * Update local quantity - Immediate UI update with debounced API sync
   * This is called when user clicks +/- on Cart page
   */
  const updateLocalQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      const item = state.items.find((i) => i.productId === productId);
      if (!item) return;

      // Enforce minimum quantity of 1
      const safeQuantity = Math.max(1, newQuantity);

      // Update local state immediately
      dispatch({
        type: "UPDATE_LOCAL_QUANTITY",
        payload: { productId, quantity: safeQuantity },
      });

      // Check if quantity actually changed from last synced value
      if (item.lastSyncedQuantity === safeQuantity) {
        // No change needed, cancel any pending sync
        debouncerRef.current.cancel(productId);
        return;
      }

      // Debounce API sync - only call after user stops changing quantity
      debouncerRef.current.debounce(productId, async () => {
        try {
          console.log(
            `[CartContext] Syncing quantity for ${productId}: ${safeQuantity}`
          );

          // Call API to sync quantity
          await syncQuantityUpdate(productId, safeQuantity);

          // Update lastSyncedQuantity after successful sync
          dispatch({
            type: "UPDATE_SYNCED_QUANTITY",
            payload: { productId, quantity: safeQuantity },
          });

          dispatch({
            type: "UPDATE_LAST_SYNC_TIME",
            payload: { productId, timestamp: Date.now() },
          });

          console.log(`[CartContext] Synced successfully for ${productId}`);
        } catch (error) {
          console.error("[CartContext] Error syncing quantity:", error);
          toast.error("Không thể cập nhật số lượng");
          // Optionally: revert to last synced quantity
        }
      });
    },
    [state.items]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(async (productId: string) => {
    // Cancel any pending sync for this item
    debouncerRef.current.cancel(productId);

    // Optimistic removal
    dispatch({ type: "REMOVE_ITEM_OPTIMISTIC", payload: productId });
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");

    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("[CartContext] Error removing item:", error);
      toast.error("Không thể xóa sản phẩm");
      // Optionally: revert optimistic update
    }
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    // Cancel all pending syncs
    debouncerRef.current.cancelAll();

    // Optimistic clear
    dispatch({ type: "CLEAR_CART" });
    toast.success("Đã xóa toàn bộ giỏ hàng");

    try {
      await clearAllCartItems();
    } catch (error) {
      console.error("[CartContext] Error clearing cart:", error);
      toast.error("Không thể xóa giỏ hàng");
    }
  }, []);

  // Computed values
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextValue = {
    cartItems: state.items,
    isLoading: state.isLoading,
    error: state.error,
    totalItems,
    totalPrice,
    addToCart,
    updateLocalQuantity,
    removeItem,
    clearCart,
    loadCartFromAPI,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to use cart context
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
