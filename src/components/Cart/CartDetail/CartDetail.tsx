import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [email, setEmail] = useState(""); // Estado para el email
  const [address, setAddress] = useState(""); // Estado para la dirección
  const [name, setName] = useState(""); // Estado para el nombre
  const [lastName, setLastName] = useState(""); // Estado para el apellido
  const [comments, setComments] = useState(""); // Estado para los comentarios

  const navigate = useNavigate();

  useEffect(() => {
    // Cargar carrito y total desde localStorage
    const cartData = localStorage.getItem("cart");
    const totalData = localStorage.getItem("total");

    if (cartData) setCartItems(JSON.parse(cartData));
    if (totalData) setTotal(totalData);

    // Cargar datos de usuario desde localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { email, address, name, lastName, comments } = JSON.parse(userData);
      setEmail(email || "");
      setAddress(address || "");
      setName(name || "");
      setLastName(lastName || "");
      setComments(comments || "");
    }
  }, []);

  const handleGoToShipping = () => {
    // Validación
    if (!email || !address) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Guardar datos de contacto y envío en localStorage
    const userData = {
      email,
      address,
      name,
      lastName,
      comments,
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // Navegar a la vista de envío
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
          <input
            type="email"
            placeholder="Ingresa un email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Actualiza el estado
          />
          <label className="cartdetail-checkbox">
            <input type="checkbox" />
            <span>Quiero recibir ofertas por email</span>
          </label>
        </fieldset>
        <fieldset className="cartdetail-form">
          <legend>Datos de envío</legend>
          <div className="cartdetail-row">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)} // Actualiza el estado
            />
            <input
              type="text"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)} // Actualiza el estado
            />
          </div>
          <input
            type="text"
            placeholder="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)} // Actualiza el estado
          />
          <input
            type="text"
            placeholder="Comentarios (Opcional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)} // Actualiza el estado
          />
        </fieldset>
        <div className="cartdetail-buttons">
          <a href="#">Volver al carrito</a>
          <button onClick={handleGoToShipping}>Ir a Envío</button>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="cartdetail-rightcolumn">
        <h2>Detalle del Pedido</h2>
        <ul className="cartdetail-items">
          {cartItems.map((item) => {
            const price = parseFloat(item.price.toString());
            const formattedPrice = !isNaN(price) ? price.toFixed(2) : "0.00";
            return (
              <li key={item.id} className="cartdetail-item">
                <img src={item.image} alt={item.title} />
                <div>
                  <h3>{item.title}</h3>
                  <p>$ {formattedPrice}</p>
                </div>
                <p className="cartdetail-quantity">x{item.quantity}</p>
              </li>
            );
          })}
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
