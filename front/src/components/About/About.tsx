import "./About.css";
import aboutImg from "../../assets/aboutus.png"; // ajustá el path según la ubicación del componente

export default function About() {
  return (
    <div className="about-full-container">
      <img src={aboutImg} alt="About" />
      <div className="div-about-text">
        <div className="about-container">
          <h1>SOBRE NOSOTROS</h1>
          <p>
            En DISTROLAC trabajamos todos los días para acercarte las mejores
            marcas al mejor precio, con envíos rápidos y atención personalizada
            en toda la provincia de Mendoza. Nuestra nueva tienda online está
            pensada para que puedas comprar de forma simple, rápida y segura, y
            recibir tus productos al día siguiente. Sabemos lo importante que es
            contar con un proveedor confiable, ágil y siempre disponible. Por
            eso, te acompañamos en cada paso, resolviendo cualquier necesidad
            que tenga tu negocio. Porque no solo vendemos productos: construimos
            relaciones de confianza. Cuando elegís DISTROLAC, elegís un equipo
            comprometido con vos.
          </p>
        </div>
      </div>
    </div>
  );
}
