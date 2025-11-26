import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import * as api from "../services/api";

export function SignInPage() {
  const { signIn, setAuthFromLogin } = useApp();
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [signUpSubmitting, setSignUpSubmitting] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      const ok = await signIn(signInData.email, signInData.password);
      if (ok) {
        toast.success("Đăng nhập thành công");
        navigate("/");
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu");
      }
    })();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // client-side validation
    if (!signUpData.name || signUpData.name.trim().length < 2) {
      toast.error("Vui lòng nhập họ tên hợp lệ");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    if (signUpData.password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    (async () => {
      if (signUpSubmitting) return;
      setSignUpSubmitting(true);
      try {
        await api.checkEmail(signUpData.email);
        // store signup data in history state and navigate to OTP verification
        navigate("/signup/verify", { state: { ...signUpData } });
        toast.success("Mã OTP đã được gửi. Vui lòng kiểm tra email.");
      } catch (err: any) {
        toast.error(err?.message || "Không thể gửi OTP");
      } finally {
        setSignUpSubmitting(false);
      }
    })();
  };

  const handleGoogleSignIn = () => {
    const url = api.getGoogleAuthUrl();
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    const popup = window.open(
      url,
      "google_oauth",
      `width=${width},height=${height},left=${left},top=${top}`
    );
    if (!popup) {
      toast.error(
        "Không thể mở cửa sổ đăng nhập Google. Vui lòng cho phép popup."
      );
      return;
    }

    toast.info("Mở cửa sổ Google để đăng nhập...");

    const expectedOrigin = new URL(api.getGoogleAuthUrl()).origin;

    const handleMessage = (e: MessageEvent) => {
      // Only accept messages from backend origin
      try {
        if (e.origin !== expectedOrigin) return;
      } catch (err) {
        // ignore
      }

      const data = e.data;
      // Expect { success: boolean, accessToken?, user?, message? }
      if (data && typeof data === "object") {
        if (data.success) {
          // Set auth in app context
          if (typeof setAuthFromLogin === "function") {
            setAuthFromLogin(data.accessToken, data.user);
          } else if (data.accessToken) {
            // fallback: call signIn indirectly by setting token if available
            api.setAccessToken(data.accessToken);
          }
          toast.success(data.message || "Đăng nhập thành công");
          navigate("/");
        } else {
          toast.error(data.message || "Đăng nhập Google thất bại");
        }
      } else {
        toast.error("Đã xảy ra lỗi khi nhận phản hồi từ Google");
      }

      window.removeEventListener("message", handleMessage);
      try {
        popup.close();
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("message", handleMessage);

    // If popup is closed by user without completing flow, notify after timeout
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener("message", handleMessage);
        toast.error("Cửa sổ Google đã bị đóng. Đăng nhập không hoàn tất.");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 4L8 12V28L20 36L32 28V12L20 4Z" fill="#8B1538" />
              <path d="M20 10L14 14V26L20 30L26 26V14L20 10Z" fill="#D4AF37" />
            </svg>
            <span className="text-3xl font-bold text-primary">Rượu Ông Tư</span>
          </div>
          <p className="text-muted-foreground">Chào mừng quay trở lại</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-white"
            >
              Đăng Nhập
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-white"
            >
              Đăng Ký
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Đăng Nhập Tài Khoản</CardTitle>
                <CardDescription>
                  Đăng nhập để trải nghiệm mua sắm tốt hơn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="email@example.com"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Mật khẩu</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({
                          ...signInData,
                          password: e.target.value,
                        })
                      }
                      required
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                      <span className="text-muted-foreground">
                        Ghi nhớ đăng nhập
                      </span>
                    </label>
                    <Button
                      variant="link"
                      type="button"
                      className="p-0 h-auto text-sm text-primary"
                      onClick={() => navigate("/forgot")}
                    >
                      Quên mật khẩu?
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                  >
                    Đăng Nhập
                  </Button>
                </form>

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-muted-foreground">
                    Hoặc đăng nhập với
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/50 hover:bg-muted/50"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Đăng nhập với Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Tạo Tài Khoản Mới</CardTitle>
                <CardDescription>Đăng ký để bắt đầu mua sắm</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Họ và tên</Label>
                    <Input
                      id="signup-name"
                      placeholder="Nguyễn Văn A"
                      value={signUpData.name}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, name: e.target.value })
                      }
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@example.com"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-phone">Số điện thoại</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="0912345678"
                      value={signUpData.phone}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, phone: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Mật khẩu</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          password: e.target.value,
                        })
                      }
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-confirm">Xác nhận mật khẩu</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="mt-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    disabled={signUpSubmitting}
                  >
                    {signUpSubmitting ? "Đang gửi..." : "Đăng Ký"}
                  </Button>
                </form>

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-muted-foreground">
                    Hoặc đăng ký với
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/50 hover:bg-muted/50"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Đăng ký với Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
