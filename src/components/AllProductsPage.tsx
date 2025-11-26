import { ImageWithFallback } from "./figma/ImageWithFallback";
import backgroundImage from "../assets/Mù Cang Chải-483.jpg";
import { ProductsPage } from "./ProductsPage";

export function AllProductsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative hero-bleed bg-white">
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <ImageWithFallback
            src={backgroundImage}
            alt="Tất cả sản phẩm"
            className="vungmien-backgroundimage"
          />
        </div>

        <div className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-vl-edith md:text-4xl font-bold mb-6">
            Lưu trữ giá trị từ Hạt Ngọc Vàng
          </h1>
          <p className="mb-6 text-muted-foreground">
            Khám phá toàn bộ bộ sưu tập tinh hoa từ nhà phân phối Rượu Ông Tư,
            nơi lưu giữ những giá trị truyền thống của từng vùng miền Việt Nam.
            Mỗi chai rượu không chỉ là một thức uống, mà còn là câu chuyện về
            văn hoá, bàn tay nghệ nhân và bản sắc địa phương. Từ những dòng rượu
            gạo mộc mạc của miền Bắc, rượu nếp thơm nồng nàn miền Trung cho đến
            các loại rượu đặc sản miền Tây sông nước, tất cả đều được chọn lọc
            kỹ lưỡng theo tiêu chuẩn khắt khe của Ông Tư. Bạn sẽ tìm thấy sự kết
            hợp giữa hương vị nguyên bản và chất lượng hiện đại, phù hợp cho
            biếu tặng, thưởng thức, hay những buổi sum họp gia đình. Hãy để bộ
            sưu tập này dẫn lối bạn vào hành trình khám phá ẩm thực Việt qua
            từng giọt rượu – tinh tế, chân thật và đậm đà bản sắc.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <ProductsPage />
        </div>
      </section>
    </div>
  );
}

export default AllProductsPage;
