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
import { useApp } from "../contexts/AppContext";

export default function SignUpVerifyPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const state = (loc.state || {}) as any;
  const { setAuthFromLogin } = useApp();

  const [email] = useState(state.email || "");
  const [name] = useState(state.name || "");
  const [phone] = useState(state.phone || "");
  const [password] = useState(state.password || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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
      const res = await api.verifyOtp(email, otp, name, password, phone);
      if (res && res.accessToken) {
        setAuthFromLogin?.(res.accessToken, res.user);
        toast.success("Đăng ký thành công");
        nav("/");
      } else {
        toast.error("Xác thực thất bại");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xác thực OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await api.resendOtp(email);
      toast.success("Mã OTP mới đã được gửi");
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi lại OTP");
    } finally {
      setResendLoading(false);
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Đang gửi..." : "Gửi lại"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
