import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ProductCard } from "./ProductCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { Star, Award, Truck, Shield, Sparkles } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import backgroundImage from "../assets/Mù Cang Chải-483.jpg";
import home1 from "../assets/homecontent/1.jpg";
import home2 from "../assets/homecontent/2.jpg";
import mientayImg from "../assets/homecontent/mientay.jpg";
import songcai from "../assets/homecontent/Mù Cang Chải-431.jpg";
import contentBg from "../assets/homecontent/Tả Van-091.jpg";

export function HomePage() {
  const { products, addToCart } = useApp();
  const navigate = useNavigate();
  const featuredProducts = Array.isArray(products) ? products.slice(0, 3) : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-bleed min-h-[90vh] bg-gradient-to-br from-primary via-[#2E7D32] to-[#1B5E20] text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: "center right",
            backgroundSize: "cover",
            opacity: 0.55,
          }}
        ></div>

        {/* Overlay để text dễ đọc hơn và làm ảnh tối hơn, đổi sang màu đen */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/80 to-black/80"></div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[90vh] py-20">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-block">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-sm">100% Tự Nhiên - Truyền Thống</span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight font-vl-edith">
                Tinh Túy Từ
                <br />
                <span className="text-secondary">Hạt Gạo Việt</span>
              </h1>

              <div className="space-y-4 text-lg text-white/90 leading-relaxed max-w-2xl">
                <p>
                  Từ những cánh đồng lúa bát ngát, rượu gạo Việt ra đời như kết
                  tinh của nắng gió và bàn tay khéo léo của người thợ.
                </p>
                <p>
                  Mỗi giọt rượu trong veo mang theo hương thơm thanh nhẹ của lúa
                  mới, vị ấm nồng nơi đầu lưỡi và sự mộc mạc đậm đà của quê
                  hương – một nét tinh túy được chưng cất qua thời gian và
                  truyền thống.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate("/products/all")}
                >
                  Khám Phá Ngay
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white text-foreground hover:bg-white/10 px-8 py-6 text-lg"
                  onClick={() => navigate("/about")}
                >
                  Về Chúng Tôi
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8 border-t border-white/20"></div>
            </motion.div>

            {/* Right Content - Product Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Decorative Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent rounded-full blur-3xl"></div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-20 right-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-secondary" />
                    <div>
                      <p className="text-sm font-semibold">100% Tự Nhiên</p>
                      <p className="text-xs text-white/60">
                        Không chất bảo quản
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEO Content (replaces Featured Products) */}
      <section className="relative bg-white">
        {/* Full-width background for SEO content (bleeds horizontally) */}
        <div className="absolute inset-0 -top-20 pointer-events-none overflow-hidden">
          <ImageWithFallback
            src={contentBg}
            alt=""
            // center the image and make it wider than the viewport so it bleeds both left and right
            className="absolute top-0 left-1/2 h-full object-cover opacity-20 blur-sm"
            style={{ width: "140vw", transform: "translateX(-50%)" }}
          />
        </div>

        {/* White overlay to slightly tint background */}
        <div className="absolute inset-0 bg-white/5" />

        <div className="container mx-auto pt-50 relative z-10">
          {/* Spacer to offset hero-bleed overlap and fixed navbar; forces header lower */}
          <div
            aria-hidden
            style={{ height: "calc(var(--site-navbar-height) + 6rem)" }}
          />
          <header className="homepage-header mx-auto px-6 pt-4 mb-4 text-center">
            <h2 className="font-vl-edith text-5xl md:text-6xl font-bold mb-2">
              Văn Hóa Rượu Việt Nam – Hồn Cốt Của Hàng Ngàn Năm Lịch Sử
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Từ thuở những cánh đồng lúa còn bạt ngàn chạy dài theo triền sông,
              rượu đã hiện diện trong đời sống người Việt như một phần linh hồn
              không thể tách rời.
            </p>
          </header>

          <div className="southpage-content prose prose-lg mx-auto px-6 py-8 max-w-3xl text-foreground mb-20">
            <p>
              Từ thuở những cánh đồng lúa còn bạt ngàn chạy dài theo triền sông,
              rượu đã hiện diện trong đời sống người Việt như một phần linh hồn
              không thể tách rời. Rượu của người Việt không chỉ là thứ chất lỏng
              cay nồng để say, mà là hơi thở của đất, của trời, của mồ hôi người
              nông dân và của những mùa vụ tròn đầy. Hạt nếp được gặt lúc nắng
              còn vàng mới, phơi đúng ngày hanh khô, chọn từng hạt căng tròn như
              trân quý tất cả những gì thiên nhiên ban tặng. Đến khi đưa vào nồi
              cơm, trộn với men lá hay men thuốc bắc, người nấu rượu phải chăm
              từng chút một như chăm đứa con nhỏ, nghe mùi là biết rượu đang
              “thở”, nhìn sắc là hiểu men đang “ăn”. Để rồi lúc giọt rượu đầu
              tiên nhỏ xuống, trong vắt, thơm thoang thoảng, người ta cảm giác
              như bao nhiêu tinh hoa của đất trời, của lao động, của sự nhẫn nại
              đã được chắt lại trong một khoảnh khắc.
            </p>

            <div className="my-10 flex justify-center">
              <div className="southpage-img-wrap">
                <ImageWithFallback
                  src={home1}
                  alt="Cánh đồng lúa"
                  className="southpage-content-image"
                />
              </div>
            </div>

            <p>
              Trong những ngôi làng cổ, rượu là thứ kết nối con người với nhau,
              kết nối đời sống với tín ngưỡng. Ngày giỗ ông bà, trên bàn thờ
              nhất định phải có chén rượu đặt bên bát hương, như một lời mời tổ
              tiên về sum họp. Trong đám cưới, chén rượu tân lang, tân nương
              trao nhau là lời hứa thủy chung. Trong tiệc làng, từ cụ già đến
              thanh niên đều nâng chén, không phải để say mà để mở lòng, để
              người gần thêm người. Rượu càng uống càng nồng, nhưng lại khiến
              câu chuyện trở nên nhẹ nhàng, ấm áp, kéo những con người xa lạ lại
              gần với nhau như đã quen biết từ lâu. Người Việt uống rượu ít khi
              uống một mình; rượu chỉ thật sự “đúng nghĩa” khi có câu chuyện, có
              tiếng cười và có những tấm lòng chia sẻ cùng nhau.
            </p>

            <div className="my-10 flex justify-center">
              <div className="southpage-img-wrap">
                <ImageWithFallback
                  src={home2}
                  alt="Bình dị làng quê"
                  className="southpage-content-image"
                />
              </div>
            </div>

            <p>
              Mỗi vùng đất lại có một loại rượu riêng mang dấu ấn của khí hậu,
              thổ nhưỡng và tập tục lâu đời. Miền Bắc có rượu nếp Kim Sơn, rượu
              nếp Phú Lộc thơm nức mùi lúa mới; miền Trung có rượu Bàu Đá nồng
              đậm, uống một hớp mà như nghe tiếng gió Lào thổi rát mặt; miền Tây
              có rượu chuối hột, rượu dừa, rượu sim mang hương vị của rừng đước,
              rừng tràm và những dòng sông đục phù sa. Cùng là rượu gạo, nhưng
              mỗi vùng lại có một linh hồn khác nhau, như những giọng nói ba
              miền vừa quen vừa lạ, hòa trong một bản sắc chung của dân tộc.
            </p>

            <div className="my-10 flex justify-center">
              <div className="southpage-img-wrap">
                <ImageWithFallback
                  src={mientayImg}
                  alt="Rượu miền Tây"
                  className="southpage-content-image"
                />
              </div>
            </div>

            <p>
              Ngày nay, khi cuộc sống hiện đại cuốn người ta vào nhịp sống tốc
              độ, rượu Việt vẫn giữ được vẻ đẹp mộc mạc vốn có. Trong những
              phiên chợ quê, người bán rượu vẫn gánh đôi thùng sành đi bộ; trong
              những ngôi nhà nhỏ mái ngói ba gian, người già vẫn rót rượu vào
              chén men nâu, đưa lên mũi ngửi trước khi uống, như thể đó là nghi
              thức thiêng liêng. Rượu Việt gợi nhớ về quá khứ, về sự gắn bó giữa
              con người với ruộng đồng, với thiên nhiên và với nhau. Và dù thời
              gian có trôi đi, dù xã hội có thay đổi thế nào, chén rượu quê chân
              thật ấy vẫn sẽ mãi là biểu tượng của sự hòa thuận, của tình nghĩa,
              của lòng hiếu khách, và của bản sắc riêng không gì có thể thay thế
              của người Việt.
            </p>

            <div className="my-10 flex justify-center">
              <div className="southpage-img-wrap">
                <ImageWithFallback
                  src={songcai}
                  alt="Nhà máy rượu truyền thống"
                  className="southpage-content-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rice Fields Banner */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center -mb10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1454580083719-5135531ae1dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZCUyMHZpZXRuYW18ZW58MXx8fHwxNzYzMjgxMDE5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Cánh đồng lúa"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-primary">
                Từ Cánh Đồng Đến Ly Rượu
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Mỗi chai rượu gạo của chúng tôi đều được làm từ những hạt lúa
                chọn lọc kỹ càng, thu hoạch đúng mùa, đảm bảo chất lượng tốt
                nhất.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Quy trình sản xuất tuân thủ phương pháp truyền thống, kết hợp
                với công nghệ hiện đại, tạo nên những sản phẩm vừa giữ được nét
                văn hóa dân tộc, vừa đáp ứng tiêu chuẩn an toàn thực phẩm cao
                nhất.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate("/about")}
              >
                Tìm Hiểu Thêm
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "An Toàn Vệ Sinh",
                description: "Đạt chuẩn VSATTP, kiểm định chặt chẽ",
              },
              {
                icon: Award,
                title: "Truyền Thống",
                description: "Công thức gia truyền nhiều đời",
              },
              {
                icon: Truck,
                title: "Giao Hàng Nhanh",
                description: "Giao hàng toàn quốc trong 1-3 ngày",
              },
              {
                icon: Star,
                title: "Uy Tín",
                description: "Được khách hàng tin tưởng",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">Đăng Ký Nhận Tin</h2>
              <p className="text-white/80 mb-8">
                Nhận thông tin về các sản phẩm mới, ưu đãi đặc biệt và kiến thức
                về rượu gạo truyền thống
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8"
                >
                  Đăng Ký
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
