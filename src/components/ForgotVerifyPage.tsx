import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { toast } from "sonner";
import * as api from "../services/api";

export default function ForgotVerifyPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const state = (loc.state || {}) as any;
  const [email] = useState(state.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Thiếu email để xác thực OTP");
      nav("/signin");
    }
  }, [email]);

  const handleVerify = async (e: any) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await api.forgotVerifyOtp(email, otp);
      toast.success("Xác thực thành công. Vui lòng đặt mật khẩu mới.");
      nav("/forgot/reset", { state: { email } });
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xác thực OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.resendOtp(email);
      toast.success("Mã OTP mới đã được gửi");
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi lại OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Xác thực Email</CardTitle>
            <CardDescription>Nhập mã OTP đã gửi tới {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="otp">Mã OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Xác thực"}
                </Button>
                <Button type="button" variant="outline" onClick={handleResend}>
                  Gửi lại
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
