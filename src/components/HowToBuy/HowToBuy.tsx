import React from "react";
import HeaderImg from "../../assets/sliderwork.png";
import Hands from "../../assets/manoswork.png";
import Box from "../../assets/boxes 1work.png";
import Map from "../../assets/mapawork.png";
import "./HowToBuy.css";
export default function HowToBuy() {
  return (
    <div className="how-to-buy-container">
      {/* Sección de cabecera */}
      <div className="header-section">
        <img src={HeaderImg} alt="Envíos Express" className="header-image" />
      </div>

      {/* Sección de métodos de pago y envío */}
      <div className="methods-container">
        <div className="methods-section-container">
          <div className="methods-section">
            <div className="methods-column">
              <h3 className="methods-title">MÉTODOS DE PAGO</h3>
              <img src={Hands} alt="Método de pago" className="methods-icon" />
              <p className="methods-description">
                Los pagos se realizan una vez que el pedido llegó a tu domicilio
                y estás conforme con tu compra. Los medios de pago disponibles
                son tarjeta o transferencia bancaria.
              </p>
            </div>
            <div className="methods-column">
              <h3 className="methods-title">MÉTODOS DE ENVÍO</h3>
              <img src={Box} alt="Método de envío" className="methods-icon" />
              <p className="methods-description">
                En el carrito de compras podrás ingresar los datos para que
                coordinemos la entrega de tu pedido con uno de nuestros
                asesores.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección del mapa */}
      <div className="map-section-full-container">
        <div className="map-section-container">
          <div className="red-underline">
            <h1 className="map-title">MAPA DE ENVÍOS</h1>
          </div>
          <div className="map-section">
            <img src={Map} alt="Mapa de cobertura" className="map-image" />
          </div>
        </div>
      </div>
    </div>
  );
}
