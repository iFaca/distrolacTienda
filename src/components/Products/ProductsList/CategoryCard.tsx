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
    <div
      className={isSelected ? "card-category-selected" : "card-category"}
      onClick={onClick}
      data-content={title}
    >
      <div className="card-title">{title}</div>
    </div>
  );
};

export default CategoryCard;
