import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ShippingDetail.css";

interface UserData {
  email: string;
  address: string;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function ShippingDetail() {
  const [userData, setUserData] = useState<UserData>({
    email: "",
    address: "Seleccionar ubicación",
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false); // Estado para mostrar el pop-up

  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar datos del usuario y del carrito
    const storedUserData = localStorage.getItem("userData");
    const storedCartItems = localStorage.getItem("cart");
    const storedTotal = localStorage.getItem("total");

    if (storedUserData) setUserData(JSON.parse(storedUserData));
    if (storedCartItems) setCartItems(JSON.parse(storedCartItems));
    if (storedTotal) setTotal(parseFloat(storedTotal));
  }, []);

  const handleConfirmOrder = () => {
    // Mostrar el pop-up de confirmación
    setShowConfirmation(true);

    // Limpiar el carrito
    localStorage.removeItem("cart");
    localStorage.removeItem("total");
    localStorage.removeItem("userData");

    // Simulamos la creación del pedido (en lugar de enviar a una API real de WhatsApp)
    const orderDetails = {
      user: userData,
      items: cartItems,
      totalAmount: total,
    };

    // Log de los datos que enviarías a la API de WhatsApp
    console.log("Pedido confirmado:", orderDetails);

    // Ejemplo:
    // fetch("https://tu-api-whatsapp.com", {
    //   method: "POST",
    //   body: JSON.stringify(orderDetails),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // }).then(response => response.json())
    //   .then(data => console.log(data))
    //   .catch(error => console.error("Error al enviar el pedido:", error));

    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="shipping-container">
      {/* Columna izquierda */}
      <div className="shipping-leftcolumn">
        <img src="/logo.png" alt="Logo Distrolac" className="shipping-logo" />
        <nav className="shipping-steps">
          <span>Carrito</span> &gt; <span>Detalles</span> &gt;{" "}
          <span>Envío</span> &gt; <span>Pago</span>
        </nav>
        <div className="shipping-info">
          <div className="shipping-info-row">
            <span>Contacto</span>
            <span>{userData.email}</span>
            <button onClick={() => navigate("/detalledepedido")}>Editar</button>
          </div>
          <div className="shipping-info-row">
            <span>Dirección</span>
            <span>{userData.address}</span>
            <button onClick={() => navigate("/detalledepedido")}>Editar</button>
          </div>
        </div>
        <fieldset className="shipping-method">
          <legend>Método de envío</legend>
          <div className="shipping-method-option">
            <input type="radio" name="shipping-method" defaultChecked />
            <label>Entrega a domicilio</label>
            <span>Gratis</span>
          </div>
        </fieldset>
        <div className="shipping-buttons">
          <button
            className="shipping-back"
            onClick={() => navigate("/detalledepedido")}
          >
            Volver a detalles
          </button>
          <button className="shipping-confirm" onClick={handleConfirmOrder}>
            Confirmar pedido
          </button>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="shipping-rightcolumn">
        <ul className="shipping-cartitems">
          {cartItems.map((item) => (
            <li key={item.id} className="shipping-cartitem">
              <img src={item.image} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>${item.price.toFixed(2)}</p>
              </div>
              <span>x{item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="shipping-summary">
          <input
            type="text"
            placeholder="Cupón de descuento"
            className="shipping-coupon-input"
          />
          <button className="shipping-coupon-btn">Agregar código</button>
          <div className="shipping-totals">
            <div>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div>
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div className="shipping-total-row">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up de confirmación */}
      {showConfirmation && (
        <div className="confirmation-popup">
          <div className="confirmation-content">
            <h3>¡Pedido Confirmado!</h3>
            <p>Tu pedido ha sido procesado. Serás redirigido al inicio.</p>
            <button onClick={handleCloseConfirmation}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
