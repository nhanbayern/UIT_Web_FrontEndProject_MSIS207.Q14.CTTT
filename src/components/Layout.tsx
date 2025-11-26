import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  const location = useLocation();

  // Nếu là trang Product Detail thì dùng navbar global với variant 'product'
  const isProductDetail = location.pathname.startsWith("/product/");

  return (
    <>
      <Navbar
        variant={isProductDetail ? "product" : "default"}
        transparent={false}
      />

      {/* Nếu navbar là fixed (product variant) thì main không cần top padding */}
      <main className={`site-main ${isProductDetail ? "" : "pt-20"}`}>
        <Outlet />
      </main>
    </>
  );
}
