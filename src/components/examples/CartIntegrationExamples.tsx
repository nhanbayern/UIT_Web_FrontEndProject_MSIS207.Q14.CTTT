/**
 * Example: How to integrate Cart functionality into ProductCard
 *
 * This shows how to add the "Add to Cart" button to any product card component
 */

import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "../contexts/CartContext";

interface ProductCardExampleProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

export function ProductCardExample({ product }: ProductCardExampleProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Call addToCart with product details
    // The function will:
    // 1. Update UI immediately (optimistic)
    // 2. Show toast notification
    // 3. Call API in background
    addToCart(product.id, product.name, product.image, product.price);
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString("vi-VN")} ₫</p>

      <Button onClick={handleAddToCart} className="w-full">
        <ShoppingCart className="w-4 h-4 mr-2" />
        Thêm Vào Giỏ
      </Button>
    </div>
  );
}

/**
 * Example: Integration in ProductDetailPage
 */
export function ProductDetailPageExample() {
  const { addToCart } = useCart();

  const product = {
    id: "P001",
    name: "Rượu Gạo Miền Bắc",
    image: "/images/product1.jpg",
    price: 450000,
  };

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <p>Giá: {product.price.toLocaleString("vi-VN")} ₫</p>

      <Button
        size="lg"
        onClick={() =>
          addToCart(product.id, product.name, product.image, product.price)
        }
        className="mt-4"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Thêm Vào Giỏ Hàng
      </Button>
    </div>
  );
}
