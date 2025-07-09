import "./Header.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

// Importa los módulos Navigation y Autoplay
import { Navigation, Autoplay } from "swiper/modules";

import Slider1 from "../../assets/Header slider1.png";

export default function Header() {
  return (
    <Swiper
      className="swiper-container"
      modules={[Navigation, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      loop={true}
    >
      <SwiperSlide>
        <div className="swiper-img-container">
          <img src={Slider1} alt="Slide 1" className="swiper-img" />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="swiper-img-container">
          <img src={Slider1} alt="Slide 1" className="swiper-img" />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="swiper-img-container">
          <img src={Slider1} alt="Slide 1" className="swiper-img" />
        </div>
      </SwiperSlide>
      {/* Agrega más SwiperSlides si es necesario */}
    </Swiper>
  );
}
