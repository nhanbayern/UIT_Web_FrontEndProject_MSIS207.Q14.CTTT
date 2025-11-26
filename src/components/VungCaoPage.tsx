import React, { useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Import ảnh vùng cao
import heroImg from "../assets/vungcao/hero.jpg";
import img1 from "../assets/vungcao/content.jpg";
import img2 from "../assets/vungcao/content1.jpg";
import img3 from "../assets/vungcao/content2.jpg";
import img4 from "../assets/vungcao/content3.jpg";
import img5 from "../assets/vungcao/content4.JPG";
import img6 from "../assets/vungcao/content5.JPG";
import img7 from "../assets/vungcao/content6.jpg";

export function VungCaoPage() {
  useEffect(() => {
    document.title = "Câu Chuyện Cao Nguyên — Sông Cái";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative hero-bleed">
        <div className="relative w-full h-96 md:h-[80vh] overflow-hidden">
          <ImageWithFallback
            src={heroImg}
            alt="Vùng Cao - núi rừng"
            className="vungmien-backgroundimage"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>

      {/* Tiêu đề chính */}
      <header className="southpage-header mx-auto px-6 mt-16 md:mt-28 max-w-3xl text-center">
        <h2 className="font-semibold mb-2">Câu Chuyện Cao Nguyên</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hơi thở núi rừng – ký ức và bản sắc gói trong từng giọt rượu cao nguyên.
        </p>
      </header>

      {/* Nội dung SEO + ảnh minh họa */}
      <div className="southpage-content prose prose-lg mx-auto px-6 py-8 max-w-3xl text-foreground mb-20">
        <p>
          Câu chuyện của chúng tôi bắt đầu từ vùng đất nơi sương sớm ôm trọn núi đồi, nơi những cánh rừng đại ngàn, ruộng bậc thang và những buôn làng ẩn mình trong mây tạo nên một bản hòa âm của thiên nhiên lẫn văn hóa. Cao nguyên – từ Tây Bắc đến Tây Nguyên – không chỉ là vùng đất cao, mà là nơi khởi nguồn của những giá trị sống gắn với núi rừng, với nương rẫy, với tiếng cồng chiêng, và với những câu chuyện bất tận về con người nơi đây. Ở đó, mỗi mảnh đất đều thấm đẫm dấu chân của các thế hệ, mỗi mùa thu hoạch đều mang theo hơi thở của lịch sử và truyền thống.
        </p>
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback src={img1} alt="content 1" className="southpage-content-image" />
          </div>
        </div>
        <p>
          Sự phát triển của đời sống hiện đại mang lại nhiều đổi thay, nhưng cũng khiến những giá trị nguyên bản dần bị lấn át. Những nương ngô, nếp nương, và thảo mộc rừng từng là biểu tượng của núi rừng đang dần thu hẹp. Các làng nghề nấu rượu truyền thống, những thổ tục canh tác bản địa, những nguyên liệu đặc hữu như trái mắc khén, thảo quả, tiêu rừng, hay men lá của người H’Mông – Dao – Ê Đê – Gia Rai… đang đứng trước nguy cơ mờ nhạt theo thời gian. Chúng tôi nhìn thấy sự mất dần của đa dạng sinh học nơi đại ngàn – từ rừng Tây Bắc đến các cao nguyên bazan – và trăn trở khi đánh đổi là những giá trị ngắn hạn.
        </p>
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback src={img2} alt="content 2" className="southpage-content-image" />
          </div>
        </div>
        <p>
          Chính những lo lắng ấy tạo nên tầm nhìn của chúng tôi. Với chúng tôi, rượu không chỉ là một sản phẩm tiêu dùng; nó là chất liệu để phục dựng văn hóa, kể câu chuyện về vùng cao nguyên, và tôn vinh tinh thần sống của con người núi rừng. Mỗi giọt rượu là cách chúng tôi gửi gắm lòng biết ơn với đất, với rừng, với những người vẫn giữ nghề trên những triền núi dốc.
        </p>
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback src={img3} alt="content 3" className="southpage-content-image" />
          </div>
        </div>
        <p>
          Bởi thế, hành trình của chúng tôi bắt đầu bằng việc hồi sinh giá trị cho nông sản đặc hữu vùng cao: từ nếp nương Tây Bắc, rễ và thảo mộc đại ngàn, cho đến trái cà đắng, mắc ca Tây Nguyên, mật ong rừng, hay từng loại thảo dược mà đồng bào gìn giữ qua nhiều thế hệ. Chúng tôi dùng chính thương hiệu của mình để kể về rừng già, về đất bazan đỏ lửa, về gió núi, về dấu ấn văn hóa của các buôn làng – từ tiếng khèn Mông đến cồng chiêng Tây Nguyên, từ mùa hoa ban trắng đến mùa lúa chín vàng.
        </p>
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback src={img4} alt="content 4" className="southpage-content-image" />
          </div>
        </div>
        <p>
          Trong từng công đoạn – chọn giống cây, chọn quả, thu hái thảo mộc, lên men bằng men lá truyền thống, chưng cất trên lửa củi, cho đến ủ rượu đủ năm – chúng tôi luôn cố gắng giữ lại trọn vẹn phong vị nguyên bản của núi rừng. Mỗi bước làm đều là một lời tri ân với đồng bào dân tộc – những người suốt đời gắn bó với nương rẫy, với rừng, với nhịp sống giản dị mà bền bỉ.
        </p>
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback src={img5} alt="content 5" className="southpage-content-image" />
          </div>
        </div>
        <p>
          Mỗi sản phẩm của chúng tôi là một mảnh ký ức của vùng cao nguyên. 
          Là lời mời bạn cảm nhận cái cay thơm của tiêu rừng, cái ngọt thanh của mật ong đại ngàn, 
          cái men say của nếp nương, cái hồn hậu của người miền sơn cước và cái tự do của những cơn gió đại ngàn.
           Chúng tôi mong rằng, khi nhâm nhi từng giọt rượu, bạn sẽ cảm thấy như đang bước vào một hành trình – 
           hành trình của đất, của rừng, và của con người nơi những đỉnh núi chạm mây
        </p>
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback src={img6} alt="content 6" className="southpage-content-image" />
          </div>
        </div>
        <p>
        Và hơn tất cả, chúng tôi tin rằng tương lai của rượu cao nguyên nằm ở sự hài hòa giữa truyền thống và đổi mới. Chúng tôi gìn giữ men lá cổ truyền, nhưng áp dụng quy trình hiện đại để kiểm soát chất lượng; chúng tôi trân trọng nông sản bản địa, nhưng nghiên cứu cách tạo ra những hương vị mới mang bản sắc vùng cao; chúng tôi tôn vinh văn hóa, nhưng cũng hướng đến việc đưa câu chuyện của núi rừng đến gần hơn với người trẻ. Đó là hành trình dài hơi, là cam kết đưa giá trị bền vững vào mỗi sản phẩm – để mỗi người khi nâng ly đều có thể cảm nhận không chỉ hương vị, mà còn cả linh hồn của Tây Bắc và Tây Nguyên trong đó.
        </p>
        <div className="my-10 flex justify-center">
          <div className="southpage-img-wrap">
            <ImageWithFallback src={img7} alt="content 7" className="southpage-content-image" />
          </div>
        </div>
      </div>
       
      {/* CTA */}
      <section className="py-16 !bg-gradient-to-br !from-emerald-600 !to-blue-600 text-black">
        <div className="container mx-auto px-6 max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-vl-edith">
            Khám Phá Rượu Vùng Cao
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Hãy nếm thử và cảm nhận cốt cách đại ngàn trong từng giọt.
          </p>
        </div>
      </section>
    </div>
  );
}

export default VungCaoPage;
