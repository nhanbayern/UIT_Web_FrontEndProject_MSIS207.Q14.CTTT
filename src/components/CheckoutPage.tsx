import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import {
  CreditCard,
  Banknote,
  Wallet,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getCartItems } from "../services/cart.service";
import { createOrder } from "../services/api";
import { CartItem } from "../types/cart.types";
import heroTaVan from "../assets/herotavan.jpg";

const RAW_IMAGE_BASE =
  (
    ((import.meta as any).env?.VITE_API_IMG_URL as string) ||
    "http://localhost:3000"
  ).trim() || "http://localhost:3000";
const IMAGE_BASE_URL = RAW_IMAGE_BASE.replace(/\/$/, "");

export function CheckoutPage() {
  const navigate = useNavigate();
  const { authChecked, isLoggedIn } = useApp();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "ewallet">(
    "cash"
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState({
    address_line: "",
    ward: "",
    district: "",
    province: "",
    is_default: false,
  });

  // Load cart items
  useEffect(() => {
    const loadCartItems = async () => {
      if (!authChecked) {
        return;
      }

      if (!isLoggedIn) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getCartItems();
        setCartItems(response.items || []);
      } catch (err) {
        console.error("[CheckoutPage] Error loading cart:", err);
        toast.error("Không thể tải giỏ hàng");
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
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) {
      return imageUrl.replace(/\/RuouOngTu(?=\/uploads)/, "");
    }
    let normalized = imageUrl.trim();
    if (/^\/?RuouOngTu\//.test(normalized)) {
      normalized = normalized.replace(/^\/?RuouOngTu/, "");
    }
    if (!normalized.startsWith("/")) {
      normalized = `/${normalized}`;
    }
    if (normalized.startsWith("/uploads")) {
      return `${IMAGE_BASE_URL}${normalized}`;
    }
    return `${IMAGE_BASE_URL}${normalized}`;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 50000;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!customerName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!address.address_line.trim()) {
      toast.error("Vui lòng nhập địa chỉ chi tiết");
      return;
    }
    if (!address.ward.trim()) {
      toast.error("Vui lòng nhập phường/xã");
      return;
    }
    if (!address.district.trim()) {
      toast.error("Vui lòng nhập quận/huyện");
      return;
    }
    if (!address.province.trim()) {
      toast.error("Vui lòng nhập tỉnh/thành phố");
      return;
    }

    try {
      // Prepare order payload
      const items = cartItems.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      }));

      const payload = {
        items,
        shipping_address_id: 1, // TODO: Get actual address ID from user_address table
        payment_method: paymentMethod === "cash" ? "Cash" : "OnlineBanking",
      };

      // Call createOrder API
      const result = await createOrder(payload);
      console.log("[CheckoutPage] Order created:", result);

      toast.success(`Đặt hàng thành công! Mã đơn: ${result.order_code}`);

      // Clear cart and navigate to orders
      setTimeout(() => {
        navigate("/manageorders");
      }, 1500);
    } catch (error: any) {
      console.error("[CheckoutPage] Order creation failed:", error);

      // Handle specific error codes
      const errorCode = error?.error;
      const errorMessage = error?.message || "Không thể tạo đơn hàng";

      if (errorCode === "INSUFFICIENT_QUANTITY") {
        toast.error(
          `Không đủ hàng: ${error.product_name} (Chỉ còn ${error.available})`
        );
      } else if (errorCode === "PRODUCT_NOT_FOUND") {
        toast.error(`Sản phẩm không tồn tại`);
      } else if (errorCode === "INVALID_ADDRESS") {
        toast.error(`Địa chỉ không hợp lệ`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {/* Hero Section */}
      <section className="relative hero-bleed">
        <div className="relative w-full h-96 md:h-[80vh] overflow-hidden">
          <ImageWithFallback
            src={heroTaVan}
            alt="Thanh toán - Ta Van"
            className="vungmien-backgroundimage"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>

      {/* Header Content - positioned below hero with large spacing */}
      <header className="mx-auto px-6 py-20 md:py-32 max-w-3xl text-center bg-white">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 text-primary"
          style={{
            fontFamily: "Montserrat, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          Thanh Toán
        </h1>
        <p
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Hoàn tất đơn hàng và nhận sản phẩm tại nhà
        </p>
      </header>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container mx-auto px-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle
                      className="flex items-center gap-2 text-primary"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <User className="h-5 w-5" />
                      Thông Tin Người Nhận
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input
                          id="name"
                          placeholder="Nguyễn Văn A"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="0912345678"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle
                      className="flex items-center gap-2 text-primary"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <MapPin className="h-5 w-5" />
                      Địa Chỉ Giao Hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address_line">Địa chỉ chi tiết *</Label>
                      <Input
                        id="address_line"
                        placeholder="Số nhà, tên đường..."
                        value={address.address_line}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            address_line: e.target.value,
                          })
                        }
                        required
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ward">Phường/Xã *</Label>
                        <Input
                          id="ward"
                          placeholder="Phường 1"
                          value={address.ward}
                          onChange={(e) =>
                            setAddress({ ...address, ward: e.target.value })
                          }
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Input
                          id="district"
                          placeholder="Quận 1"
                          value={address.district}
                          onChange={(e) =>
                            setAddress({ ...address, district: e.target.value })
                          }
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                        <Input
                          id="province"
                          placeholder="TP. Hồ Chí Minh"
                          value={address.province}
                          onChange={(e) =>
                            setAddress({ ...address, province: e.target.value })
                          }
                          required
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="is_default"
                        checked={address.is_default}
                        onCheckedChange={(checked) =>
                          setAddress({
                            ...address,
                            is_default: checked as boolean,
                          })
                        }
                      />
                      <label
                        htmlFor="is_default"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Đặt làm địa chỉ mặc định
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle
                      className="flex items-center gap-2 text-primary"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <CreditCard className="h-5 w-5" />
                      Phương Thức Thanh Toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value as "cash" | "ewallet")
                      }
                    >
                      <div className="space-y-3">
                        {/* Cash on Delivery */}
                        <label
                          htmlFor="cash"
                          className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "cash"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="cash" id="cash" />
                          <Banknote className="h-6 w-6 text-primary" />
                          <div className="flex-1">
                            <p className="font-semibold">
                              Thanh toán khi nhận hàng (COD)
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Thanh toán bằng tiền mặt khi nhận hàng
                            </p>
                          </div>
                        </label>

                        {/* E-Wallet */}
                        <label
                          htmlFor="ewallet"
                          className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "ewallet"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="ewallet" id="ewallet" />
                          <Wallet className="h-6 w-6 text-primary" />
                          <div className="flex-1">
                            <p className="font-semibold">Ví điện tử</p>
                            <p className="text-sm text-muted-foreground">
                              Thanh toán qua MoMo, ZaloPay, VNPay
                            </p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <Card className="sticky top-24 border-border/50 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
                  <CardHeader>
                    <CardTitle
                      className="text-primary"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Đơn Hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex gap-3">
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
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-muted-foreground">
                                x{item.quantity}
                              </span>
                              <span className="font-semibold text-primary text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span className="font-medium">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">
                          Phí vận chuyển:
                        </span>
                        <span className="font-medium">
                          {formatPrice(shipping)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xl">
                        <span className="font-semibold">Tổng cộng:</span>
                        <span className="font-bold text-primary">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        background:
                          "linear-gradient(to right, #22581F, #2a6b26)",
                      }}
                    >
                      {paymentMethod === "cash"
                        ? "Đặt Hàng"
                        : "Thanh Toán Ngay"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary/20 hover:bg-primary/5"
                      onClick={() => navigate("/orders")}
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Quay Lại Giỏ Hàng
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
