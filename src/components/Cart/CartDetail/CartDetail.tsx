import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa el hook useNavigate
import "./CartDetail.css";

interface CartItem {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

export default function CartDetail() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState("0");

  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    const totalData = localStorage.getItem("total");

    if (cartData) setCartItems(JSON.parse(cartData));
    if (totalData) setTotal(totalData);
  }, []);

  const handleGoToShipping = () => {
    // Puedes validar los datos aquí antes de continuar
    const email = document.querySelector("input[type='email']")?.value;
    const address = document.querySelector(
      "input[placeholder='Dirección']"
    )?.value;

    if (!email || !address) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Guarda los datos de contacto y envío en el localStorage
    const userData = {
      email,
      address,
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // Navega a la vista de envío
    navigate("/editarpedido");
  };

  return (
    <div className="cartdetail-container">
      {/* Columna izquierda */}
      <div className="cartdetail-leftcolumn">
        <div className="cartdetail-explorer">
          <p>Carrito</p>
          <p>Detalle</p>
          <p>Envio</p>
          <p>Pago</p>
        </div>
        <fieldset className="cartdetail-form">
          <legend>Contacto</legend>
          <input type="email" placeholder="Ingresa un email" />
          <label className="cartdetail-checkbox">
            <input type="checkbox" />
            <span>Quiero recibir ofertas por email</span>
          </label>
        </fieldset>
        <fieldset className="cartdetail-form">
          <legend>Datos de envío</legend>
          <div className="cartdetail-row">
            <input type="text" placeholder="Nombre" />
            <input type="text" placeholder="Apellido" />
          </div>
          <input type="text" placeholder="Dirección" />
          <input type="text" placeholder="Comentarios (Opcional)" />
        </fieldset>
        <div className="cartdetail-buttons">
          <a href="#">Volver al carrito</a>
          <button onClick={handleGoToShipping}>Ir a Envío</button>{" "}
        </div>
      </div>

      {/* Columna derecha */}
      <div className="cartdetail-rightcolumn">
        <h2>Detalle del Pedido</h2>
        <ul className="cartdetail-items">
          {cartItems.map((item) => (
            <li key={item.id} className="cartdetail-item">
              <img src={item.image} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>$ {item.price.toFixed(2)}</p>
              </div>
              <p className="cartdetail-quantity">x{item.quantity}</p>
            </li>
          ))}
        </ul>
        <div className="cartdetail-summary">
          <div className="cartdetail-coupon">
            <input type="text" placeholder="Cupón de descuento" />
            <button>Agregar código</button>
          </div>
          <div className="cartdetail-totals">
            <div>
              <span>Subtotal</span>
              <span>${total}</span>
            </div>
            <div>
              <span>Envío</span>
              <span>Lo calcularemos en el próximo paso</span>
            </div>
            <div className="cartdetail-total-row">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
