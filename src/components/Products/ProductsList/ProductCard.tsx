import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  description?: string;
  price?: number;
  priceLists?: Array<{
    marginInPercentage?: number;
  }>;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  description,
  price,
  priceLists,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (id) {
      navigate(`/productos/${id}`, {
        state: { id, title, image, description, price },
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
    alert("Producto agregado al carrito");
  };

  return (
    <div className="card">
      <div
        onClick={handleCardClick}
        style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
      >
        <img
          src={image}
          alt={title}
          style={{ width: "100%", height: "auto", borderRadius: "8px" }}
        />
        <div className="card-title">{title}</div>
        {price !== undefined && (
          <div className="card-price">Precio: ${price.toFixed(2)}</div>
        )}
      </div>
      <button onClick={handleAddToCart}>Agregar al carro</button>
    </div>
  );
};

export default ProductCard;
