import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ForgotPasswordEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: any) => {
    e?.preventDefault();
    if (!email) return toast.error("Vui lòng nhập email");
    setLoading(true);
    try {
      await api.forgotCheckEmail(email);
      toast.success("Mã OTP đã được gửi. Vui lòng kiểm tra email.");
      nav("/forgot/verify", { state: { email } });
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi mã OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập email để nhận mã đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
