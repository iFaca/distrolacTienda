import { useNavigate } from "react-router-dom";
import AddToCartIcon from "@mui/icons-material/AddShoppingCart";
import { useState } from "react";
import Alert from "../../Alert/Alert";
import { normalizeCapToKg } from "../../../utils/weight";

interface ProductCardProps {
  id: string;
  title: string;
  image?: string;
  description?: string;
  price?: number;

  // 🔥 CAMPOS CLAVE
  typeOfFractionation?: "No" | "Unitario" | "Pesado";
  cap?: number;

  categoryName: string;
}

interface CartStorageItem {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
  typeOfFractionation?: "No" | "Unitario" | "Pesado";
  cap?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  description,
  price,
  typeOfFractionation,
  cap,
  categoryName,
}) => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");
  const [alertEvent, setAlertEvent] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (!id) return;

    navigate(`/productos/${id}`, {
      state: {
        id,
        title,
        image,
        description,
        price,
        categoryName,
        typeOfFractionation,
        cap,
      },
    });
  };

  const handleAddToCart = () => {
    const cart = localStorage.getItem("cart");
    const cartItems: CartStorageItem[] = cart ? JSON.parse(cart) : [];

    const existingItemIndex = cartItems.findIndex(
      (item) => item.id === id,
    );

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        id,
        title,
        image: image || "",
        quantity: 1,
        price: price || 0,

        // 🔥 CLAVE PARA TODA LA APP
        typeOfFractionation,
        cap:
          typeOfFractionation === "Pesado"
            ? normalizeCapToKg(cap)
            : undefined,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    handleShowAlert("Producto agregado al carrito!", "success");
    window.dispatchEvent(new Event("storage"));
  };

  const handleShowAlert = (message: string, status: string) => {
    setAlertMessage(message);
    setAlertStatus(status);
    setShowAlert(true);
    setAlertEvent((prev) => !prev);
  };

  return (
    <div className="card-product">
      <Alert
        message={alertMessage}
        status={alertStatus}
        onClose={() => setShowAlert(false)}
        show={showAlert}
        event={() => setAlertEvent(!alertEvent)}
      />

      <div
        onClick={handleCardClick}
        style={{
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="img-wrapper">
          {!imageError && image ? (
            <img
              src={image}
              alt={title || "Producto"}
              className="img-product"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="img-fallback">Imagen no disponible</div>
          )}
        </div>

        <div className="card-title-product">{title}</div>
      </div>

      {price !== undefined && (
        <div className="card-price">
          ${price.toFixed(2)}
          {typeOfFractionation === "Pesado" && " / kg"}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart();
        }}
        className="add-to-cart-btn"
        title="Añadir al carrito"
      >
        <AddToCartIcon /> Añadir al carrito
      </button>
    </div>
  );
};

export default ProductCard;
