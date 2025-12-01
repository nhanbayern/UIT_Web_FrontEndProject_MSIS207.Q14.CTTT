// =============================
// IMPORTS (luôn nằm ở đầu file)
// =============================
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../services/api";
import { addToCart as addToCartAPI } from "../services/cart.service";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ShoppingCart,
  Star,
  Package,
  Award,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { AddToCartToast } from "./ui/AddToCartToast";
import heroImg from "../assets/miennam/soctrang.JPG";
import "../styles/product-detail.css";

interface ProductDetailPageProps {
  onAddToCart?: (product: any) => void;
  onNavigate?: (page: string) => void;
}

// =============================
// COMPONENT CHÍNH – only one!
// =============================
export default function ProductDetailPage({
  onAddToCart,
  onNavigate,
}: ProductDetailPageProps) {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryId =
    typeof window !== "undefined"
      ? new URL(window.location.href).searchParams.get("id")
      : null;
  const productId = params?.id || queryId || null;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  /**
   * Smart back navigation with priority:
   * 1. sessionStorage lastProductsPage (highest priority)
   * 2. window.history.back() if internal navigation exists
   * 3. Default fallback to /products
   */
  const handleBackToProducts = () => {
    // Priority 1: Check sessionStorage for last products page
    const lastProductsPage = sessionStorage.getItem("lastProductsPage");

    if (lastProductsPage) {
      // User came from an internal product list page - navigate there
      console.log(
        "[Navigation] Returning to stored product list:",
        lastProductsPage
      );
      navigate(lastProductsPage);
      return;
    }

    // Priority 2: Try history.back() if we have internal history
    if (window.history.length > 1) {
      // Check if referrer is from same origin (internal navigation)
      const referrer = document.referrer;
      const currentOrigin = window.location.origin;

      if (referrer && referrer.startsWith(currentOrigin)) {
        console.log(
          "[Navigation] Using history.back() for internal navigation"
        );
        window.history.back();
        return;
      }
    }

    // Priority 3: Default fallback to /products
    console.log(
      "[Navigation] No stored page or internal history - defaulting to /products"
    );
    if (onNavigate) {
      onNavigate("products");
    } else {
      navigate("/products");
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        const p = await fetchProductById(String(productId));
        if (p) {
          // Normalize backend fields to frontend shape used by the UI
          // Backend may return `manufacturer_name` while UI reads `manufacturer`
          p.manufacturer =
            p.manufacturer ||
            p.manufacturer_name ||
            p.manufacturerName ||
            p.brand ||
            p.producer ||
            null;
          // Ensure price is a number for formatting
          if (typeof p.price === "string") {
            const n = parseFloat(String(p.price).replace(/,/g, ""));
            p.price = Number.isFinite(n) ? n : p.price;
          }
        }
        if (mounted) setProduct(p);
      } catch (e) {
        console.warn("Failed to load product", e);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handleAddToCart = async () => {
    console.log("[ProductDetailPage] handleAddToCart called", { product });

    if (!product) {
      console.error("[ProductDetailPage] No product to add");
      toast.error("Không tìm thấy sản phẩm");
      return;
    }

    const parsedStock =
      typeof product.stock === "number"
        ? product.stock
        : product.stock != null
        ? Number(product.stock)
        : null;
    const stockValue =
      typeof parsedStock === "number" && Number.isFinite(parsedStock)
        ? parsedStock
        : null;
    if (stockValue !== null && stockValue <= 0) {
      toast.error("Sản phẩm đã hết hàng", {
        duration: 2000,
        position: "top-center",
      });
      return;
    }

    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      // Call API: POST /user/insertitems with productId and quantity: 1
      console.log("[ProductDetailPage] Calling addToCartAPI with:", {
        productId: product.id,
        quantity: 1,
      });

      await addToCartAPI({
        productId: product.id,
        quantity: 1,
      });

      console.log("[ProductDetailPage] Successfully added to cart");

      toast.custom(() => <AddToCartToast productName={product.name} />, {
        duration: 1000,
        position: "top-center",
      });
    } catch (e) {
      console.error("[ProductDetailPage] Error adding to cart:", e);
      toast.error("Không thể thêm vào giỏ hàng", {
        duration: 2000,
        position: "top-center",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải sản phẩm…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const parsedStock =
    typeof product.stock === "number"
      ? product.stock
      : product.stock != null
      ? Number(product.stock)
      : null;
  const stockValue =
    typeof parsedStock === "number" && Number.isFinite(parsedStock)
      ? parsedStock
      : null;
  const isOutOfStock = stockValue !== null && stockValue <= 0;
  const isLowStock = stockValue !== null && stockValue > 0 && stockValue <= 5;

  return (
    <>
      {/* ===================== MAIN CONTENT BELOW HERO ===================== */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6 text-primary hover:bg-primary/5"
            onClick={handleBackToProducts}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách sản phẩm
          </Button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* IMAGE SECTION */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden border-border/50 shadow-xl sticky top-24">
                <CardContent className="p-0">
                  <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />

                    {isLowStock && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="destructive">
                          Chỉ còn {stockValue} sản phẩm
                        </Badge>
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="destructive">Hết hàng</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* INFO SECTION */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground">
                  {product.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {product.region}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold">{product.name}</h1>

              {/* ratings removed per request */}

              <div className="p-6 rounded-xl">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
                {stockValue !== null && (
                  <p className="text-sm mt-2">
                    {isOutOfStock
                      ? "Sản phẩm hiện đã hết hàng"
                      : `Còn ${stockValue} sản phẩm trong kho`}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Mô tả sản phẩm</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.long_description || product.description}
                </p>
              </div>

              <Separator />

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dung tích</p>
                      <p className="font-semibold">
                        {product.volume || "750ml"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Độ cồn</p>
                      <p className="font-semibold">
                        {product.abv || product.alcoholContent || "29-35%"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nhà sản xuất
                    </p>
                    <p className="font-semibold">
                      {product.manufacturer ||
                        product.brand ||
                        product.producer ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Xuất xứ</p>
                    <p className="font-semibold">
                      {product.origin || "Việt Nam"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Tình trạng</p>
                    <p className="font-semibold text-primary">
                      {isOutOfStock
                        ? "Hết hàng"
                        : stockValue !== null
                        ? `Còn ${stockValue} sản phẩm`
                        : "Đang cập nhật"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {isOutOfStock && (
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive">
                  Sản phẩm tạm thời hết hàng. Vui lòng chọn sản phẩm khác hoặc
                  quay lại sau.
                </div>
              )}

              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 shadow-lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
