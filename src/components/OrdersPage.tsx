import { Order } from "../types";
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

interface OrdersPageProps {
  orders: Order[];
}

export function ManageOrdersPage({ orders }: OrdersPageProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
    }
  };

  const filterOrders = (status?: Order["status"]) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const getOrderStats = () => {
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
                <CardTitle className="text-lg">Đơn hàng #{order.id}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-medium">Người nhận:</span>
                  <span className="text-muted-foreground">
                    {order.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="font-medium">Thanh toán:</span>
                  <span className="text-muted-foreground">
                    {order.paymentMethod === "cash" ? "COD" : "Ví điện tử"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Địa chỉ giao hàng:</p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.address_line}
                      <br />
                      {order.shippingAddress.ward},{" "}
                      {order.shippingAddress.district}
                      <br />
                      {order.shippingAddress.province}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-3">
              <p className="font-semibold text-sm text-muted-foreground">
                Sản phẩm ({order.items.length})
              </p>
              <div className="space-y-3">
                {order.items.map((item) => (
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
                      <p className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.product.region} • {item.product.category}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          Số lượng: {item.quantity}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatPrice(item.product.price * item.quantity)}
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
                {formatPrice(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl text-primary mb-2">Quản Lý Đơn Hàng</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý đơn hàng của bạn
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Tổng đơn</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-yellow-700">
                {stats.processing}
              </p>
              <p className="text-sm text-muted-foreground">Đang xử lý</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-700">
                {stats.shipping}
              </p>
              <p className="text-sm text-muted-foreground">Đang giao</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-700">
                {stats.delivered}
              </p>
              <p className="text-sm text-muted-foreground">Đã giao</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-gradient-to-br from-secondary/10 to-white">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">
                {formatPrice(stats.totalSpent)}
              </p>
              <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
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
              orders.map((order) => <OrderCard key={order.id} order={order} />)
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
      </div>
    </div>
  );
}
