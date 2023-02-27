import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";

const ImageSlider = ({ images }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={false}
      modules={[Autoplay, Pagination, Navigation]}
      className="object-fill w-96 h-80 rounded-2xl"
    >
      {images.map((url, i) => (
        <SwiperSlide key={i}>
          <img
            className="object-fill w-full h-full"
            src={url}
            alt="image slide 1"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ImageSlider;
