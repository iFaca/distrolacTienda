import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../types";
import { Alert } from "react-bootstrap";
import "./CartDetail.css";

interface CartItem {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

interface ShippingData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string; // Usando solo address
  phone: string;
  comments?: string;
}

export default function CartDetail() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState("0");
  const [error, setError] = useState("");

  const [shippingData, setShippingData] = useState<ShippingData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    comments: "",
  });

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    const totalData = localStorage.getItem("total");

    if (cartData) setCartItems(JSON.parse(cartData));
    if (totalData) setTotal(totalData);

    if (userInfo) {
      console.log("UserInfo:", userInfo);

      // Intenta obtener la dirección de diferentes maneras
      let addressValue = "";

      if (userInfo.address) {
        // Si existe directamente en userInfo
        addressValue = userInfo.address;
      } else if (userInfo._id) {
        // Si tenemos un ID de usuario, podríamos intentar obtener los datos actualizados
        // desde el backend (esto requeriría una API adicional)
        console.log("El campo address no está disponible en userInfo");

        // Alternativa: intentar recuperarlo del localStorage si se guardó previamente
        const savedShippingData = localStorage.getItem("shippingData");
        if (savedShippingData) {
          try {
            const parsedData = JSON.parse(savedShippingData);
            if (parsedData.address) {
              addressValue = parsedData.address;
              console.log(
                "Usando dirección guardada previamente:",
                addressValue
              );
            }
          } catch (err) {
            console.error("Error al parsear shippingData guardado:", err);
          }
        }
      }

      setShippingData({
        username: userInfo.username || "",
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        address: addressValue,
        phone: userInfo.phone || "",
        comments: "",
      });
    }
  }, [userInfo]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !shippingData.email ||
      !shippingData.address ||
      !shippingData.firstName ||
      !shippingData.lastName ||
      !shippingData.phone
    ) {
      setError("Por favor, complete todos los campos obligatorios");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingData.email)) {
      setError("Por favor, ingrese un email válido");
      return false;
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(shippingData.phone.replace(/\D/g, ""))) {
      setError("Por favor, ingrese un número de teléfono válido");
      return false;
    }

    return true;
  };

  const handleGoToShipping = () => {
    if (!validateForm()) {
      return;
    }

    localStorage.setItem("shippingData", JSON.stringify(shippingData));
    navigate("/editarpedido");
  };
  console.log("ShippingData:", shippingData);
  return (
    <div className="cartdetail-container">
      <div className="cartdetail-leftcolumn">
        {error && <Alert variant="danger">{error}</Alert>}

        <fieldset className="cartdetail-form">
          <legend>Contacto</legend>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={shippingData.email}
            onChange={handleInputChange}
            required
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
              name="firstName"
              placeholder="Nombre"
              value={shippingData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Apellido"
              value={shippingData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Único campo de dirección */}
          <input
            type="text"
            name="address"
            placeholder="Dirección completa"
            value={shippingData.address}
            onChange={handleInputChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Teléfono"
            value={shippingData.phone}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="comments"
            placeholder="Comentarios (Opcional)"
            value={shippingData.comments}
            onChange={handleInputChange}
          />
        </fieldset>

        <div className="cartdetail-buttons">
          <a href="#" onClick={() => navigate("/cart")}>
            Volver al carrito
          </a>
          <button onClick={handleGoToShipping}>Continuar con el envío</button>
        </div>
      </div>

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
              <span>Gratis</span>
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
