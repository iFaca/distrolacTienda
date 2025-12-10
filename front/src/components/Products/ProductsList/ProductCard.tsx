import { useNavigate } from "react-router-dom";
import AddToCartIcon from "@mui/icons-material/AddShoppingCart";
import { useState } from "react";
import Alert from "../../Alert/Alert";

interface ProductCardProps {
  id: string;
  title: string;
  image?: string;
  description?: string;
  price?: number;
  priceLists?: Array<{ marginInPercentage?: number }>;
  categoryName: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  description,
  price,
  priceLists,
  categoryName,
}) => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");
  const [alertEvent, setAlertEvent] = useState(false);
  const [imageError, setImageError] = useState(false); // ⬅️ nuevo estado

  const handleCardClick = () => {
    if (id) {
      navigate(`/productos/${id}`, {
        state: { id, title, image, description, price, categoryName },
      });
    } else {
      console.error("ID del producto no está definido");
    }
  };

  const handleAddToCart = () => {
    const cart = localStorage.getItem("cart");
    let cartItems = cart ? JSON.parse(cart) : [];

    const existingItemIndex = cartItems.findIndex(
      (item: any) => item.id === id
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
              alt={title || "Producto sin nombre"}
              className="img-product"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="img-fallback">Imagen no disponible</div>
          )}
        </div>

        <div className="card-title-product">{title}</div>
      </div>

      {price !== undefined && typeof price === "number" && (
        <div className="card-price">${price}</div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation(); // ⛔ evita que se dispare handleCardClick
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
