import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import emailjs from "@emailjs/browser";
import { RootState } from "../../types";
import "./ShippingDetail.css";

// Constantes de EmailJS
const EMAIL_SERVICE_ID = "service_szd7tra";
const EMAIL_TEMPLATE_CLIENT_ID = "template_9afqj0i";
const EMAIL_TEMPLATE_ADMIN_ID = "template_qnvxrh8";
const EMAIL_PUBLIC_KEY = "ouk745ASI3P1s6qZj";
const ADMIN_EMAIL = "distrolacpedidos@gmail.com";

interface ShippingData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  streetNumber: string;
  phone: string;
  comments?: string;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function ShippingDetail() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [shippingData, setShippingData] = useState<ShippingData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    streetNumber: "",
    phone: "",
    comments: "",
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedShippingData = localStorage.getItem("shippingData");
    const storedCartItems = localStorage.getItem("cart");
    const storedTotal = localStorage.getItem("total");

    if (storedShippingData) {
      setShippingData(JSON.parse(storedShippingData));
    } else if (userInfo) {
      setShippingData({
        username: userInfo.username || "",
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        street: userInfo.street || "",
        streetNumber: userInfo.streetNumber || "",
        phone: userInfo.phone || "",
        comments: "",
      });
    }

    if (storedCartItems) setCartItems(JSON.parse(storedCartItems));
    if (storedTotal) setTotal(parseFloat(storedTotal));
  }, [userInfo]);

  const formatOrderDetails = (items: CartItem[]) => {
    return items
      .map(
        (item) => `
      Producto: ${item.title}
      Cantidad: ${item.quantity}
      Precio unitario: $${Number(item.price).toFixed(2)}
      Subtotal: $${(item.quantity * item.price).toFixed(2)}
      ------------------------
    `
      )
      .join("\n");
  };

  const handleConfirmOrder = async () => {
    try {
      // Primero, crear el pedido en la base de datos
      const orderData = {
        customerInfo: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone,
          street: shippingData.street,
          streetNumber: shippingData.streetNumber,
          comments: shippingData.comments || "",
        },
        orderItems: cartItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        subtotal: total,
        shippingCost: 0, // Envío gratis
        total: total,
        status: "pendiente",
      };

      // Guardar en la base de datos
      const response = await fetch(
        `${import.meta.env.VITE_BACK_APP_URI}/store/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo?.token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar el pedido");
      }

      const savedOrder = await response.json();
      console.log("Pedido guardado:", savedOrder);

      // Luego enviar los emails
      const commonTemplateParams = {
        to_name: `${shippingData.firstName} ${shippingData.lastName}`,
        customer_phone: shippingData.phone,
        customer_address: `${shippingData.street} ${shippingData.streetNumber}`,
        order_details: formatOrderDetails(cartItems),
        order_subtotal: `$${total.toFixed(2)}`,
        order_shipping: "Gratis",
        order_total: `$${total.toFixed(2)}`,
        order_date: new Date().toLocaleDateString(),
        comments: shippingData.comments || "Sin comentarios",
      };

      // Email para el cliente
      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_CLIENT_ID,
        {
          ...commonTemplateParams,
          to_email: shippingData.email,
        },
        EMAIL_PUBLIC_KEY
      );

      // Email para el administrador
      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ADMIN_ID,
        {
          ...commonTemplateParams,
          to_email: ADMIN_EMAIL,
          customer_email: shippingData.email,
        },
        EMAIL_PUBLIC_KEY
      );

      // Limpiar el carrito y los datos
      localStorage.removeItem("cart");
      localStorage.removeItem("total");
      localStorage.removeItem("shippingData");

      // Actualizar estados locales
      setCartItems([]);
      setTotal(0);

      setShowConfirmation(true);

      // Redirigir al usuario a la página de sus pedidos después de un breve delay
      setTimeout(() => {
        navigate("/myorders"); // Redirigir a la página de pedidos en lugar de inicio
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al procesar el pedido");
    }
  };
  return (
    <div className="shipping-container">
      <div className="shipping-leftcolumn">
        <img src="/logo.png" alt="Logo Distrolac" className="shipping-logo" />

        <div className="shipping-info">
          <div className="shipping-info-row">
            <span>Email</span>
            <span>{shippingData.email || "No especificado"}</span>
            <button onClick={() => navigate("/detalledepedido")}>Editar</button>
          </div>
          <div className="shipping-info-row">
            <span>Teléfono</span>
            <span>{shippingData.phone || "No especificado"}</span>
            <button onClick={() => navigate("/detalledepedido")}>Editar</button>
          </div>
          <div className="shipping-info-row">
            <span>Nombre completo</span>
            <span>
              {shippingData.firstName && shippingData.lastName
                ? `${shippingData.firstName} ${shippingData.lastName}`
                : "No especificado"}
            </span>
            <button onClick={() => navigate("/detalledepedido")}>Editar</button>
          </div>
          <div className="shipping-info-row">
            <span>Dirección</span>
            <span>
              {shippingData.street && shippingData.streetNumber
                ? `${shippingData.street} ${shippingData.streetNumber}`
                : "No especificado"}
            </span>
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
          <button
            className="shipping-confirm"
            onClick={handleConfirmOrder}
            disabled={showConfirmation}
          >
            {showConfirmation ? "Procesando..." : "Confirmar pedido"}
          </button>
        </div>
      </div>

      <div className="shipping-rightcolumn">
        <ul className="shipping-cartitems">
          {cartItems.map((item) => (
            <li key={item.id} className="shipping-cartitem">
              <img src={item.image} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>${Number(item.price).toFixed(2)}</p>
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

      {showConfirmation && (
        <div className="confirmation-popup">
          <div className="confirmation-content">
            <h3>¡Pedido Confirmado!</h3>
            <p>
              Tu pedido ha sido procesado. Recibirás un email con los detalles.
            </p>
            <p>Serás redirigido al inicio en unos segundos...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-popup">
          <div className="error-content">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => setError("")}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
