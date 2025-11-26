import React, { useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import heroImg from "../assets/mienbac/hero.jpg";
import bacRieuImg from "../assets/mienbac/content.jpg";
import ruounhoImg from "../assets/mienbac/content1.jpg";
import ruoucom from "../assets/mienbac/comsua.jpg";
import ruouNgamImg from "../assets/mienbac/content4.jpg";
export function NorthPage() {
  useEffect(() => {
    document.title = "Câu Chuyện Miền Bắc — Sông Cái";
  }, []);

  return (
    <div className="min-h-screen bg-white site-main">
      {/* Hero */}
      <section className="relative hero-bleed">
        <div className="w-full h-96 md:h-[80vh] overflow-hidden">
          <ImageWithFallback
            src={heroImg}
            alt="Miền Bắc - Núi đồi & văn hoá"
            className="vungmien-backgroundimage"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30"></div>
      </section>

      {/* Title block */}
      <header className="southpage-header mx-auto px-6 mt-16 md:mt-28 max-w-3xl text-center">
        <h2 className="font-semibold mb-2">Câu Chuyện Miền Bắc</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tinh hoa rượu gạo trăm năm — nơi hội tụ khí thiêng sông núi và tâm hồn
          người Việt.
        </p>
      </header>

      {/* Content */}
      <main className="southpage-content prose prose-lg mx-auto px-6 py-8 max-w-3xl text-foreground">
        <p>
          Miền Bắc là chiếc nôi của văn minh lúa nước, cũng là nơi khai sinh
          những dòng rượu cổ truyền lâu đời nhất. Từ mạch nước ngầm vùng trung
          du, từ hạt nếp nương thơm của Mường Lò, đến những bài men thuốc bắc bí
          truyền của các làng nghề dân gian — tất cả hòa quyện thành hồn cốt của
          rượu Bắc.
        </p>

        {/* Image 1 */}
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback
              src={bacRieuImg}
              alt="Rượu miền Bắc"
              className="southpage-content-image"
            />
          </div>
        </div>

        <p>
          Mỗi vùng đất mang một “cái duyên rượu” riêng: Rượu làng Vân Bắc Giang
          tinh tế và thanh nhã; rượu Kim Sơn Ninh Bình mạnh mẽ, nồng đượm; rượu
          San Lùng Lào Cai men rừng thơm nức hương thảo mộc. Những dòng rượu này
          không chỉ là thức uống mà còn là ký ức văn hoá gắn liền với lễ hội,
          cưới hỏi, Tết Nguyên Đán và những câu chuyện truyền đời của người Bắc.
        </p>

        {/* Image 2 */}
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback
              src={ruoucom}
              alt="Rượu Làng Vân"
              className="southpage-content-image"
            />
          </div>
        </div>

        <p>
          Nghề rượu miền Bắc thể hiện sự cầu kỳ và tinh tế: chọn gạo nếp cái hoa
          vàng, ủ men thuốc bắc đủ 36 vị, canh nhiệt độ trời đất, lọc từng giọt
          để giữ lại vị ngọt thanh tự nhiên. Đó là sự kết hợp giữa kinh nghiệm
          trăm năm và sự khéo léo của đôi bàn tay người thợ.
        </p>

        <p>
          Đối với chúng tôi, mỗi chai rượu miền Bắc là một phần của kho tàng văn
          hoá — thu hoạch từ ruộng nương, chắt lọc từ núi rừng, và lưu giữ trong
          từng giọt rượu cả khí thiêng sông núi Việt Nam.
        </p>

        {/* Image 3 */}
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback
              src={ruouNgamImg}
              alt="Rượu ngâm miền Bắc"
              className="southpage-content-image"
            />
          </div>
        </div>

        <p>
          Mỗi vùng, mỗi làng nghề, mỗi giọt rượu là một câu chuyện về đất và
          người — về sự mộc mạc, bền bỉ, và tự hào của miền Bắc. Đó chính là
          nguồn cảm hứng để chúng tôi tiếp tục bảo tồn và lan toả tinh hoa rượu
          Việt đến mọi người thưởng thức.
        </p>
      </main>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-blue-600 text-black">
        <div className="container mx-auto px-6 max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-vl-edith">
            Khám Phá Rượu Miền Bắc
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Những dòng rượu mang bản sắc nghìn năm — nồng nàn, sâu lắng, đậm hồn
            Việt.
          </p>
        </div>
      </section>
    </div>
  );
}

export default NorthPage;
