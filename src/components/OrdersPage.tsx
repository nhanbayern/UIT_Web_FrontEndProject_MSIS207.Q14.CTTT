import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Calendar,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { Separator } from "./ui/separator";
import profileHero from "../assets/profile/Mù Cang Chải-363.jpg";
import { getCartItems } from "../services/cart.service";
import { CartItem } from "../types/cart.types";
import { useApp } from "../contexts/AppContext";

const RAW_IMAGE_BASE =
  (
    ((import.meta as any).env?.VITE_API_IMG_URL as string) ||
    "http://localhost:3000"
  ).trim() || "http://localhost:3000";
const IMAGE_BASE_URL = RAW_IMAGE_BASE.replace(/\/$/, "");

export function OrdersPage() {
  const navigate = useNavigate();
  const { authChecked, isLoggedIn } = useApp();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart items for checkout
  useEffect(() => {
    const loadCartItems = async () => {
      if (!authChecked) {
        console.log("[OrdersPage] Waiting for auth check...");
        return;
      }

      if (!isLoggedIn) {
        console.log("[OrdersPage] User not logged in");
        setIsLoading(false);
        return;
      }

      try {
        console.log("[OrdersPage] Loading cart items...");
        const response = await getCartItems();
        console.log("[OrdersPage] Cart items loaded:", response);
        console.log(
          "[OrdersPage] First item image:",
          response.items?.[0]?.image
        );
        setCartItems(response.items || []);
        setError(null);
      } catch (err) {
        console.error("[OrdersPage] Error loading cart:", err);
        setError("Không thể tải giỏ hàng");
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, [authChecked, isLoggedIn]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getImageUrl = (imageUrl: string) => {
    console.log("[OrdersPage] getImageUrl input:", imageUrl);
    if (!imageUrl) {
      console.log("[OrdersPage] imageUrl is empty, returning empty string");
      return "";
    }

    if (imageUrl.startsWith("http")) {
      const sanitized = imageUrl.replace(/\/RuouOngTu(?=\/uploads)/, "");
      console.log("[OrdersPage] absolute image, sanitized:", sanitized);
      return sanitized;
    }

    let normalized = imageUrl.trim();
    if (/^\/?RuouOngTu\//.test(normalized)) {
      normalized = normalized.replace(/^\/?RuouOngTu/, "");
    }
    if (!normalized.startsWith("/")) {
      normalized = `/${normalized}`;
    }

    if (normalized.startsWith("/uploads")) {
      const fullUrl = `${IMAGE_BASE_URL}${normalized}`;
      console.log("[OrdersPage] normalized upload path:", fullUrl);
      return fullUrl;
    }

    const fallback = `${IMAGE_BASE_URL}${normalized}`;
    console.log("[OrdersPage] fallback path used:", fallback);
    return fallback;
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily:
          '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Hero Section */}
      <section className="relative hero-bleed">
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <ImageWithFallback
            src={profileHero}
            alt="Orders hero"
            className="vungmien-backgroundimage"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>

      <div className="container mx-auto px-6 mt-16 md:mt-28 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Sản Phẩm Cần Thanh Toán
          </h1>
          <p className="text-muted-foreground">
            Xem lại giỏ hàng trước khi thanh toán
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-white">
            <CardContent className="px-2 py-3 text-center">
              <ShoppingCart className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-xl font-bold text-primary">{totalItems}</p>
              <p className="text-xs text-muted-foreground">Sản phẩm</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="px-2 py-3 text-center">
              <Package className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
              <p className="text-xl font-bold text-blue-700">
                {cartItems.length}
              </p>
              <p className="text-xs text-muted-foreground">Loại sản phẩm</p>
            </CardContent>
          </Card>
          <Card className="border border-primary/20 bg-gradient-to-br from-secondary/10 to-white">
            <CardContent className="px-2 py-3 text-center">
              <CreditCard className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-lg font-bold text-primary">
                {formatPrice(totalPrice)}
              </p>
              <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
            </CardContent>
          </Card>
        </div>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-primary/20 hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-white border-b border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Giỏ Hàng Của Bạn
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {cartItems.length} loại sản phẩm
                      </div>
                    </div>
                    <Badge className="bg-primary flex items-center gap-2 px-3 py-1.5">
                      <ShoppingCart className="h-4 w-4" />
                      {totalItems} sản phẩm
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    <p className="font-semibold text-sm text-muted-foreground">
                      Sản phẩm ({cartItems.length})
                    </p>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0">
                            <ImageWithFallback
                              src={getImageUrl(item.image)}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">
                              {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Đơn giá: {formatPrice(item.price)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-muted-foreground">
                                Số lượng: {item.quantity}
                              </span>
                              <span className="font-semibold text-primary">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <Separator />

                  {/* Checkout Button */}
                  <Button
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Tiến Hành Thanh Toán
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-20 text-center">
              <Package className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
              <p className="text-xl text-muted-foreground">
                Không có sản phẩm nào trong giỏ hàng
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
