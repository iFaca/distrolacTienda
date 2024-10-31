interface CategoryCardProps {
  title: string;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, onClick }) => (
  <div className="card" onClick={onClick}>
    <div className="card-title">{title}</div>
  </div>
);

export default CategoryCard;
