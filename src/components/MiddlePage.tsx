import { ImageWithFallback } from "./figma/ImageWithFallback";
import backgroundImage from "../assets/binhdinh.JPG";

export function MiddlePage() {
  return (
    <div className="min-h-screen">
      <section className="relative hero-bleed bg-white">
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <ImageWithFallback
            src={backgroundImage}
            alt="Miền Trung"
            className="vungmien-backgroundimage"
          />
        </div>

        <div className="container mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Miền Trung – Hồn lửa trời và biển gió của mảnh đất mở mang
          </h1>

          <p className="mb-4 text-muted-foreground">
            Từ dãy Trường Sơn đến miền duyên hải, những chum rượu như Rượu Võ Xá
            tại Quảng Bình chứa cả mùi nắng gió, nước ngầm và men lá truyền
            thống trải đời.
          </p>

          <p className="mb-4 text-muted-foreground">
            Chai rượu nơi đây không chỉ là thức uống mà còn là lời kể của núi
            non, biển cả và người dân kiên cường — một hành trình vị giác xuyên
            qua ký ức vùng đất đang lớn.
          </p>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-blue-600 text-black">
        <div className="container mx-auto px-6 max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-vl-edith">
            Khám Phá Rượu Miền Trung
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Những dòng rượu say mê miền Trung — quyện vị đất trời, lưu luyến tâm hồn.
          </p>
        </div>
      </section>
    </div>
  );
}

export default MiddlePage;
