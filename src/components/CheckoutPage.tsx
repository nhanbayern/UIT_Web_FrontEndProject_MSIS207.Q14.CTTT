import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  CreditCard,
  Banknote,

  MapPin,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getCartItems } from "../services/cart.service";
import { createOrder, getAddresses } from "../services/api";
import type { CreateOrderPayload } from "../services/api";
import { CartItem } from "../types/cart.types";
import heroTaVan from "../assets/herotavan.jpg";

const RAW_IMAGE_BASE =
  (
    ((import.meta as any).env?.VITE_API_IMG_URL as string) ||
    "http://localhost:3000"
  ).trim() || "http://localhost:3000";
const IMAGE_BASE_URL = RAW_IMAGE_BASE.replace(/\/$/, "");

interface UserAddress {
  address_id: number;
  address_line: string;
  ward?: string;
  district?: string;
  province?: string;
  is_default?: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authChecked, isLoggedIn, user } = useApp();
  const accountPhone = (user?.phone || "").trim();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phoneOption, setPhoneOption] = useState<"account" | "custom">(
    accountPhone ? "account" : "custom"
  );
  const [customPhone, setCustomPhone] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [addressSelection, setAddressSelection] = useState<string>("new");
  const [address, setAddress] = useState({
    address_line: "",
    ward: "",
    district: "",
    province: "",
  });
  const selectedProductIds = useMemo(() => {
    const ids = (location.state as { selectedProductIds?: unknown })
      ?.selectedProductIds;
    if (!Array.isArray(ids)) return [];
    return ids
      .map((id) => (typeof id === "string" ? id.trim() : ""))
      .filter((id) => id.length > 0);
  }, [location.state]);

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
        const apiItems: CartItem[] = response.items || [];
        if (selectedProductIds.length > 0) {
          const filtered = apiItems.filter((item) =>
            selectedProductIds.includes(item.productId)
          );

          if (filtered.length === 0) {
            toast.error(
              "Các sản phẩm đã chọn không còn trong giỏ hàng, vui lòng chọn lại"
            );
            navigate("/cart");
            return;
          }

          if (filtered.length < selectedProductIds.length) {
            toast.info(
              "Một số sản phẩm đã bị xóa khỏi giỏ hàng, chỉ giữ sản phẩm còn lại"
            );
          }

          setCartItems(filtered);
        } else {
          setCartItems(apiItems);
        }
      } catch (err) {
        console.error("[CheckoutPage] Error loading cart:", err);
        toast.error("Không thể tải giỏ hàng");
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, [authChecked, isLoggedIn, navigate, selectedProductIds]);

  useEffect(() => {
    if (user?.name) {
      setCustomerName((prev) => (prev ? prev : user.name));
    }
  }, [user?.name]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!authChecked || !isLoggedIn) {
        return;
      }
      try {
        const result = await getAddresses();
        if (Array.isArray(result)) {
          setSavedAddresses(result);
          if (result.length > 0) {
            setAddressSelection(String(result[0].address_id));
          }
        }
      } catch (err) {
        console.error("[CheckoutPage] Error loading addresses:", err);
        toast.error("Không thể tải địa chỉ đã lưu");
      }
    };

    loadAddresses();
  }, [authChecked, isLoggedIn]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatAddressDisplay = (addr: {
    address_line: string;
    ward?: string;
    district?: string;
    province?: string;
  }) => {
    return [addr.address_line, addr.ward, addr.district, addr.province]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(", ");
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
  const shipping = cartItems.length > 0 ? 50000 : 0;
  const total = subtotal + shipping;
  const selectedSavedAddress = savedAddresses.find(
    (addr) => String(addr.address_id) === addressSelection
  );

  const handlePhoneOptionChange = (value: string) => {
    if (value === "account" && !accountPhone) {
      toast.error("Bạn chưa cập nhật số điện thoại trong hồ sơ");
      return;
    }
    setPhoneOption(value as "account" | "custom");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!customerName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }

    const effectivePhone =
      phoneOption === "account" ? accountPhone : customPhone.trim();
    if (!effectivePhone) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    const useNewAddress =
      addressSelection === "new" || savedAddresses.length === 0;

    if (useNewAddress) {
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
    } else if (!selectedSavedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Không có sản phẩm nào để đặt hàng");
      return;
    }

    try {
      // Prepare order payload
      const items = cartItems.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      }));

      const payload: CreateOrderPayload = {
        items,
        payment_method: "Cash",
        recipient_name: customerName.trim(),
        recipient_phone: effectivePhone,
        ...(useNewAddress
          ? {
              shipping_address: formatAddressDisplay({
                address_line: address.address_line.trim(),
                ward: address.ward.trim(),
                district: address.district.trim(),
                province: address.province.trim(),
              }),
            }
          : {
              shipping_address_id: Number(selectedSavedAddress.address_id),
            }),
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
                    <div className="space-y-3">
                      <Label>Số điện thoại *</Label>
                      <RadioGroup
                        value={phoneOption}
                        onValueChange={handlePhoneOptionChange}
                        className="space-y-3"
                      >
                        <label
                          htmlFor="phone-account"
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            phoneOption === "account"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } ${
                            !accountPhone ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          <RadioGroupItem
                            value="account"
                            id="phone-account"
                            disabled={!accountPhone}
                          />
                          <div>
                            <p className="font-medium">
                              Sử dụng số điện thoại tài khoản
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {accountPhone || "Chưa cập nhật số điện thoại"}
                            </p>
                          </div>
                        </label>
                        <label
                          htmlFor="phone-custom"
                          className={`flex flex-col gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            phoneOption === "custom"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="custom" id="phone-custom" />
                            <p className="font-medium">Nhập số khác</p>
                          </div>
                          <Input
                            type="tel"
                            placeholder="0912345678"
                            value={customPhone}
                            onChange={(e) => setCustomPhone(e.target.value)}
                            disabled={phoneOption !== "custom"}
                          />
                        </label>
                      </RadioGroup>
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
                    {savedAddresses.length > 0 && (
                      <div className="space-y-2">
                        <Label>Chọn địa chỉ đã lưu</Label>
                        <Select
                          value={addressSelection}
                          onValueChange={(value) => setAddressSelection(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn địa chỉ" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedAddresses.map((saved) => (
                              <SelectItem
                                key={saved.address_id}
                                value={String(saved.address_id)}
                              >
                                {saved.is_default ? "Mặc định • " : ""}
                                {formatAddressDisplay(saved)}
                              </SelectItem>
                            ))}
                            <SelectItem value="new">
                              + Thêm địa chỉ mới
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {addressSelection !== "new" && selectedSavedAddress && (
                          <p className="text-sm text-muted-foreground">
                            {formatAddressDisplay(selectedSavedAddress)}
                          </p>
                        )}
                      </div>
                    )}

                    {(addressSelection === "new" ||
                      savedAddresses.length === 0) && (
                      <>
                        <div>
                          <Label htmlFor="address_line">
                            Địa chỉ chi tiết *
                          </Label>
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
                                setAddress({
                                  ...address,
                                  district: e.target.value,
                                })
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
                                setAddress({
                                  ...address,
                                  province: e.target.value,
                                })
                              }
                              required
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {savedAddresses.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Bạn chưa có địa chỉ lưu. Vui lòng nhập địa chỉ mới.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method - COD Only */}
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
                    <div className="flex items-center space-x-4 p-4 rounded-lg border-2 border-primary bg-primary/5">
                      <Banknote className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">
                          Thanh toán khi nhận hàng (COD)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </p>
                      </div>
                    </div>
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
                      disabled={submitting}
                      className="w-full text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        background:
                          "linear-gradient(to right, #22581F, #2a6b26)",
                      }}
                    >
                      {submitting ? "Đang xử lý..." : "Đặt Hàng"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary/20 hover:bg-primary/5"
                      onClick={() => navigate("/cart")}
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
