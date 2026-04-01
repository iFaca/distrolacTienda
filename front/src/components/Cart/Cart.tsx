import { useEffect, useState } from "react";
import "./Cart.css";
import { Link, useNavigate } from "react-router-dom";
import CartEmpty from "@mui/icons-material/AddShoppingCart";
import CartLogo from "@mui/icons-material/ShoppingCart";
import Breadcrums from "../Breadcrumbs/Breadcrums";
import { normalizeCapToKg } from "../../utils/weight";

interface CartItem {
  id: string;
  title: string;
  image: string;
  quantity: number; // hormas o unidades
  price: number; // precio unitario o precio por kg
  typeOfFractionation?: "No" | "Unitario" | "Pesado";
  cap?: number; // kg por horma
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const handleViewDetails = () => {
    navigate("/detalledepedido");
  };
  useEffect(() => {
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
      localStorage.removeItem("cart");
    }
  }, []);

  // 👉 TOTAL POR ITEM (LOGICA CORRECTA)
  const getItemTotal = (item: CartItem) => {
    const isPesado = item.typeOfFractionation === "Pesado";
    const capKg = normalizeCapToKg(item.cap);

    return isPesado
      ? item.price * item.quantity * capKg
      : item.price * item.quantity;
  };

  // 👉 SUBTOTAL
  const calculateTotal = () => {
    const total = cartItems.reduce((acc, item) => acc + getItemTotal(item), 0);
    localStorage.setItem("total", total.toString());
    return total.toFixed(2);
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (id: string, amount: number) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id !== id) return item;

      const newQuantity = Math.max(1, item.quantity + amount);

      return { ...item, quantity: newQuantity };
    });

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
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
                  {cartItems.map((item) => {
                    const isPesado = item.typeOfFractionation === "Pesado";
                    const capKg = normalizeCapToKg(item.cap);
                    const realKg = isPesado
                      ? item.quantity * capKg
                      : item.quantity;

                    return (
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

                            {/* 👇 ACA MOSTRAMOS HORMAS / KG SIN ROMPER CSS */}
                            <p style={{ fontSize: 13, opacity: 0.8 }}>
                              {item.quantity} {isPesado ? "Hormas" : "Unidades"}
                              {isPesado && capKg > 0 && (
                                <> (≈ {realKg.toFixed(2)} kg)</>
                              )}
                            </p>

                            <button
                              className="remove-button"
                              onClick={() => removeItem(item.id)}
                            >
                              Borrar
                            </button>
                          </div>
                        </div>

                        {/* PRECIO */}
                        <p className="price">
                          ${item.price.toFixed(2)}
                          {isPesado && " / kg"}
                        </p>

                        {/* CANTIDAD */}
                        <div className="quantity-container">
                          <div>
                            {isPesado ? (
                              <input
                                type="number"
                                step={0.1}
                                value={item.quantity === 0 ? "" : item.quantity}
                                className="quantity-input"
                                onChange={(e) => {
                                  const value = e.target.value;

                                  // 👉 permitimos vacío mientras escribe
                                  const parsed =
                                    value === "" ? 0 : Number(value);

                                  if (isNaN(parsed)) return;

                                  const updatedCart = cartItems.map(
                                    (cartItem) =>
                                      cartItem.id === item.id
                                        ? { ...cartItem, quantity: parsed }
                                        : cartItem,
                                  );

                                  setCartItems(updatedCart);
                                  localStorage.setItem(
                                    "cart",
                                    JSON.stringify(updatedCart),
                                  );
                                }}
                                onBlur={() => {
                                  // 👉 si queda vacío o negativo, normalizamos a 0
                                  if (
                                    item.quantity < 0 ||
                                    item.quantity === null
                                  ) {
                                    const updatedCart = cartItems.map(
                                      (cartItem) =>
                                        cartItem.id === item.id
                                          ? { ...cartItem, quantity: 0 }
                                          : cartItem,
                                    );

                                    setCartItems(updatedCart);
                                    localStorage.setItem(
                                      "cart",
                                      JSON.stringify(updatedCart),
                                    );
                                  }
                                }}
                              />
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    if (item.quantity - 1 <= 0) {
                                      removeItem(item.id);
                                    } else {
                                      updateQuantity(item.id, -1);
                                    }
                                  }}
                                >
                                  -
                                </button>

                                <span>{item.quantity}</span>

                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  +
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* TOTAL */}
                        <p className="total">
                          ${getItemTotal(item).toFixed(2)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="cart-summary">
                <div className="cart-summary-subcont">
                  <p>
                    Sub-total <span>${calculateTotal()}</span>
                  </p>
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
