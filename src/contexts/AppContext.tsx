import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { CartItem, Product, Order, User } from "../types";
import { fetchProducts, fetchProductsByRegionCorrect } from "../services/api";
import * as api from "../services/api";
import { toast } from "sonner";
import { CartToast } from "../components/ui/CartToast";

interface AppContextType {
  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  // User & Auth
  user: User;
  isLoggedIn: boolean;
  authChecked?: boolean;
  signIn: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<boolean>;
  setAuthFromLogin?: (token: string, user: any) => void;
  logout: () => Promise<void>;
  updateProfile: (updatedUser: User) => void;

  // Orders
  orders: Order[];
  placeOrder: (paymentMethod: "cash", shippingAddress: string) => void;

  // Products
  products: Product[];
  // pagination
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  loadProducts: (opts?: {
    page?: number;
    limit?: number;
    region?: string;
    category?: string;
    q?: string;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // initial load
    loadProducts({ page: 1, limit });
    // Try refresh token on mount to obtain access token and load profile.
    // Set `authChecked` when the initial attempt completes so ProtectedRoute
    // can avoid redirecting before we know the auth state.
    // Add small delay to prevent race conditions on page reload
    const timer = setTimeout(async () => {
      try {
        console.log("[AUTH DEBUG] Attempting initial refresh on mount");
        const r = await api.refresh();
        console.log("[AUTH DEBUG] Refresh response:", {
          hasAccessToken: !!r?.accessToken,
          response: r,
        });

        if (r && r.accessToken) {
          setAccessToken(r.accessToken);
          api.setAccessToken(r.accessToken);
          // fetch profile
          try {
            const prof = await api.getProfile();
            if (prof && prof.user) {
              setUser({
                id: prof.user.customer_id || prof.user.user_id || "",
                name: prof.user.customername || prof.user.username || "",
                email: prof.user.email || "",
                phone: prof.user.phone_number || "",
                avatar: prof.user.profileimage || prof.user.avatar || "",
              });
            }
            setIsLoggedIn(true);
            console.log("[AUTH DEBUG] Successfully authenticated user");
          } catch (e) {
            console.warn("Failed to load profile after refresh", e);
            // Still consider logged in if we have access token
            setIsLoggedIn(true);
          }
        } else {
          console.log(
            "[AUTH DEBUG] No access token in refresh response, user not logged in"
          );
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.log("[AUTH DEBUG] Refresh failed:", e);
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
        console.log("[AUTH DEBUG] Auth check completed");
      }
    }, 100); // Small delay to prevent race conditions

    return () => clearTimeout(timer);
  }, []);

  const loadProducts = async (
    opts: {
      page?: number;
      limit?: number;
      region?: string;
      category?: string;
      q?: string;
    } = {}
  ) => {
    const p = opts.page || 1;
    const l = opts.limit || limit || 10;
    try {
      // If region provided, call the dedicated region endpoint which returns a plain array
      if (opts.region) {
        const regionProducts = await fetchProductsByRegionCorrect(opts.region);
        if (Array.isArray(regionProducts)) {
          setProducts(regionProducts as any);
          setPage(1);
          setLimit(regionProducts.length || l);
          setTotalItems(regionProducts.length || 0);
          setTotalPages(1);
        } else {
          console.warn("Region endpoint did not return array", regionProducts);
          setProducts([]);
          setTotalItems(0);
          setTotalPages(0);
        }
        return;
      }

      // No region — use paginated endpoint
      const result = await fetchProducts({
        page: p,
        limit: l,
        category: opts.category,
        q: opts.q,
      });
      if (result && Array.isArray(result.products)) {
        setProducts(result.products);
        setPage(result.page || p);
        setLimit(result.limit || l);
        setTotalItems(result.totalItems || 0);
        setTotalPages(result.totalPages || 0);
      } else {
        console.warn("Unexpected products response", result);
        setProducts([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (e) {
      console.warn("Failed to load products", e);
      setProducts([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User>({
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyen.vana@email.com",
    phone: "0912345678",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  });

  const addToCart = (product: Product) => {
    console.log("[AppContext] addToCart called with:", product);

    const existingItem = cartItems.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      console.log("[AppContext] Product exists, updating quantity");
      setCartItems(
        cartItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      console.log("[AppContext] New product, adding to cart");
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }

    console.log("[AppContext] Cart updated, showing toast");
    // Show custom toast with animation
    toast.custom((t) => <CartToast productName={product.name} />, {
      duration: 1000,
      position: "top-right",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeItem(productId);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const signIn = async (email: string, password: string, remember = false) => {
    try {
      const data = await api.login(email, password);

      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        api.setAccessToken(data.accessToken);
        // prefer profile from login response, otherwise fetch profile
        if (data.user) {
          setUser({
            id: data.user.customer_id || data.user.user_id || "",
            name: data.user.customername || data.user.username || data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone_number || data.user.phone || "",
            avatar: data.user.profileimage || data.user.avatar || "",
          });
        } else {
          try {
            const prof = await api.getProfile();
            if (prof && prof.user) {
              setUser({
                id: prof.user.customer_id || prof.user.user_id || "",
                name: prof.user.customername || prof.user.username || "",
                email: prof.user.email || "",
                phone: prof.user.phone_number || "",
                avatar: prof.user.profileimage || prof.user.avatar || "",
              });
            }
          } catch (e) {
            console.warn("Failed to fetch profile after login", e);
          }
        }
        setIsLoggedIn(true);
        if (remember) localStorage.setItem("accessToken", data.accessToken);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  };

  const setAuthFromLogin = (token: string, userObj: any) => {
    setAccessToken(token);
    api.setAccessToken(token);
    if (userObj) {
      setUser({
        id: userObj.user_id || "",
        name: userObj.username || "",
        email: userObj.email || "",
        phone: userObj.phone_number || "",
        avatar: userObj.avatar || "",
      });
    }
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore network errors
    }
    setIsLoggedIn(false);
    setUser({ id: "", name: "", email: "", phone: "", avatar: "" });
    setAccessToken(null);
    api.clearAccessToken();
    localStorage.removeItem("accessToken");
  };

  const updateProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const placeOrder = (
    paymentMethod: "cash",
    shippingAddress: string
  ) => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const total = subtotal + 50000; // shipping fee

    const newOrder: Order = {
      id: `ORD${String(orders.length + 1).padStart(3, "0")}`,
      items: [...cartItems],
      total,
      status: "processing",
      paymentMethod,
      date: new Date().toISOString(),
      shippingAddress,
    };

    setOrders([newOrder, ...orders]);
    setCartItems([]);
  };

  return (
    <AppContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        user,
        isLoggedIn,
        signIn,
        setAuthFromLogin,
        logout,
        updateProfile,
        orders,
        placeOrder,
        products,
        page,
        limit,
        totalItems,
        totalPages,
        authChecked,
        loadProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
