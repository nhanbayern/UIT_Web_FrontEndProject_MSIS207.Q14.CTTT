import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Order } from "../types";
import { getOrders } from "../services/api";
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
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { Separator } from "./ui/separator";

const defaultShippingAddress: Order["shippingAddress"] = {
  address_line: "N/A",
  ward: "",
  district: "",
  province: "",
  is_default: false,
};

const parseShippingAddress = (
  rawAddress: unknown
): Order["shippingAddress"] => {
  if (!rawAddress || typeof rawAddress !== "string") {
    return { ...defaultShippingAddress };
  }

  const parts = rawAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { ...defaultShippingAddress };
  }

  const [addressLine, ward, district, ...rest] = parts;
  return {
    address_line: addressLine || rawAddress.trim(),
    ward: ward || "",
    district: district || "",
    province: rest.join(", ") || "",
    is_default: false,
  };
};

const buildShippingLines = (address: Order["shippingAddress"]) => {
  const lines = [
    address.address_line,
    address.ward,
    address.district,
    address.province,
  ]
    .map((line) => line?.trim())
    .filter((line) => line && line !== "N/A");

  return lines.length > 0 ? lines : ["N/A"];
};

export function ManageOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform backend order data to frontend Order type
  const transformOrderData = (backendOrder: any): Order => {
    const statusMap: { [key: string]: Order["status"] } = {
      Preparing: "processing",
      "On delivery": "shipping",
      Delivered: "delivered",
    };

    const paymentMethodMap: { [key: string]: Order["paymentMethod"] } = {
      Cash: "cash",
    };

    const items =
      backendOrder.orderDetails?.map((detail: any) => {
        const quantity = detail.quantity || 1;
        const unitPrice =
          parseFloat(detail.unit_price) ||
          parseFloat(detail.product?.sale_price) ||
          parseFloat(detail.product?.price) ||
          0;
        const lineTotal =
          parseFloat(detail.total_price) || unitPrice * quantity;

        return {
          product: {
            id: String(detail.product?.product_id),
            name: detail.product?.product_name || "N/A",
            price: unitPrice,
            image: detail.product?.image || "",
            description:
              detail.product?.description ||
              detail.product?.short_description ||
              "",
            region: detail.product?.region || "",
            category: detail.product?.category || "",
          },
          quantity,
          unitPrice,
          lineTotal,
        };
      }) || [];

    const sortedItems = [...items].sort((a, b) => {
      const totalA = a.lineTotal ?? (a.unitPrice ?? 0) * a.quantity;
      const totalB = b.lineTotal ?? (b.unitPrice ?? 0) * b.quantity;
      return totalA - totalB;
    });

    return {
      id: String(backendOrder.order_id),
      orderCode: backendOrder.order_code || undefined,
      date: backendOrder.created_at || new Date().toISOString(),
      status: statusMap[backendOrder.order_status] || "processing",
      total: parseFloat(backendOrder.total_amount) || 0,
      customerName:
        backendOrder.recipient_name || backendOrder.customer?.name || "N/A",
      customerPhone:
        backendOrder.recipient_phone || backendOrder.customer?.phone || "N/A",
      paymentMethod: paymentMethodMap[backendOrder.payment_method] || "cash",
      shippingAddress: parseShippingAddress(backendOrder.shipping_address),
      items: sortedItems,
    };
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrders();

        // Check if response indicates authentication error
        if (
          response &&
          (response.error === "UNAUTHORIZED" || response.status === 401)
        ) {
          setError("Vui lòng đăng nhập để xem đơn hàng");
          navigate("/login");
          return;
        }

        // API returns { status: "success", data: [...] }
        const ordersData = response.data || response;
        if (Array.isArray(ordersData)) {
          const transformedOrders = ordersData.map(transformOrderData);
          setOrders(transformedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Không thể tải đơn hàng";
        setError(errMsg);
        setOrders([]);

        // Redirect to login if unauthorized
        if (errMsg.includes("401") || errMsg.includes("UNAUTHORIZED")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return "N/A";
    }
  };

  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return {
          label: "Đang Xử Lý",
          icon: Clock,
          color: "bg-yellow-500",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
        };
      case "shipping":
        return {
          label: "Đang Giao",
          icon: Truck,
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
        };
      case "delivered":
        return {
          label: "Đã Giao",
          icon: CheckCircle,
          color: "bg-green-500",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        };
      case "cancelled":
        return {
          label: "Đã Hủy",
          icon: XCircle,
          color: "bg-red-500",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        };
      default:
        return {
          label: "Không xác định",
          icon: Package,
          color: "bg-gray-500",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        };
    }
  };

  const filterOrders = (status?: Order["status"]) => {
    if (!Array.isArray(orders)) return [];
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const getOrderStats = () => {
    // Ensure orders is an array before calling filter/reduce
    if (!Array.isArray(orders)) {
      return {
        total: 0,
        processing: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
        totalSpent: 0,
      };
    }

    return {
      total: orders.length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipping: orders.filter((o) => o.status === "shipping").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    };
  };

  const stats = getOrderStats();

  const OrderCard = ({ order }: { order: Order }) => {
    const statusConfig = getStatusConfig(order.status);
    const displayOrderCode = order.orderCode || order.id;
    const shippingLines = buildShippingLines(order.shippingAddress);
    const StatusIcon = statusConfig.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`border-2 ${statusConfig.borderColor} hover:shadow-lg transition-all`}
        >
          <CardHeader
            className={`${statusConfig.bgColor} border-b ${statusConfig.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle style={{ fontSize: "1.125rem" }}>
                  Đơn hàng {displayOrderCode}
                </CardTitle>
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  style={{ fontSize: "0.875rem" }}
                >
                  <Calendar className="h-4 w-4" />
                  {formatDate(order.date)}
                </div>
              </div>
              <Badge
                className={`${statusConfig.color} flex items-center gap-2 px-3 py-1.5`}
              >
                <StatusIcon className="h-4 w-4" />
                {statusConfig.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-medium">Người nhận:</span>
                  <div className="text-muted-foreground">
                    <p>{order.customerName}</p>
                    {order.customerPhone && order.customerPhone !== "N/A" && (
                      <p className="text-xs text-muted-foreground/80">
                        {order.customerPhone}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center gap-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="font-medium">Thanh toán:</span>
                  <span className="text-muted-foreground">COD</span>
                </div>
              </div>
              <div className="space-y-2">
                <div
                  className="flex items-start gap-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Địa chỉ giao hàng:</p>
                    <p className="text-muted-foreground">
                      {shippingLines.map((line, index) => (
                        <span key={`${line}-${index}`}>
                          {line}
                          {index < shippingLines.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-3">
              <p
                className="font-semibold text-muted-foreground"
                style={{ fontSize: "0.875rem" }}
              >
                Sản phẩm ({order.items.length})
              </p>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const subtitle =
                    item.product.description?.trim() ||
                    [item.product.region, item.product.category]
                      .map((text) => text?.trim())
                      .filter(Boolean)
                      .join(" • ") ||
                    "Không có mô tả";
                  const lineTotal =
                    item.lineTotal ??
                    (item.unitPrice ?? item.product.price) * item.quantity;

                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0">
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium line-clamp-2"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {item.product.name}
                        </p>
                        <p
                          style={{ fontSize: "0.75rem" }}
                          className="text-muted-foreground mt-1 line-clamp-2"
                        >
                          {subtitle}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            style={{ fontSize: "0.875rem" }}
                            className="text-muted-foreground"
                          >
                            Số lượng: {item.quantity}
                          </span>
                          <span className="font-semibold text-primary">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "1.125rem" }} className="font-semibold">
                Tổng cộng:
              </span>
              <span
                style={{ fontSize: "1.875rem" }}
                className="font-bold text-primary"
              >
                {formatPrice(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily:
          '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Hero */}
      <section className="relative hero-bleed">
        <div className="relative w-full h-96 md:h-[80vh] overflow-hidden">
          <ImageWithFallback
            src="/src/assets/herotavan.jpg"
            alt="Quản Lý Đơn Hàng"
            className="vungmien-backgroundimage"
          />

          {/* Overlay chỉ phủ lên ảnh, không phủ toàn trang */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>

      {/* Content */}
      {/* Title block for page (visible heading at the top of content) */}
      <header className="southpage-header mx-auto px-6 mt-16 md:mt-28 max-w-3xl text-center">
        <h2 className="font-semibold mb-2 font-vl-edith responsive-title">
          Quản Lý Đơn Hàng
        </h2>
        <p
          style={{ fontSize: "1.125rem" }}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Theo dõi và quản lý đơn hàng của bạn
        </p>
      </header>

      {/* Statistics & Orders Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Statistics */}
        {!loading && (
          <>
            <div className="grid grid-cols-5 gap-4 mb-8">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                <CardContent className="responsive-py responsive-px text-center">
                  <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="responsive-stat-number font-bold text-primary">
                    {stats.total}
                  </p>
                  <p className="responsive-card-text text-muted-foreground">
                    Tổng đơn
                  </p>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                <CardContent className="responsive-py responsive-px text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="responsive-stat-number font-bold text-yellow-700">
                    {stats.processing}
                  </p>
                  <p className="responsive-card-text text-muted-foreground">
                    Đang xử lý
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="responsive-py responsive-px text-center">
                  <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="responsive-stat-number font-bold text-blue-700">
                    {stats.shipping}
                  </p>
                  <p className="responsive-card-text text-muted-foreground">
                    Đang giao
                  </p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="responsive-py responsive-px text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="responsive-stat-number font-bold text-green-700">
                    {stats.delivered}
                  </p>
                  <p className="responsive-card-text text-muted-foreground">
                    Đã giao
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-secondary/10 to-white">
                <CardContent className="responsive-py responsive-px text-center">
                  <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="responsive-stat-number font-bold text-primary">
                    {formatPrice(stats.totalSpent)}
                  </p>
                  <p className="responsive-card-text text-muted-foreground">
                    Tổng chi tiêu
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Orders Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Tất cả ({stats.total})
                </TabsTrigger>
                <TabsTrigger
                  value="processing"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                >
                  Đang xử lý ({stats.processing})
                </TabsTrigger>
                <TabsTrigger
                  value="shipping"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Đang giao ({stats.shipping})
                </TabsTrigger>
                <TabsTrigger
                  value="delivered"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Đã giao ({stats.delivered})
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  Đã hủy ({stats.cancelled})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <Package className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                      <p className="text-xl text-muted-foreground">
                        Chưa có đơn hàng nào
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="processing" className="space-y-6">
                {filterOrders("processing").map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {filterOrders("processing").length === 0 && (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <Clock className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                      <p className="text-xl text-muted-foreground">
                        Không có đơn hàng đang xử lý
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="shipping" className="space-y-6">
                {filterOrders("shipping").map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {filterOrders("shipping").length === 0 && (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <Truck className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                      <p className="text-xl text-muted-foreground">
                        Không có đơn hàng đang giao
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="delivered" className="space-y-6">
                {filterOrders("delivered").map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {filterOrders("delivered").length === 0 && (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <CheckCircle className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                      <p className="text-xl text-muted-foreground">
                        Không có đơn hàng đã giao
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-6">
                {filterOrders("cancelled").map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {filterOrders("cancelled").length === 0 && (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <XCircle className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                      <p className="text-xl text-muted-foreground">
                        Không có đơn hàng đã hủy
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
