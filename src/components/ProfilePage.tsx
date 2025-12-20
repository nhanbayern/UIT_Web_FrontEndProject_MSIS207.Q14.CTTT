import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import profileHero from "../assets/profile/Mù Cang Chải-363.jpg";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Camera, Mail, Phone, User as UserIcon, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import {
  getAddresses,
  createAddress,
  deleteAddress,
  updateAddress,
} from "../services/api";
import {
  useVietnamAddress,
  concatenateAddress,
} from "../hooks/useVietnamAddress";

export function ProfilePage() {
  const { user, orders, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar || "",
  });

  // Sync formData when user changes
  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || "",
    });
  }, [user]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [addrForm, setAddrForm] = useState({
    address_line: "",
    provinceCode: "",
    provinceName: "",
    districtCode: "",
    districtName: "",
    wardCode: "",
    wardName: "",
    note: "",
    is_default: 0,
  });
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Vietnam address hook
  const {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    loadDistricts,
    loadWards,
    resetDistricts,
    resetWards,
  } = useVietnamAddress();

  useEffect(() => {
    // load addresses when component mounts
    (async () => {
      try {
        setLoadingAddresses(true);
        const res = await getAddresses();
        // Expecting array
        if (Array.isArray(res)) setAddresses(res);
        else if (res && Array.isArray(res.data)) setAddresses(res.data);
      } catch (e) {
        console.warn("Failed to load addresses", e);
      } finally {
        setLoadingAddresses(false);
      }
    })();
  }, []);

  // Handle province change
  const handleProvinceChange = (value: string) => {
    const province = provinces.find((p) => p.code.toString() === value);
    if (province) {
      setAddrForm({
        ...addrForm,
        provinceCode: province.code.toString(),
        provinceName: province.name,
        districtCode: "",
        districtName: "",
        wardCode: "",
        wardName: "",
      });
      resetDistricts();
      loadDistricts(province.code);
    }
  };

  // Handle district change
  const handleDistrictChange = (value: string) => {
    const district = districts.find((d) => d.code.toString() === value);
    if (district) {
      setAddrForm({
        ...addrForm,
        districtCode: district.code.toString(),
        districtName: district.name,
        wardCode: "",
        wardName: "",
      });
      resetWards();
      loadWards(district.code);
    }
  };

  // Handle ward change
  const handleWardChange = (value: string) => {
    const ward = wards.find((w) => w.code.toString() === value);
    if (ward) {
      setAddrForm({
        ...addrForm,
        wardCode: ward.code.toString(),
        wardName: ward.name,
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        username: formData.name,
        phone_number: formData.phone,
      };
      
      if (avatarFile) {
        payload.avatar = avatarFile;
      }
      
      // Call API to update profile
      const { updateUserProfile } = await import("../services/api");
      const response = await updateUserProfile(payload);
      
      // Update context with new data
      updateProfile({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: response.profileimage || formData.avatar,
      });
      
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate statistics
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero (behind navbar) */}
      <section className="relative hero-bleed">
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <ImageWithFallback
            src={profileHero}
            alt="Profile hero"
            className="vungmien-backgroundimage"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-16 md:mt-28 py-8">
        <h1 className="mb-8">Tài Khoản Của Tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={avatarPreview || formData.avatar} 
                        className="object-cover"
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                          type="button"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <h3 className="mb-1">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng Xuất
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Thống Kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tổng đơn hàng:
                  </span>
                  <span>{totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Đã hoàn thành:
                  </span>
                  <span>{completedOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tổng chi tiêu:
                  </span>
                  <span className="text-red-700">
                    {formatPrice(totalSpent)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Hồ Sơ</TabsTrigger>
                <TabsTrigger value="history">Lịch Sử Mua Hàng</TabsTrigger>
                <TabsTrigger value="addresses">Địa chỉ nhận hàng</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Thông Tin Cá Nhân</CardTitle>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          Chỉnh Sửa
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Họ và tên</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex gap-3 pt-4">
                            <Button
                              type="submit"
                              className="bg-red-700 hover:bg-red-800"
                            >
                              Lưu Thay Đổi
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                  name: user.name,
                                  email: user.email,
                                  phone: user.phone,
                                  avatar: user.avatar || "",
                                });
                              }}
                            >
                              Hủy
                            </Button>
                          </div>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch Sử Mua Hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="border-b pb-4 last:border-0"
                          >
                            <div className="flex justify-between mb-2">
                              <span>Đơn hàng #{order.id}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(order.date).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {order.items.length} sản phẩm
                              </span>
                              <span className="text-red-700">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Chưa có lịch sử mua hàng
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <Card>
                  <CardHeader>
                    <CardTitle>Địa chỉ nhận hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          
                          // Validation
                          if (!addrForm.address_line.trim()) {
                            toast.error("Vui lòng nhập địa chỉ chi tiết");
                            return;
                          }
                          if (!addrForm.provinceCode) {
                            toast.error("Vui lòng chọn Tỉnh/Thành phố");
                            return;
                          }
                          if (!addrForm.districtCode) {
                            toast.error("Vui lòng chọn Quận/Huyện");
                            return;
                          }
                          if (!addrForm.wardCode) {
                            toast.error("Vui lòng chọn Phường/Xã");
                            return;
                          }
                          
                          try {
                            // Concatenate full address
                            const fullAddress = concatenateAddress(
                              addrForm.address_line,
                              addrForm.wardName,
                              addrForm.districtName,
                              addrForm.provinceName
                            );
                            
                            // Prepare payload for backend (keeping old structure)
                            const payload = {
                              address_line: addrForm.address_line,
                              ward: addrForm.wardName,
                              district: addrForm.districtName,
                              province: addrForm.provinceName,
                              is_default: addrForm.is_default,
                            };
                            
                            await createAddress(payload);
                            toast.success("Đã thêm địa chỉ");
                            
                            // Refresh list
                            const res = await getAddresses();
                            setAddresses(
                              Array.isArray(res) ? res : res.data || []
                            );
                            
                            // Reset form
                            setAddrForm({
                              address_line: "",
                              provinceCode: "",
                              provinceName: "",
                              districtCode: "",
                              districtName: "",
                              wardCode: "",
                              wardName: "",
                              note: "",
                              is_default: 0,
                            });
                            resetDistricts();
                          } catch (err: any) {
                            console.error(err);
                            toast.error(
                              err && err.message
                                ? err.message
                                : "Lỗi khi thêm địa chỉ"
                            );
                          }
                        }}
                      >
                        <div className="space-y-4">
                          {/* Address Line */}
                          <div>
                            <Label htmlFor="address_line">
                              Địa chỉ chi tiết (Số nhà, đường) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="address_line"
                              placeholder="Ví dụ: 123 Nguyễn Văn Linh"
                              value={addrForm.address_line}
                              onChange={(e) =>
                                setAddrForm({
                                  ...addrForm,
                                  address_line: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Province */}
                          <div>
                            <Label htmlFor="province">
                              Tỉnh / Thành phố <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={addrForm.provinceCode}
                              onValueChange={handleProvinceChange}
                              disabled={loadingProvinces}
                            >
                              <SelectTrigger id="province">
                                <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                              </SelectTrigger>
                              <SelectContent>
                                {provinces.map((province) => (
                                  <SelectItem
                                    key={province.code}
                                    value={province.code.toString()}
                                  >
                                    {province.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* District */}
                          <div>
                            <Label htmlFor="district">
                              Quận / Huyện <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={addrForm.districtCode}
                              onValueChange={handleDistrictChange}
                              disabled={
                                !addrForm.provinceCode || loadingDistricts
                              }
                            >
                              <SelectTrigger id="district">
                                <SelectValue placeholder="Chọn Quận/Huyện" />
                              </SelectTrigger>
                              <SelectContent>
                                {districts.map((district) => (
                                  <SelectItem
                                    key={district.code}
                                    value={district.code.toString()}
                                  >
                                    {district.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Ward */}
                          <div>
                            <Label htmlFor="ward">
                              Phường / Xã <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={addrForm.wardCode}
                              onValueChange={handleWardChange}
                              disabled={!addrForm.districtCode || loadingWards}
                            >
                              <SelectTrigger id="ward">
                                <SelectValue placeholder="Chọn Phường/Xã" />
                              </SelectTrigger>
                              <SelectContent>
                                {wards.map((ward) => (
                                  <SelectItem
                                    key={ward.code}
                                    value={ward.code.toString()}
                                  >
                                    {ward.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Note */}
                          <div>
                            <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
                            <Textarea
                              id="note"
                              placeholder="Ví dụ: Giao hàng giờ hành chính"
                              value={addrForm.note}
                              onChange={(e) =>
                                setAddrForm({
                                  ...addrForm,
                                  note: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>

                          {/* Is Default Checkbox */}
                          <div className="flex items-center gap-3">
                            <input
                              id="is_default"
                              type="checkbox"
                              checked={addrForm.is_default === 1}
                              onChange={(e) =>
                                setAddrForm({
                                  ...addrForm,
                                  is_default: e.target.checked ? 1 : 0,
                                })
                              }
                            />
                            <Label htmlFor="is_default">Đặt làm mặc định</Label>
                          </div>

                          {/* Submit Button */}
                          <div className="pt-2">
                            <Button
                              type="submit"
                              className="bg-red-700 hover:bg-red-800"
                              disabled={
                                !addrForm.address_line.trim() ||
                                !addrForm.provinceCode ||
                                !addrForm.districtCode ||
                                !addrForm.wardCode
                              }
                            >
                              Thêm địa chỉ
                            </Button>
                          </div>
                        </div>
                      </form>

                      <div>
                        <h4 className="mb-3">Danh sách địa chỉ</h4>
                        {loadingAddresses ? (
                          <p>Đang tải...</p>
                        ) : addresses.length === 0 ? (
                          <p className="text-muted-foreground">
                            Chưa có địa chỉ
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {addresses.map((a) => (
                              <div
                                key={a.address_id}
                                className="border p-3 rounded flex justify-between items-start"
                              >
                                <div>
                                  <div className="font-medium">
                                    {a.address_line}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {[a.ward, a.district, a.province]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </div>
                                  {a.address_code && (
                                    <div className="text-xs text-muted-foreground">
                                      Mã: {a.address_code}
                                    </div>
                                  )}
                                  {a.is_default === 1 && (
                                    <div className="text-sm text-green-700">
                                      Mặc định
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    onClick={async () => {
                                      try {
                                        await updateAddress(a.address_id, {
                                          is_default: 1,
                                        });
                                        const res = await getAddresses();
                                        setAddresses(
                                          Array.isArray(res)
                                            ? res
                                            : res.data || []
                                        );
                                        toast.success("Đã đặt mặc định");
                                      } catch (err) {
                                        console.error(err);
                                        toast.error("Lỗi");
                                      }
                                    }}
                                  >
                                    Đặt mặc định
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      if (
                                        !confirm(
                                          "Bạn có chắc muốn xóa địa chỉ này?"
                                        )
                                      )
                                        return;
                                      try {
                                        await deleteAddress(a.address_id);
                                        const res = await getAddresses();
                                        setAddresses(
                                          Array.isArray(res)
                                            ? res
                                            : res.data || []
                                        );
                                        toast.success("Đã xóa");
                                      } catch (err) {
                                        console.error(err);
                                        toast.error("Xóa thất bại");
                                      }
                                    }}
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
