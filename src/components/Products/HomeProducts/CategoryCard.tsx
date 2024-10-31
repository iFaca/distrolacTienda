interface CategoryCardProps {
  icon: string;
  title: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title }) => (
  <div className="card">
    <div className="card-icon">
      <img src={icon} alt={title} />
    </div>
    <div className="card-title">{title}</div>
  </div>
);

export default CategoryCard;
