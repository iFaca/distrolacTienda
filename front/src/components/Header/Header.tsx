import { useState, useEffect } from "react";
import "./Header.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Autoplay } from "swiper/modules";

export default function Header() {
  // El estado 'images' ahora guardará un array de strings (las URLs)
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_BACK_APP_URI}/slider-images-manager`;
        const response = await fetch(apiUrl);
        console.log("Respuesta del apiUrl:", apiUrl);
        console.log("Estado de la respuesta:", response);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Estado de la data:", data);
        
        // --- CAMBIO CLAVE AQUÍ ---
        // Verificamos si la respuesta tiene el formato esperado
        // y extraemos el array de imágenes de la primera posición.
        if (data && data.length > 0 && Array.isArray(data[0].images)) {
          setImages(data[0].images); // Guardamos el array de URLs en el estado
        } else {
          // Si el formato no es el esperado, lanzamos un error para notificarlo.
          throw new Error("La estructura de datos recibida no es la esperada.");
        }

      } catch (err) {
        setError(err.message);
        console.error("Error al obtener las imágenes del slider:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return <div>Cargando imágenes...</div>;
  }

  if (error) {
    return <div>Error al cargar las imágenes: {error}</div>;
  }

  // Si no hay imágenes después de cargar, podemos mostrar un mensaje o un slide por defecto
  if (images.length === 0) {
    return <div>No hay imágenes para mostrar en el slider.</div>;
  }

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
      {/* --- CAMBIO CLAVE EN EL MAPEO ---
          Ahora mapeamos un array de strings. Cada 'imageUrl' es una URL.
      */}
      {images.map((imageUrl, index) => (
        // La URL de la imagen puede servir como key, ya que debería ser única.
        <SwiperSlide key={imageUrl}> 
          <div className="swiper-img-container">
            {/* 'imageUrl' es directamente la fuente (src) de la imagen */}
            <img 
              src={imageUrl} 
              alt={`Imagen del slider ${index + 1}`} // Alt text genérico
              className="swiper-img" 
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}