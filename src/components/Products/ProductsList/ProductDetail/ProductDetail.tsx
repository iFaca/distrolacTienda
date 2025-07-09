import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BackIcon from "@mui/icons-material/ArrowBack"; // Import a back icon from react-icons
import "./ProductDetail.css";
import Alert from "../../../Alert/Alert";
import Breadcrums from "../../../Breadcrumbs/Breadcrums";

const ProductDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertStatus, setAlertStatus] = useState<string>("");
  const [alertEvent, setAlertEvent] = useState<boolean>(false);

  const product = location.state as {
    id: string;
    title: string;
    image: string;
    description: string;
    price?: number;
    priceLists?: Array<{
      marginInPercentage?: number;
    }>;
    categoryName?: string;
  };

  const price = product.price;

  console.log({
    ...product,
    categoryName: product.categoryName,
  });

  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingProductIndex = cart.findIndex(
      (item: { id: string }) => item.id === product.id
    );

    if (existingProductIndex >= 0) {
      // Si el producto ya está en el carrito, actualizamos la cantidad
      cart[existingProductIndex].quantity += quantity;
    } else {
      // Si el producto no está en el carrito, lo agregamos
      cart.push({
        id: product.id,
        title: product.title,
        image: product.image,
        quantity: quantity,
        price: price || 0, // Usamos el precio pasado
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setQuantity(1); // Reiniciar cantidad después de agregar al carrito
    handleShowAlert("Producto agregado al carrito!", "success");
    window.dispatchEvent(new Event("storage"));
  };

  const handleShowAlert = (message: string, status: string) => {
    setAlertMessage(message);
    setAlertStatus(status);
    setShowAlert(true);
    setAlertEvent((prev) => !prev);
  };

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="productdetail-container">
      <Alert
        message={alertMessage}
        status={alertStatus}
        onClose={() => setShowAlert(false)}
        show={showAlert}
        event={() => setAlertEvent(!alertEvent)}
      />
      <div className="productdetail-details">
        <div className="breadcrum-container">
          <Breadcrums
            items={[
              {
                label: "Productos",
                to: "/productos",
              },
              {
                label: product.categoryName || "",
                to: "/productos",
              },
              { label: product.title || "" },
            ]}
          />
        </div>
        <div className="productdetail-image-border">
          <img
            src={product.image}
            alt={product.title}
            style={{ width: "90%", height: "auto" }}
          />
        </div>
        <div className="product-info-container">
          <h2>{product.title}</h2>
          <h3>
            {price !== undefined ? `$${price.toFixed(2)}` : "No disponible"}
          </h3>
          <div className="productdetail-line"></div>
          <div className="productdetail-buttons-container">
            <div>
              <p>Cantidad</p>
              <div className="productdetail-quantityline">
                <button onClick={handleDecrement}>-</button>
                <p>{quantity}</p>
                <button onClick={handleIncrement}>+</button>
              </div>
            </div>
            <button className="productdetail-addbtn" onClick={handleAddToCart}>
              + AÑADIR AL CARRITO
            </button>
          </div>
          {product.description && (
            <div className="productdetail-description">
              <p>Descripción: {product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
