import { Product } from "../types";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useState } from "react";
import { addToCart as addToCartAPI } from "../services/cart.service";
import { toast } from "sonner";
import { AddToCartToast } from "./ui/AddToCartToast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const numericStock =
    typeof product.stock === "number"
      ? product.stock
      : product.stock != null
      ? Number(product.stock)
      : undefined;
  const stockValue =
    typeof numericStock === "number" && Number.isFinite(numericStock)
      ? numericStock
      : undefined;
  const isOutOfStock = typeof stockValue === "number" && stockValue <= 0;
  const isLowStock =
    typeof stockValue === "number" && stockValue > 0 && stockValue <= 5;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Store current product list page URL before navigating to product detail
  const handleProductNavigation = () => {
    // Save the current URL (with all query params) to sessionStorage
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem("lastProductsPage", currentUrl);
  };

  const handleAddToCart = async () => {
    if (isAdding) return;

    if (isOutOfStock) {
      toast.error("Sản phẩm hiện đã hết hàng", {
        duration: 2000,
        position: "top-center",
      });
      return;
    }

    setIsAdding(true);

    try {
      // Call API: POST /user/insertitems with productId and quantity: 1
      await addToCartAPI({
        productId: product.id,
        quantity: 1,
      });

      toast.custom(() => <AddToCartToast productName={product.name} />, {
        duration: 1000,
        position: "top-center",
      });
    } catch (error) {
      console.error("[ProductCard] Error adding to cart:", error);
      toast.error("Không thể thêm vào giỏ hàng", {
        duration: 2000,
        position: "top-center",
      });
    } finally {
      setTimeout(() => setIsAdding(false), 400);
    }
  };

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-border/50 group h-full flex flex-col">
        <Link
          to={`/product/${product.id}`}
          onClick={handleProductNavigation}
          className="aspect-[3/4] block overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative"
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-secondary text-secondary-foreground shadow-lg">
              {product.region}
            </Badge>
          </div>
          {isOutOfStock && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive">Hết hàng</Badge>
            </div>
          )}
          {!isOutOfStock && isLowStock && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-amber-500 text-white">
                Chỉ còn {stockValue} sp
              </Badge>
            </div>
          )}
          {/* rating removed per requirement */}
        </Link>
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="flex-1 text-lg line-clamp-2">
              <Link
                to={`/product/${product.id}`}
                onClick={handleProductNavigation}
                className="hover:underline"
              >
                {product.name}
              </Link>
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.category}
              </p>
              {typeof stockValue === "number" && (
                <p className="text-xs mt-1 text-muted-foreground">
                  {isOutOfStock
                    ? "Tạm thời hết hàng"
                    : `Còn ${stockValue} sản phẩm`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <div className="flex gap-2">
            <Link
              to={`/product/${product.id}`}
              onClick={handleProductNavigation}
              className="flex-1"
            >
              <Button
                className="w-full bg-secondary text-secondary-foreground shadow-md hover:opacity-95"
                variant="outline"
              >
                Xem chi tiết
              </Button>
            </Link>
            <motion.div
              className="flex-1"
              animate={
                isAdding
                  ? {
                      scale: [1, 0.9, 1.1, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md group-hover:shadow-lg transition-all"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isOutOfStock ? "Hết hàng" : "Thêm Vào Giỏ"}
              </Button>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
