import { useEffect, useState } from "react";
import "./Cart.css";
import { Link } from "react-router-dom";

interface CartItem {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      setCartItems(JSON.parse(cartData));
    }
  }, []);

  const calculateTotal = () => {
    return cartItems
      .reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)
      .toFixed(2);
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (id: string, amount: number) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + amount) }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
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
            <p>Precio</p>
            <p>Cantidad</p>
            <p>Total</p>
          </div>
          <div className="cart-line"></div>
          <div className="cart-list-container">
            <div className="cart-line"></div>
            <ul>
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  style={{ display: "flex", marginBottom: "10px" }}
                >
                  <div className="cart-product-container">
                    <div className="cart-image-container">
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: "100%",
                        }}
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
                  <p className="price">${(item.price || 0).toFixed(2)}</p>

                  <div className="quantity-container">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      -
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>

                  <p className="total">
                    ${(item.price * item.quantity).toFixed(2)}
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
            <button className="detail-button">Ver detalle</button>
          </div>
        </>
      )}
    </div>
  );
}
