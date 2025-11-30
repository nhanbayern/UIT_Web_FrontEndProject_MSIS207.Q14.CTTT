import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

import { Badge } from "./ui/badge";
import { useApp } from "../contexts/AppContext";

export function Navbar({
  transparent = false,
  variant,
}: {
  transparent?: boolean;
  variant?: "default" | "transparent" | "product";
}) {
  const navRef = useRef<HTMLElement | null>(null);
  const { cartItems, isLoggedIn } = useApp();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Detect mobile based on aspect ratio: w/h < 16/9
  useEffect(() => {
    function checkAspectRatio() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const isMobileView = aspectRatio < 16 / 9;
      setIsMobile(isMobileView);
    }

    checkAspectRatio();
    window.addEventListener("resize", checkAspectRatio);

    return () => {
      window.removeEventListener("resize", checkAspectRatio);
    };
  }, []);

  useEffect(() => {
    function updateNavHeight() {
      const el = navRef.current;
      if (!el) return;
      const height = el.offsetHeight;

      // set CSS var cho tham chiếu khác (nếu cần)
      document.documentElement.style.setProperty(
        "--site-navbar-height",
        `${height}px`
      );

      const main = document.querySelector(
        "main.site-main"
      ) as HTMLElement | null;
      // Lấy computed style position thực tế của navbar
      const computedPos = window.getComputedStyle(el).position;

      if (main) {
        if (computedPos === "fixed") {
          main.style.paddingTop = `${height}px`;
        } else {
          // Nếu navbar không fixed thì remove padding-top
          main.style.paddingTop = "0px";
        }
      }
    }

    // chạy lần đầu
    updateNavHeight();
    // cập nhật khi resize
    window.addEventListener("resize", updateNavHeight);

    // optional: cập nhật khi DOM thay đổi kích thước nav (mutation observer)
    const ro = new ResizeObserver(() => updateNavHeight());
    if (navRef.current) ro.observe(navRef.current);

    return () => {
      window.removeEventListener("resize", updateNavHeight);
      ro.disconnect();
    };
  }, []);

  const isProductVariant = variant === "product";

  // choose container classes based on props
  const containerBase = "w-full py-2 md:py-4";

  const containerClass = transparent
    ? `${containerBase} bg-transparent fixed top-0 left-0`
    : isProductVariant
    ? `${containerBase} fixed top-0 left-0`
    : `${containerBase} bg-red-500 fixed top-0 left-0`;

  return (
    <nav
      ref={navRef}
      className={`site-navbar w-screen left-0 right-0 z-50 transition-all duration-300 ${
        transparent ? "navbar-transparent" : "navbar-default"
      } ${containerClass} px-0`}
      style={
        isProductVariant ? { backgroundColor: "var(--navbar-bg)" } : undefined
      }
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between w-full">
          {/* Mobile Hamburger Menu - Only when aspect ratio < 16/9 */}
          {isMobile && (
            <div className="relative group mr-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onMouseEnter={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>

              {mobileMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-64 !bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50"
                  style={{ backgroundColor: "#0f172a" }}
                  onMouseEnter={() => setMobileMenuOpen(true)}
                  onMouseLeave={() => setMobileMenuOpen(false)}
                >
                  <div className="flex flex-col py-2">
                    <Link
                      to="/"
                      className={`px-4 py-3 text-base font-medium transition-colors ${
                        location.pathname === "/"
                          ? "bg-white/10 text-secondary"
                          : "text-white/85 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Trang Chủ
                    </Link>
                    <Link
                      to="/about"
                      className={`px-4 py-3 text-base font-medium transition-colors ${
                        location.pathname === "/about"
                          ? "bg-white/10 text-secondary"
                          : "text-white/85 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Về Chúng Tôi
                    </Link>

                    <div className="px-4 py-2 border-t border-white/10 mt-1">
                      <p className="text-xs font-semibold text-white/60 mb-2">
                        Khám Phá
                      </p>
                      <div className="flex flex-col space-y-1">
                        <Link
                          to="/north"
                          className="px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:text-white rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Rượu Miền Bắc
                        </Link>
                        <Link
                          to="/central"
                          className="px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:text-white rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Rượu Miền Trung
                        </Link>
                        <Link
                          to="/south"
                          className="px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:text-white rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Rượu Miền Nam
                        </Link>
                        <Link
                          to="/highlands"
                          className="px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:text-white rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Đặc Sản Vùng Cao
                        </Link>
                      </div>
                    </div>

                    {isLoggedIn && (
                      <Link
                        to="/manageorders"
                        className={`px-4 py-3 text-base font-medium transition-colors border-t border-white/10 mt-1 ${
                          location.pathname === "/manageorders"
                            ? "bg-white/10 text-secondary"
                            : "text-white/85 hover:bg-white/5 hover:text-white"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Đơn Hàng
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div>
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight whitespace-nowrap">
                Rượu Ông Tư
              </span>
              <p className="hidden sm:block text-sm md:text-base text-white/85">
                Tinh Túy Hạt Gạo Quê Hương
              </p>
            </div>
          </Link>

          {/* Navigation Menu (centered) - Hidden on mobile (aspect ratio < 16/9) */}
          {!isMobile && (
            <div className="flex items-center gap-4 md:gap-8 flex-1 justify-center">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link
                      to="/"
                      className={`px-4 py-2 nav-item text-base md:text-lg font-medium transition-colors ${
                        location.pathname === "/"
                          ? "text-secondary"
                          : "text-white hover:text-secondary"
                      }`}
                    >
                      Trang Chủ
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link
                      to="/about"
                      className={`px-4 py-2 nav-item text-base md:text-lg font-medium transition-colors ${
                        location.pathname === "/about"
                          ? "text-secondary"
                          : "text-white hover:text-secondary"
                      }`}
                    >
                      Về Chúng Tôi
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-white hover:text-secondary nav-item text-base md:text-lg font-medium data-[state=open]:text-secondary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                      Khám phá
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[450px] gap-3 p-6">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/north"
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-primary/5 hover:shadow-sm w-full text-left group"
                            >
                              <div className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                Rượu Miền Bắc
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Rượu nếp, rượu cốm, rượu đế truyền thống
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>

                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/central"
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-primary/5 hover:shadow-sm w-full text-left group"
                            >
                              <div className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                Rượu Miền Trung
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Rượu gạo lứt, rượu men truyền thống
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>

                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/south"
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-primary/5 hover:shadow-sm w-full text-left group"
                            >
                              <div className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                Rượu Miền Nam
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Rượu chuối hột, rượu dừa, rượu sim Phú Quốc
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>

                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/highlands"
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-primary/5 hover:shadow-sm w-full text-left group"
                            >
                              <div className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                Đặc Sản Vùng Cao
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Rượu cần, rượu sâm, rượu táo mèo Tây Nguyên
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>

                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/products/all"
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-secondary/10 hover:shadow-sm w-full text-left border border-secondary/20 group"
                            >
                              <div className="text-xl font-semibold text-secondary-foreground group-hover:text-secondary transition-colors">
                                Xem Tất Cả Sản Phẩm →
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Khám phá toàn bộ bộ sưu tập rượu gạo Việt
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {isLoggedIn && (
                    <NavigationMenuItem>
                      <Link
                        to="/manageorders"
                        className={`px-4 py-2 nav-item text-base md:text-lg font-medium transition-colors ${
                          location.pathname === "/manageorders"
                            ? "text-secondary"
                            : "text-white hover:text-secondary"
                        }`}
                      >
                        Đơn Hàng
                      </Link>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Search - Hidden on mobile */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-white/10 text-white"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary text-secondary-foreground">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Sign In / Profile */}
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 text-white"
                asChild
              >
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              !isMobile && (
                <Button
                  asChild
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
                >
                  <Link to="/signin">Đăng Nhập</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
