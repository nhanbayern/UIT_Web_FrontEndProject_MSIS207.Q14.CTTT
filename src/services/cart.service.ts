/**
 * Cart API Service
 * Handles all cart-related API calls with proper error handling
 */

import {
  CartAPIResponse,
  AddToCartRequest,
  AddToCartResponse,
} from "../types/cart.types";
import * as api from "./api";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL ?? "";

/**
 * Generic fetch wrapper with auth token and automatic retry with refresh
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log("[CartService] apiFetch called for:", endpoint);

  // Get access token from api service (in-memory)
  let token = api.getAccessToken();
  console.log(
    "[CartService] Access token from api service:",
    token ? "exists" : "null"
  );
  console.log("[CartService] Request URL:", `${API_BASE_URL}${endpoint}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // First attempt
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Important: send cookies for refresh token
  });

  console.log("[CartService] Response status:", response.status);
  console.log("[CartService] Response ok:", response.ok);

  // If 401, try to refresh access token and retry
  if (response.status === 401) {
    console.log("[CartService] Got 401, attempting to refresh token...");

    try {
      const refreshResult = await api.refresh();
      console.log("[CartService] Refresh successful:", refreshResult);

      if (refreshResult && refreshResult.accessToken) {
        // Set the token in api service for other calls
        api.setAccessToken(refreshResult.accessToken);
        token = refreshResult.accessToken;

        // Retry the request with new token
        headers["Authorization"] = `Bearer ${token}`;

        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });

        console.log("[CartService] Retry response status:", response.status);
      }
    } catch (refreshError) {
      console.error("[CartService] Refresh failed:", refreshError);
      throw new Error("Authentication failed - please login again");
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("[CartService] Response data:", data);
  return data;
}

/**
 * Get all cart items for authenticated user
 */
export async function getCartItems(): Promise<CartAPIResponse> {
  try {
    return await apiFetch<CartAPIResponse>("/customer/cartitems");
  } catch (error) {
    console.error("[CartService] Error fetching cart items:", error);
    throw error;
  }
}

/**
 * Add item to cart or update quantity (INSERT or UPDATE)
 * Backend handles the logic of insert vs update
 */
export async function addToCart(
  request: AddToCartRequest
): Promise<AddToCartResponse> {
  try {
    return await apiFetch<AddToCartResponse>("/customer/insertitems", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.error("[CartService] Error adding to cart:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(productId: string): Promise<void> {
  try {
    await apiFetch<void>(`/customer/cartitems/${productId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("[CartService] Error removing from cart:", error);
    throw error;
  }
}

/**
 * Clear all cart items
 */
export async function clearAllCartItems(): Promise<void> {
  try {
    await apiFetch<void>("/customer/cartitems", {
      method: "DELETE",
    });
  } catch (error) {
    console.error("[CartService] Error clearing cart:", error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  productId: string,
  quantity: number
): Promise<AddToCartResponse> {
  try {
    return await apiFetch<AddToCartResponse>(`/customer/cartitems/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  } catch (error) {
    console.error("[CartService] Error updating cart item quantity:", error);
    throw error;
  }
}

/**
 * Sync quantity update to backend
 * This is called by the debounced sync mechanism
 */
export async function syncQuantityUpdate(
  productId: string,
  quantity: number
): Promise<AddToCartResponse> {
  return updateCartItemQuantity(productId, quantity);
}

/**
 * Increment cart item quantity by 1
 */
export async function incrementByOne(
  productId: string
): Promise<AddToCartResponse> {
  try {
    return await apiFetch<AddToCartResponse>(
      `/customer/incrementby1/${productId}`,
      {
        method: "POST",
      }
    );
  } catch (error) {
    console.error("[CartService] Error incrementing quantity:", error);
    throw error;
  }
}

/**
 * Decrement cart item quantity by 1 (minimum 1)
 */
export async function decrementByOne(
  productId: string
): Promise<AddToCartResponse> {
  try {
    return await apiFetch<AddToCartResponse>(
      `/customer/decrementby1/${productId}`,
      {
        method: "POST",
      }
    );
  } catch (error) {
    console.error("[CartService] Error decrementing quantity:", error);
    throw error;
  }
}
