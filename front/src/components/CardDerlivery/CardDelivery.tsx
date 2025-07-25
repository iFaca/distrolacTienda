import "./CardDelivery.css";

// Importa las imágenes desde tu carpeta de assets
import telefonoImg from "../../assets/TelefonoTiendaweb.png";
import camionImg from "../../assets/CamionTiendaweb.png";

export default function CardDelivery() {
  return (
    <div className="card-delivery-container">
      {/* Card 1: Pedido desde teléfono */}
      <div className="delivery-card card-phone">
        <img
          src={telefonoImg}
          alt="Hacer pedido desde un teléfono"
          className="card-image image-phone"
        />
        <div className="card-content">
          <h2>
            Hacé tu pedido
            <br />
            desde un telefono
          </h2>
        </div>
      </div>

      {/* Card 2: Entrega en 24hs */}
      <div className="delivery-card card-van">
        <div className="card-content">
          <h2>
            Tu pedido
            <br />
            llega en 24hs
          </h2>
        </div>
        <img
          src={camionImg}
          alt="Tu pedido llega en 24 horas"
          className="card-image image-van"
        />
      </div>
    </div>
  );
}