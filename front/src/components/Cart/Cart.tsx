import { useEffect, useState } from "react";
import "./Cart.css";
import { Link, useNavigate } from "react-router-dom";
import BackIcon from "@mui/icons-material/ArrowBack";
import CartEmpty from "@mui/icons-material/AddShoppingCart";
import CartLogo from "@mui/icons-material/ShoppingCart";
import Breadcrums from "../Breadcrumbs/Breadcrums";

interface CartItem {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.warn("Datos inválidos en el carrito.");
          localStorage.removeItem("cart");
        }
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
      localStorage.removeItem("cart");
    }
  }, []);

  const calculateTotal = () => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * (item.quantity || 1),
      0
    );
    localStorage.setItem("total", total.toString()); // Guardar sin redondeo
    return total.toFixed(2);
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (id: string, amount: number) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, (item.quantity || 1) + amount) }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleViewDetails = () => {
    try {
      navigate("/detalledepedido");
    } catch (error) {
      console.error("Error al navegar a los detalles del pedido:", error);
    }
  };

  return (
    <div className="cart-full-container">
      <div className="cart-title-container">
        <div className="breadcrum-container">
          <Breadcrums items={[{ label: "Mi carrito" }]} />
        </div>
        <div className="cart-container">
          <div className="cart-header-container">
            <div className="red-underline">
              <h1 className="cart-title">
                MI CARRITO <CartLogo />
              </h1>
            </div>
            <Link to="/productos">
              <h3 className="continue-shopping">Seguir comprando</h3>
            </Link>
          </div>
          {cartItems.length === 0 ? (
            <div className="cart-empty-container">
              <h2>El carrito está vacío</h2>
              <button
                className="btn-add-cart"
                onClick={() => navigate("/productos")}
              >
                <CartEmpty />
                Agregar productos al carrito
              </button>
            </div>
          ) : (
            <>
              <div className="cart-line"></div>
              <div className="cart-list-container">
                <div className="cart-line"></div>
                <div className="cart-list-headers">
                  <span style={{ flex: 3 }}>Producto</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Precio</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Cantidad</span>
                  <span style={{ flex: 1, textAlign: "right" }}>Total</span>
                </div>
                <ul>
                  {cartItems.map((item) => (
                    <li key={item.id} className="product-cart-container-full">
                      <div className="cart-product-container">
                        <div className="cart-image-container">
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{ width: "100%" }}
                          />
                        </div>
                        <div className="cart-product-details">
                          <h3>{item.title}</h3>
                          <button
                            className="remove-button"
                            onClick={() => removeItem(item.id)}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>

                      <p className="price">
                        ${!isNaN(item.price) ? item.price.toFixed(2) : "0.00"}
                      </p>
                      <div className="quantity-container">
                        <div>
                          <button onClick={() => updateQuantity(item.id, -1)}>
                            -
                          </button>
                          <span>{item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>
                            +
                          </button>
                        </div>
                      </div>

                      <p className="total">
                        $
                        {!isNaN(item.price * item.quantity)
                          ? (item.price * item.quantity).toFixed(2)
                          : "0.00"}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cart-summary">
                <div className="cart-summary-subcont">
                  <p>
                    Sub-total <span>${calculateTotal()}</span>
                  </p>
                  <p className="cart-summary-cost">No incluye costo de envío</p>
                </div>
                <button className="detail-button" onClick={handleViewDetails}>
                  Ver detalle
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
