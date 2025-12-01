/**
 * Cart Page Component - Production Ready
 * Features:
 * - Real-time quantity updates with immediate API calls
 * - Manual quantity input with validation
 * - Optimistic UI updates
 * - Empty state handling
 * - Loading states
 * - Price calculations
 */

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CheckSquare,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useApp } from "../contexts/AppContext";
import {
  incrementByOne,
  decrementByOne,
  removeFromCart,
  updateCartItemQuantity,
} from "../services/cart.service";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import heroImg from "../assets/profile/Mù Cang Chải-363.jpg";

export function CartPage() {
  const navigate = useNavigate();
  const { authChecked, isLoggedIn } = useApp();
  const {
    cartItems,
    isLoading,
    totalItems,
    totalPrice,
    updateLocalQuantity,
    removeItem: removeItemFromContext,
    clearCart,
    loadCartFromAPI,
  } = useCart();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [editingQuantity, setEditingQuantity] = useState<{
    [productId: string]: string;
  }>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Debounce timers for quantity input - 1000ms (1 second)
  const debounceTimers = useRef<{ [productId: string]: NodeJS.Timeout }>({});
  const selectionInitializedRef = useRef(false);

  // Load cart on mount - ONLY after auth is checked
  useEffect(() => {
    console.log("[CartPage] Auth check status:", authChecked);
    console.log("[CartPage] Is logged in:", isLoggedIn);

    if (!authChecked) {
      console.log("[CartPage] Waiting for auth check to complete...");
      return;
    }

    if (!isLoggedIn) {
      console.log("[CartPage] User not logged in, skipping cart load");
      return;
    }

    console.log("[CartPage] Auth verified, calling loadCartFromAPI...");
    loadCartFromAPI();
  }, [authChecked, isLoggedIn, loadCartFromAPI]);

  useEffect(() => {
    console.log("[CartPage] Cart items updated:", cartItems);
    console.log("[CartPage] Total items:", totalItems);
    console.log("[CartPage] Is loading:", isLoading);
  }, [cartItems, totalItems, isLoading]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) =>
        clearTimeout(timer)
      );
    };
  }, []);

  // Sync selected items with cart contents (default select all on first load)
  useEffect(() => {
    setSelectedItems((prev) => {
      if (cartItems.length === 0) {
        selectionInitializedRef.current = false;
        return new Set();
      }

      const next = new Set<string>();
      cartItems.forEach((item) => {
        if (prev.has(item.productId)) {
          next.add(item.productId);
        }
      });

      const hasNewItems = cartItems.some((item) => !prev.has(item.productId));

      if (!selectionInitializedRef.current || hasNewItems) {
        cartItems.forEach((item) => {
          if (!prev.has(item.productId)) {
            next.add(item.productId);
          }
        });
      }

      if (!selectionInitializedRef.current && next.size === 0) {
        cartItems.forEach((item) => next.add(item.productId));
      }

      selectionInitializedRef.current = true;
      return next;
    });
  }, [cartItems]);

  // Handle manual quantity input with 1000ms debounce
  const handleQuantityChange = (productId: string, value: string) => {
    // Allow only numbers and empty string
    if (value === "" || /^\d+$/.test(value)) {
      setEditingQuantity((prev) => ({
        ...prev,
        [productId]: value,
      }));

      // Clear existing timer
      if (debounceTimers.current[productId]) {
        clearTimeout(debounceTimers.current[productId]);
      }

      // Set new timer for 1000ms debounce
      if (value !== "") {
        debounceTimers.current[productId] = setTimeout(() => {
          handleQuantityUpdate(productId, value);
        }, 1000);
      }
    } else {
      toast.error("Vui lòng chỉ nhập số!", {
        duration: 2000,
        position: "top-center",
      });
    }
  };

  // Handle quantity update after debounce
  const handleQuantityUpdate = async (productId: string, value: string) => {
    const newQuantity = parseInt(value, 10);

    if (isNaN(newQuantity) || newQuantity < 1) {
      toast.error("Số lượng phải là số dương và lớn hơn 0!", {
        duration: 2000,
        position: "top-center",
      });
      // Reset to current quantity
      setEditingQuantity((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }

    const currentItem = cartItems.find((item) => item.productId === productId);
    if (!currentItem) return;

    if (typeof currentItem.stock === "number" && currentItem.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng, vui lòng xóa khỏi giỏ hàng", {
        duration: 2000,
        position: "top-center",
      });
      setEditingQuantity((prev) => {
        const next = { ...prev };
        next[productId] = String(currentItem.quantity);
        return next;
      });
      return;
    }

    const maxQuantity =
      typeof currentItem.stock === "number" && currentItem.stock > 0
        ? currentItem.stock
        : undefined;
    const clampedQuantity = maxQuantity
      ? Math.min(newQuantity, maxQuantity)
      : newQuantity;

    if (maxQuantity && newQuantity > maxQuantity) {
      toast.info(`Chỉ còn ${maxQuantity} sản phẩm trong kho`, {
        duration: 2000,
        position: "top-center",
      });
    }

    // If quantity didn't change, just clear editing state
    if (clampedQuantity === currentItem.quantity) {
      setEditingQuantity((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }

    // Update quantity via API: PUT /user/cartitems/{productId}
    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      await updateCartItemQuantity(productId, clampedQuantity);
      updateLocalQuantity(productId, clampedQuantity);
      setEditingQuantity((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      toast.success(`Đã cập nhật số lượng thành ${clampedQuantity}`, {
        duration: 1500,
        position: "top-center",
      });
    } catch (error) {
      console.error("[CartPage] Update quantity failed:", error);
      toast.error("Không thể cập nhật số lượng", {
        duration: 2000,
        position: "top-center",
      });
      // Reset to current quantity
      setEditingQuantity((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Handle increment with immediate API call: POST /user/incrementby1/{productId}
  const handleIncrement = async (productId: string) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    if (typeof item.stock === "number") {
      if (item.stock <= 0) {
        toast.error("Sản phẩm đã hết hàng, vui lòng xóa khỏi giỏ hàng", {
          duration: 2000,
          position: "top-center",
        });
        return;
      }

      if (item.quantity >= item.stock) {
        toast.info(`Chỉ còn ${item.stock} sản phẩm trong kho`, {
          duration: 2000,
          position: "top-center",
        });
        return;
      }
    }

    // Optimistic update
    updateLocalQuantity(productId, item.quantity + 1);
    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const response = await incrementByOne(productId);
      console.log("[CartPage] Increment success:", response);
      // Update with server quantity if different
      if (response.item && response.item.quantity !== item.quantity + 1) {
        updateLocalQuantity(productId, response.item.quantity);
      }
    } catch (error) {
      console.error("[CartPage] Increment failed:", error);
      // Revert on error
      updateLocalQuantity(productId, item.quantity);
      toast.error("Không thể tăng số lượng", {
        duration: 2000,
        position: "top-center",
      });
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Handle decrement with immediate API call: POST /user/decrementby1/{productId}
  // If quantity is 1, call DELETE API instead
  const handleDecrement = async (productId: string) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    // If quantity is 1, remove the item instead
    if (item.quantity === 1) {
      await handleRemoveItem(productId);
      return;
    }

    // Optimistic update
    updateLocalQuantity(productId, item.quantity - 1);
    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const response = await decrementByOne(productId);
      console.log("[CartPage] Decrement success:", response);
      // Update with server quantity if different
      if (response.item && response.item.quantity !== item.quantity - 1) {
        updateLocalQuantity(productId, response.item.quantity);
      }
    } catch (error) {
      console.error("[CartPage] Decrement failed:", error);
      // Revert on error
      updateLocalQuantity(productId, item.quantity);
      toast.error("Không thể giảm số lượng", {
        duration: 2000,
        position: "top-center",
      });
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Handle remove item: DELETE /user/cartitems/{productId}
  const handleRemoveItem = async (productId: string) => {
    // Cancel any pending debounce timer
    if (debounceTimers.current[productId]) {
      clearTimeout(debounceTimers.current[productId]);
      delete debounceTimers.current[productId];
    }

    // Use CartContext's removeItem which handles API call + optimistic update
    await removeItemFromContext(productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => selectedItems.has(item.productId)),
    [cartItems, selectedItems]
  );
  const selectedTotalItems = selectedCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const selectedTotalPrice = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const allSelected =
    cartItems.length > 0 && selectedItems.size === cartItems.length;
  const partiallySelected =
    selectedItems.size > 0 && selectedItems.size < cartItems.length;

  const handleSelectItem = (productId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map((item) => item.productId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    navigate("/checkout", {
      state: {
        selectedProductIds: selectedCartItems.map((item) => item.productId),
      },
    });
  };

  // Empty cart state
  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative hero-bleed">
          <div className="relative w-full h-96 md:h-[80vh] overflow-hidden">
            <ImageWithFallback
              src={heroImg}
              alt="Giỏ hàng"
              className="vungmien-backgroundimage"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Giỏ Hàng</h1>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="py-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-primary" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Giỏ hàng trống
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>

              <Button
                onClick={() => navigate("/products/all")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
              >
                Khám Phá Sản Phẩm
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative hero-bleed">
          <div className="relative w-full h-96 md:h-[80vh] overflow-hidden">
            <ImageWithFallback
              src={heroImg}
              alt="Giỏ hàng"
              className="vungmien-backgroundimage"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Giỏ Hàng</h1>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative hero-bleed">
        <div className="relative w-full h-96 md:h-[80vh] overflow-hidden">
          <ImageWithFallback
            src={heroImg}
            alt="Giỏ hàng"
            className="vungmien-backgroundimage"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Giỏ Hàng ({totalItems} sản phẩm)
            </h1>
            {cartItems.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Đã chọn {selectedCartItems.length} / {cartItems.length} sản phẩm
              </p>
            )}
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa Tất Cả
            </Button>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-primary/30 bg-primary/5 shadow-sm">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="select-all"
                  checked={
                    allSelected
                      ? true
                      : partiallySelected
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    handleSelectAll(checked === true)
                  }
                  className="mt-1"
                />
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <label
                  htmlFor="select-all"
                  className="font-semibold text-primary cursor-pointer"
                >
                  Chọn tất cả sản phẩm
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Đánh dấu nhanh toàn bộ sản phẩm để thanh toán chỉ với một lần
                  nhấn
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => {
                const itemStock =
                  typeof item.stock === "number" ? item.stock : null;
                const isOutOfStock = itemStock !== null && itemStock <= 0;
                const isAtStockLimit =
                  itemStock !== null &&
                  itemStock > 0 &&
                  item.quantity >= itemStock;

                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Checkbox
                            checked={selectedItems.has(item.productId)}
                            onCheckedChange={(
                              checked: boolean | "indeterminate"
                            ) =>
                              handleSelectItem(item.productId, checked === true)
                            }
                            className="mt-2"
                          />
                          <div className="flex gap-6 flex-1">
                            {/* Product Image */}
                            <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <h3 className="mb-2 text-lg">
                                {item.productName}
                              </h3>
                              <p className="text-xl font-semibold text-primary mb-3">
                                {formatPrice(item.price)}
                              </p>
                              {itemStock !== null && (
                                <p
                                  className={`text-sm ${
                                    isOutOfStock
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {isOutOfStock
                                    ? "Sản phẩm đã hết hàng"
                                    : `Tồn kho: ${itemStock} sản phẩm`}
                                </p>
                              )}
                            </div>

                            {/* Quantity Controls & Remove */}
                            <div className="flex flex-col items-end gap-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleRemoveItem(item.productId)}
                                disabled={updatingItems.has(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>

                              <div className="flex items-center gap-2 border rounded-lg bg-white shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 hover:bg-primary/5"
                                  onClick={() =>
                                    handleDecrement(item.productId)
                                  }
                                  disabled={updatingItems.has(item.productId)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>

                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  value={
                                    editingQuantity[item.productId] !==
                                    undefined
                                      ? editingQuantity[item.productId]
                                      : item.quantity
                                  }
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.productId,
                                      e.target.value
                                    )
                                  }
                                  disabled={updatingItems.has(item.productId)}
                                  className="w-10 h-10 text-center font-medium border-0 p-0"
                                />

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 hover:bg-primary/5"
                                  onClick={() =>
                                    handleIncrement(item.productId)
                                  }
                                  disabled={
                                    updatingItems.has(item.productId) ||
                                    isOutOfStock ||
                                    isAtStockLimit
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {itemStock !== null && (
                                <p
                                  className={`text-xs text-right ${
                                    isOutOfStock
                                      ? "text-destructive"
                                      : isAtStockLimit
                                      ? "text-amber-600"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {isOutOfStock
                                    ? "Vui lòng xóa sản phẩm này"
                                    : isAtStockLimit
                                    ? "Đã đạt số lượng tối đa"
                                    : `Số lượng giỏ: ${item.quantity}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 border-border/50 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
              <CardContent className="p-8">
                <h3 className="mb-6 text-2xl">Tổng Đơn Hàng</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(selectedTotalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Số lượng:</span>
                    <span className="font-medium">
                      {selectedTotalItems} sản phẩm
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl">
                      <span className="font-semibold">Tổng cộng:</span>
                      <span className="font-bold text-primary">
                        {formatPrice(selectedTotalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg shadow-lg mb-3"
                  onClick={handleProceedToCheckout}
                  disabled={selectedCartItems.length === 0}
                >
                  Tiến Hành Thanh Toán
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/5"
                  onClick={() => navigate("/products/all")}
                >
                  Tiếp Tục Mua Sắm
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
