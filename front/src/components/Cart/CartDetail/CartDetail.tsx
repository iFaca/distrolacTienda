import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../types";
import { Alert } from "react-bootstrap";
import "./CartDetail.css";
import Breadcrums from "../../Breadcrumbs/Breadcrums";

interface CartItem {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
  cap?: number;
  typeOfFractionation?: "Unitario" | "Pesado" | "No";
}

interface ShippingData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: string;
  comments?: string;
  dni?: string;
  alias?: string;
}

export default function CartDetail() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState("");

  const [shippingData, setShippingData] = useState<ShippingData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    comments: "",
    dni: "",
    alias: "",
  });

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) setCartItems(JSON.parse(cartData));

    if (userInfo) {
      setShippingData({
        username: userInfo.username || "",
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        address: userInfo.address || "",
        phone: userInfo.phone || "",
        comments: "",
        dni: userInfo.dni || "",
        alias: userInfo.alias || "",
      });
    }
  }, [userInfo]);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      if (item.typeOfFractionation === "Pesado" && item.cap) {
        return acc + item.price * item.cap * item.quantity;
      }
      return acc + item.price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal().toFixed(2);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
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
    return true;
  };

  const handleGoToShipping = () => {
    if (!validateForm()) return;
    localStorage.setItem("shippingData", JSON.stringify(shippingData));
    localStorage.setItem("total", subtotal);
    navigate("/editarpedido");
  };

  return (
    <div className="cart-detail-full-container">
      <div className="cartdetail-container-1">
        <div className="breadcrum-container">
          <Breadcrums
            items={[
              { label: "Mi carrito", to: "/carrito" },
              { label: "Detalles del pedido" },
            ]}
          />
        </div>

        <div className="red-underline">
          <h1>DETALLES DEL PEDIDO</h1>
        </div>

        <div className="cartdetail-container">
          <div>
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
                />
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
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={shippingData.lastName}
                    onChange={handleInputChange}
                  />
                </div>

                <input
                  type="text"
                  name="address"
                  placeholder="Dirección completa"
                  value={shippingData.address}
                  onChange={handleInputChange}
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono"
                  value={shippingData.phone}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="comments"
                  placeholder="Comentarios (Opcional)"
                  value={shippingData.comments}
                  onChange={handleInputChange}
                />
              </fieldset>
            </div>

            <div className="cartdetail-rightcolumn">
              <h2>Detalle del Pedido</h2>

              <ul className="cartdetail-items">
                {cartItems.map((item) => {
                  const isPesado = item.typeOfFractionation === "Pesado";
                  const kgTotales =
                    isPesado && item.cap ? item.cap * item.quantity : null;

                  const subtotalProducto =
                    isPesado && kgTotales
                      ? item.price * kgTotales
                      : item.price * item.quantity;

                  return (
                    <li key={item.id} className="cartdetail-item">
                      <img src={item.image} alt={item.title} />
                      <div>
                        <h3>{item.title}</h3>

                        {!isPesado && (
                          <>
                            <p>${item.price.toFixed(2)}</p>
                            <p>
                              {item.quantity} unidades · Subtotal $
                              {subtotalProducto.toFixed(2)}
                            </p>
                          </>
                        )}

                        {isPesado && kgTotales && (
                          <>
                            <p>${item.price.toFixed(2)} / kg</p>
                            <p>
                              {item.quantity} horma
                              {item.quantity > 1 && "s"} (~
                              {kgTotales.toFixed(2)} kg)
                            </p>
                            <p>
                              Subtotal producto: ${subtotalProducto.toFixed(2)}
                            </p>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="cartdetail-summary">
                <div className="cartdetail-totals">
                  <div>
                    <span>Subtotal</span>
                    <span className="subtotal-span">${subtotal}</span>
                  </div>
                  <div>
                    <span>Envío</span>
                    <span className="free-delivery">Gratis</span>
                  </div>
                  <div className="cartdetail-total-row">
                    <span>Total</span>
                    <span>${subtotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cartdetail-buttons">
            <button onClick={handleGoToShipping}>Continuar con el envío</button>
          </div>
        </div>
      </div>
    </div>
  );
}
