import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  icon: string;
  title: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title }) => {
  const navigate = useNavigate();
  return (
    <div className="card-home" onClick={() => navigate("/productos")}>
      <div className="card-icon">
        <img src={icon} alt={title} />
      </div>
      <div className="card-title">{title}</div>
    </div>
  );
};
export default CategoryCard;
