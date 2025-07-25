import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";
import Arrow from "@mui/icons-material/NavigateNext";
import Home from "@mui/icons-material/Home";

interface BreadcrumsProps {
  items: { label: string; to?: string; onClick?: () => void }[];
}

const Breadcrums: React.FC<BreadcrumsProps> = ({ items }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <>
      <nav className="nav-links">
        <ul>
          <li>
            <Link to="/" className="link-nav-item">
              <Home />
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i}>
              <Arrow fontSize="small" />
              {i < items.length - 1 ? (
                item.to ? (
                  <Link to={item.to} onClick={item.onClick}>
                    {item.label}
                  </Link>
                ) : (
                  <span
                    onClick={item.onClick}
                    style={{ cursor: item.onClick ? "pointer" : "default" }}
                  >
                    {item.label}
                  </span>
                )
              ) : (
                <span className="breadcrumb-current">{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Breadcrums;
