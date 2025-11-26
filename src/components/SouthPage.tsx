import React, { useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import heroImg from "../assets/miennam/soctrang.JPG";
import chonoiImg from "../assets/miennam/phule.jpg";
import mientayImg from "../assets/miennam/mientay.jpg";
import nguoimientyaImg from "../assets/miennam/nguoimientya.jpg";
import cheodo from "../assets/miennam/cheodo.jpg";
import hoasenImg from "../assets/miennam/hoasen.jpg";
import traicay from "../assets/miennam/mientay2.jpg";
import chuoihot from "../assets/miennam/phule1.jpg";
export function SouthPage() {
  useEffect(() => {
    document.title = "Câu Chuyện Miền Nam — Sông Cái";
  }, []);

  return (
    <div className="min-h-screen bg-white ">
      {/* Hero */}
      <section className="relative hero-bleed">
        <div className="relative w-full h-96 md:h-[80vh] overflow-hidden">
          <ImageWithFallback
            src={heroImg}
            alt="Miền Nam - sông nước"
            className="vungmien-backgroundimage"
          />

          {/* Overlay chỉ phủ lên ảnh, không phủ toàn trang */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>
      {/* Content */}
      {/* Title block for page (visible heading at the top of content) */}
      <header className="southpage-header mx-auto px-6 mt-16 md:mt-28 max-w-3xl text-center">
        <h2 className="font-semibold mb-2">Câu Chuyện Miền Nam</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hồn đất và người miền Nam — những câu chuyện gói trong từng giọt rượu.
        </p>
      </header>

      <div className="southpage-content prose prose-lg mx-auto px-6 py-8 max-w-3xl text-foreground mb-20">
        <p>
          Câu chuyện của chúng tôi bắt đầu từ đất đai và nông nghiệp – nơi mọi
          giá trị văn hóa, ký ức, và truyền thống đều bắt rễ. Với người miền
          Nam, đất không chỉ là chỗ dựa mưu sinh, mà còn là cách để mỗi thế hệ
          giữ sự gắn kết với ông bà, với quá khứ, với lịch sử của một vùng sông
          nước bao đời khai phá. Và cũng từ mảnh đất ấy, con người miền Nam bước
          vào thời hiện đại, đối diện những chuyển mình của văn hóa và phản văn
          hóa, mà vẫn giữ cho mình một bản sắc rất riêng.
        </p>

        {/* Image 2 */}
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback
              src={cheodo}
              alt="chợ nổi"
              className="southpage-content-image"
            />
          </div>
        </div>

        <p>
          Phát triển đi kèm với hiện đại hóa, nhưng cũng kéo theo sự đồng nhất
          hóa – khiến nhiều cộng đồng cảm thấy xa rời cội nguồn của chính mình.
          Ở miền Tây, những làng nghề nấu rượu truyền thống mai một dần theo
          thời gian. Ở vùng sông nước, vườn cây trái và thảo mộc bản địa ngày
          một bị thu hẹp. Và ở những vùng ven đô, nơi từng là “vựa” nguyên liệu
          thiên nhiên, giờ chỉ còn lại vài mảnh ký ức. Chúng tôi chứng kiến sự
          mất dần của đa dạng sinh học – từ Đồng bằng Sông Cửu Long đến miền
          duyên hải Nam Bộ – và đau lòng khi đổi lại chỉ là những giá trị kinh
          tế ngắn hạn.
        </p>

        {/* Image 1 */}
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback
              src={chonoiImg}
              alt="Chợ Nổi miền Nam"
              className="southpage-content-image"
            />
          </div>
        </div>

        <p>
          Những trăn trở đó đã trở thành nền móng cho tầm nhìn của chúng tôi.
          Chúng tôi làm rượu không phải để bán một sản phẩm, mà để gìn giữ giá
          trị, kể câu chuyện của vùng đất, và tôn vinh nếp sống của con người
          miền Nam.
        </p>

        <p>
          Vì thế, hành trình của chúng tôi bắt đầu bằng việc tạo giá trị mới cho
          nông sản miền Nam, và dùng thương hiệu như một cách để kể về vùng đất
          này – về cây dừa Bến Tre, về lúa nếp Cần Thơ, về từng trái sim, trái
          mận, từng loài thảo mộc bản địa từ đồng bằng đến miệt rừng U Minh.
          Chúng tôi muốn người thưởng thức cảm nhận được cả một miền Nam trong
          từng giọt rượu – từ nguồn nước, từ phù sa, từ trái cây, đến phong vị
          của những làng nghề vẫn giữ lửa qua bao thế hệ.
        </p>

        {/* Image 3 */}
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback
              src={traicay}
              alt="traicay"
              className="southpage-content-image"
            />
          </div>
        </div>

        <p>
          Trong từng công đoạn – chọn giống cây, chọn trái, lên men, chưng cất,
          ủ rượu – chúng tôi đều cố gắng giữ lại những gì tinh túy và nguyên bản
          nhất. Đó không chỉ là quy trình, mà là sự tri ân dành cho những người
          nông dân miền Nam, những người suốt đời gắn bó với đất đai và mùa vụ,
          với bàn tay chân chất mà kiên trì.
        </p>

        <p>
          Mỗi sản phẩm của chúng tôi là một mảnh ghép của quần thể văn hóa ấy.
          Là lời mời gọi bạn cảm nhận cái ngọt của trái cây miền Tây, cái ấm của
          nếp mới, cái mộc mạc của người vùng sông nước, và cái hào sảng của
          miền Nam xưa nay.
        </p>

        {/* Image 4 */}
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback
              src={chuoihot}
              alt="Hoa sen miền Nam"
              className="southpage-content-image"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-16 !bg-gradient-to-br !from-emerald-600 !to-blue-600 text-black">
        <div className="container mx-auto px-6 max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-vl-edith">
            Khám Phá Rượu Miền Nam
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Hãy nếm thử và cảm nhận cốt cách miền Nam trong từng giọt.
          </p>
        </div>
      </section>
    </div>
  );
}

export default SouthPage;
