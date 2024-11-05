import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  description?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  description,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (id) {
      // Verifica que el id esté definido
      navigate(`/productos/${id}`, {
        state: { id, title, image, description },
      });
    } else {
      console.error("ID del producto no está definido");
    }
  };

  return (
    <div
      className="card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <img
        src={image}
        alt={title}
        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
      />
      <div className="card-title">{title}</div>
      <button>Agregar al carro</button>
    </div>
  );
};

export default ProductCard;
