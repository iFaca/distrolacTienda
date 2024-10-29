interface ProductCardProps {
  icon: string;
  title: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ icon, title }) => (
  <div className="card">
    <div className="card-icon">
      <img src={icon} alt={title} />
    </div>
    <div className="card-title">{title}</div>
  </div>
);

export default ProductCard;
