import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import "./ProductDetail.css";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const product = location.state as {
    id: string;
    title: string;
    image: string;
    description: string;
  };

  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => (prevQuantity > 0 ? prevQuantity - 1 : 0));
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
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setQuantity(0); // Reiniciar cantidad después de agregar al carrito
    alert("Producto agregado al carrito");
  };

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="productdetail-container">
      <div className="productdetail-details">
        <h2>{product.title}</h2>
        <h3>Precio:</h3>
        <div className="productdetail-line"></div>
        <div className="productdetail-buttons-container">
          <div className="productdetail-quantityline">
            <button onClick={handleDecrement}>-</button>
            <p>{quantity}</p>
            <button onClick={handleIncrement}>+</button>
          </div>
          <button className="productdetail-addbtn" onClick={handleAddToCart}>
            + Agregar al carrito
          </button>
        </div>
        {product.description && (
          <div className="productdetail-description">
            <p>Descripción: {product.description}</p>
          </div>
        )}
      </div>
      <div className="productdetail-image-border">
        <img
          src={product.image}
          alt={product.title}
          style={{ width: "90%", height: "auto" }}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
