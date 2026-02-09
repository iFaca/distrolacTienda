import "./ProductList.css";

interface CategoryCardProps {
  title: string;
  onClick: () => void;
  isSelected: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  onClick,
  isSelected,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`category-item ${isSelected ? "active" : ""}`}
    >
      {title}
    </button>
  );
};

export default CategoryCard;
