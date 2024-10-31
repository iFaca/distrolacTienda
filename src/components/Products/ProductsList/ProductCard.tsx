interface ProductCardProps {
  title: string;
  image: string;
  description?: string; // Opción de agregar descripción
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  onClick,
  image,
  description,
}) => (
  <div className="card" onClick={onClick} style={{ cursor: "pointer" }}>
    <img
      src={image}
      alt={title}
      style={{ width: "100%", height: "auto", borderRadius: "8px" }}
    />
    <div className="card-title">{title}</div>
    <button>Agregar al carro</button>
    {description && <p className="card-description">{description}</p>}{" "}
  </div>
);

export default ProductCard;
