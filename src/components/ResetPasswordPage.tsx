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

export default function ResetPasswordPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const state = (loc.state || {}) as any;
  const [email] = useState(state.email || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Thiếu email để đặt lại mật khẩu");
      nav("/signin");
    }
  }, [email]);

  const handleSubmit = async (e: any) => {
    e?.preventDefault();
    if (password.length < 8)
      return toast.error("Mật khẩu phải có ít nhất 8 ký tự");
    if (password !== confirm)
      return toast.error("Mật khẩu xác nhận không khớp");
    setLoading(true);
    try {
      await api.resetPassword(email, password);
      toast.success("Mật khẩu đã được cập nhật");
      nav("/signin");
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>Đặt mật khẩu mới cho {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Mật khẩu mới</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
