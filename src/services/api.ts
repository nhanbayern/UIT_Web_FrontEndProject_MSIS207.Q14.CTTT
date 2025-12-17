import { Product } from "../types";

// Cấu hình API base URL. For local dev we prefer relative paths so Vite proxy
// can forward requests and cookies behave same-site. Set VITE_API_BASE_URL in
// production builds to a full origin if needed.
const RAW_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL ?? "";
const API_BASE_URL = RAW_BASE_URL.replace(/\/$/, "");
const CORS_BASE_ORIGIN = API_BASE_URL.replace(/\/RuouOngTu$/, "");

// Access token in-memory management (AppContext sẽ set/clear)
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function clearAccessToken() {
  accessToken = null;
}
export function getAccessToken() {
  return accessToken;
}

// Single-flight refresh helper. If a refresh is already in progress, callers
// will await the same promise instead of triggering parallel refreshes which
// can cause rotation/revocation races on the backend.
let refreshPromise: Promise<any> | null = null;
async function doRefresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: CORS_BASE_ORIGIN
        ? { "X-API-ORIGIN": CORS_BASE_ORIGIN }
        : undefined,
    });
    if (!refRes.ok) {
      throw refRes;
    }
    const json = await refRes.json();
    if (json.accessToken) setAccessToken(json.accessToken);
    refreshPromise = null;
    return json;
  })();
  try {
    return await refreshPromise;
  } catch (e) {
    refreshPromise = null;
    throw e;
  }
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers || {});
  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!headers.has("Content-Type") && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (CORS_BASE_ORIGIN && !headers.has("X-API-ORIGIN")) {
    headers.set("X-API-ORIGIN", CORS_BASE_ORIGIN);
  }
  const options: RequestInit = { ...init, headers, credentials: "include" };

  let res = await fetch(url, options);
  if (res.status === 401) {
    // attempt a single refresh and retry once
    try {
      const refJson = await doRefresh();
      if (refJson && refJson.accessToken) {
        headers.set("Authorization", `Bearer ${refJson.accessToken}`);
        res = await fetch(url, { ...options, headers });
        return res;
      }
    } catch (e) {
      // refresh failed; return original 401 or the refresh error
      if (e instanceof Response) return e;
      throw e;
    }
  }
  return res;
}

/* Auth helpers */
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw res;
  return res.json();
}

export async function refresh() {
  console.log(
    "[API DEBUG] Making refresh request to:",
    `${API_BASE_URL}/auth/refresh`
  );
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: CORS_BASE_ORIGIN
      ? { "X-API-ORIGIN": CORS_BASE_ORIGIN }
      : undefined,
  });
  console.log("[API DEBUG] Refresh response status:", res.status);
  if (!res.ok) {
    console.log("[API DEBUG] Refresh failed with status:", res.status);
    throw res;
  }
  const json = await res.json();
  console.log("[API DEBUG] Refresh response body:", json);
  return json;
}

export async function logout() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw res;
  return res.json();
}

// Return the Google OAuth start URL on the backend
export function getGoogleAuthUrl() {
  return `${API_BASE_URL}/customer/google`;
}

/* Registration / OTP */
export async function checkEmail(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function verifyOtp(
  email: string,
  otp: string,
  username?: string,
  password?: string,
  phone?: string
) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, otp, username, password, phone }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function resendOtp(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

/* Forgot password flow */
export async function forgotCheckEmail(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function forgotVerifyOtp(email: string, otp: string) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, otp }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function resetPassword(email: string, new_password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, new_password }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getProfile() {
  const response = await apiFetch("/customer/profile");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function updateUserProfile(payload: {
  username?: string;
  phone_number?: string;
  address?: string;
  avatar?: File;
}) {
  // If avatar is provided, use FormData for multipart upload
  let body: FormData | string;
  if (payload.avatar) {
    const formData = new FormData();
    if (payload.username) formData.append("username", payload.username);
    if (payload.phone_number) formData.append("phone_number", payload.phone_number);
    if (payload.address) formData.append("address", payload.address);
    formData.append("avatar", payload.avatar);
    body = formData;
  } else {
    // JSON payload for no avatar
    body = JSON.stringify(payload);
  }

  const response = await apiFetch("/customer/update", {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/* Customer addresses */
export async function getAddresses() {
  const response = await apiFetch("/customer/addresses");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function createAddress(payload: {
  address_line: string;
  ward?: string;
  district?: string;
  province?: string;
  is_default?: number;
}) {
  const response = await apiFetch("/customer/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await response.json();
  return response.json();
}

export async function deleteAddress(address_id: number) {
  const response = await apiFetch(`/customer/addresses/${address_id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw await response.json();
  return response.json();
}

export async function updateAddress(address_id: number, payload: any) {
  const response = await apiFetch(`/customer/addresses/${address_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await response.json();
  return response.json();
}

/* Products */
export interface FetchProductsOptions {
  page?: number;
  limit?: number;
  region?: string;
  category?: string;
  q?: string;
}

/**
 * Fetch products (paginated). Returns the raw paginated response from backend:
 * { page, limit, totalItems, totalPages, products: [...] }
 */
export async function fetchProducts(
  opts: FetchProductsOptions = { page: 1, limit: 10 }
): Promise<any> {
  const params = new URLSearchParams();
  if (opts.page) params.append("page", String(opts.page));
  if (opts.limit) params.append("limit", String(opts.limit));
  if (opts.region) params.append("region", opts.region);
  if (opts.category) params.append("category", opts.category);
  if (opts.q) params.append("q", opts.q);

  const url = "/products" + (params.toString() ? `?${params.toString()}` : "");

  const response = await apiFetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiFetch(`/products/${id}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function fetchProductsByRegion(
  region: string
): Promise<Product[]> {
  const response = await apiFetch(
    `/products?region=${encodeURIComponent(region)}`
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

/**
 * Correct region endpoint that returns a plain array (no pagination).
 * Use this when requesting products for a specific region: GET /products/region/{regionName}
 */
export async function fetchProductsByRegionCorrect(
  region: string
): Promise<Product[]> {
  const response = await apiFetch(
    `/products/region/${encodeURIComponent(region)}`
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function fetchProductsByCategory(
  category: string
): Promise<Product[]> {
  const response = await apiFetch(
    `/products?category=${encodeURIComponent(category)}`
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

/* Orders */
export interface CreateOrderPayload {
  items: Array<{ product_id: string; quantity: number }>;
  shipping_address_id?: number;
  shipping_address?: string;
  recipient_name: string;
  recipient_phone: string;
  payment_method: "Cash" | "OnlineBanking";
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await apiFetch("/orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}

export async function getOrders() {
  const response = await apiFetch("/orders");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function getOrderDetail(order_id: number) {
  const response = await apiFetch(`/orders/${order_id}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function updateOrderStatus(
  order_id: number,
  order_status: "Preparing" | "On delivery" | "Delivered"
) {
  const response = await apiFetch(`/orders/${order_id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_status }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function updatePaymentStatus(
  order_id: number,
  payment_status: "Unpaid" | "Paid"
) {
  const response = await apiFetch(`/orders/${order_id}/payment-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_status }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

/**
 * Cancel an order (only allowed when order status is "Preparing")
 * @param order_id - The ID of the order to cancel
 * @returns Promise with success message or error
 */
export async function cancelOrder(order_id: string | number) {
  const response = await apiFetch(`/orders/${order_id}/cancel`, {
    method: "PATCH",
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Throw error with backend message for proper error handling
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    (error as any).code = data.error;
    throw error;
  }
  
  return data;
}
