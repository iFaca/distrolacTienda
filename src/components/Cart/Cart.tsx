import { useEffect, useState } from "react";
import "./Cart.css";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="cart-title-container">
      <h2>Mi carrito</h2>
      <Link to="/productos">
        <h3>Seguir comprando</h3>
      </Link>
      {cartItems.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <>
          <div className="cart-header-table">
            <p>Producto</p>
            <div className="cart-column-center">
              <p>Precio</p>
              <p>Cantidad</p>
            </div>
            <p>Total</p>
          </div>
          <div className="cart-line"></div>
          <div className="cart-list-container">
            <div className="cart-line"></div>
            <ul>
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    justifyContent: "space-between",
                  }}
                >
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
                  <div className="cart-column-center">
                    <p className="price">
                      ${!isNaN(item.price) ? item.price.toFixed(2) : "0.00"}
                    </p>
                    <div className="quantity-container">
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
  );
}
