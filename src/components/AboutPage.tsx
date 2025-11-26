import { Card, CardContent } from "./ui/card";
import { Wine, Award, Truck, HeadphonesIcon } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import heroImg from "../assets/Mù Cang Chải-513.jpg";
import storyImg1 from "../assets/song-cai-distillery-idesign-9.jpeg";
import storyImg2 from "../assets/soctrang2024-8346.JPG";
import storyImg3 from "../assets/Mù Cang Chải-483.jpg";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 site-main">
      {/* Hero - full width image with centered title */}
      <section className="relative hero-bleed">
        <div className="w-full h-[36vh] md:h-[50vh] overflow-hidden">
          <ImageWithFallback
            src={heroImg}
            alt="Hero - our story"
            className="vungmien-backgroundimage"
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg font-vl-edith">
            Rượu Ông Tư
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-white/90 mt-4 font-vl-edith">
            Mang hồn Việt đến từng giọt rượu
          </p>
        </div>
      </section>

      {/* Story prose + full-bleed images between sections */}
      <main className="py-16">
        <div className="constrained-prose px-6">
          <h2 className="text-2xl text-primary mb-6 font-vl-edith">
            Câu Chuyện Của Chúng Tôi
          </h2>
          <p className="text-muted-foreground mb-6">
            Xuất phát từ niềm đam mê với văn hóa rượu gạo truyền thống Việt Nam,
            chúng tôi đã dành nhiều năm tìm hiểu và bảo tồn các công thức làm
            rượu gia truyền từ khắp ba miền Bắc - Trung - Nam.
          </p>

          <p className="text-muted-foreground mb-6">
            Với hơn 20 năm kinh nghiệm trong ngành, chúng tôi tự hào là cầu nối
            giữa những nghệ nhân làm rượu với người tiêu dùng, mang đến những
            sản phẩm chất lượng cao, an toàn và đậm đà bản sắc Việt.
          </p>

          <p className="text-muted-foreground mb-6">
            Mỗi chai rượu trong bộ sưu tập của chúng tôi đều được tuyển chọn kỹ
            lưỡng, từ nguồn gốc nguyên liệu đến quy trình sản xuất, đảm bảo giữ
            trọn hương vị truyền thống và đáp ứng tiêu chuẩn vệ sinh an toàn
            thực phẩm.
          </p>

          <p className="text-muted-foreground mb-6">
            Chúng tôi hợp tác chặt chẽ với các hộ dân, nghệ nhân địa phương để
            bảo tồn nghề, phát triển chuỗi giá trị bền vững và lan tỏa câu
            chuyện vùng miền qua từng sản phẩm.
          </p>
        </div>
      </main>

      {/* Values (keep as before) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12 font-vl-edith">Giá Trị Cốt Lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wine className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="mb-2">Chất Lượng</h3>
                <p className="text-sm text-muted-foreground">
                  Sản phẩm chính hãng, nhập khẩu 100%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="mb-2">Uy Tín</h3>
                <p className="text-sm text-muted-foreground">
                  Đối tác tin cậy của các thương hiệu lớn
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="mb-2">Giao Hàng</h3>
                <p className="text-sm text-muted-foreground">
                  Nhanh chóng, an toàn toàn quốc
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="mb-2">Hỗ Trợ</h3>
                <p className="text-sm text-muted-foreground">
                  Tư vấn chuyên nghiệp 24/7
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact (keep as before) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-6 font-vl-edith">Liên Hệ Với Chúng Tôi</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Địa chỉ:</strong> 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí
                Minh
              </p>
              <p>
                <strong>Điện thoại:</strong> 1900 xxxx
              </p>
              <p>
                <strong>Email:</strong> contact@winestore.vn
              </p>
              <p>
                <strong>Giờ làm việc:</strong> Thứ 2 - Thứ 7: 8:00 - 20:00
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
