import { useNavigate } from "react-router-dom";
import AddToCartIcon from "@mui/icons-material/AddShoppingCart";
import { useState } from "react";
import Alert from "../../Alert/Alert";

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  description?: string;
  price?: number;
  priceLists?: Array<{
    marginInPercentage?: number;
  }>;
  categoryName: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  description,
  price,
  priceLists,
  categoryName
}) => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertStatus, setAlertStatus] = useState<string>("");
  const [alertEvent, setAlertEvent] = useState<boolean>(false);

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

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(
      (item: any) => item.id === id
    );

    if (existingItemIndex !== -1) {
      // Si ya existe, incrementar la cantidad
      cartItems[existingItemIndex].quantity += 1;
    } else {
      // Si no existe, agregarlo con cantidad inicial de 1
      cartItems.push({
        id,
        title,
        image,
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
    setAlertEvent(prev => !prev);
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
        style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
      >
        <img
          src={image}
          alt={title}
          style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          className="img-product"
        />
        <hr />
        <div className="card-title-product">{title}</div>
      </div>
      {price !== undefined && typeof price === "number" && (
        <div className="card-price">${price}</div>
      )}
      <button
        onClick={handleAddToCart}
        className="add-to-cart-btn"
        title="Añadir al carrito"
      >
        <AddToCartIcon />
      </button>
    </div>
  );
};

export default ProductCard;
