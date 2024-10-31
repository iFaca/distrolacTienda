import React from "react";
import CategoryCard from "./CategoryCard";
import "./Category.css";
import { Link } from "react-router-dom";
// Importing images
import aceites from "../../../assets/aceites.png";
import lacteos from "../../../assets/lacteos.png";
import galletas from "../../../assets/galletas.png";
import pastas from "../../../assets/pastas.png";
import quesos from "../../../assets/quesos.png";
import bebidas from "../../../assets/bebidas.png";
import enlatados from "../../../assets/enlatados.png";
import aderezos from "../../../assets/aderezos.png";
import jugos from "../../../assets/jugos.png";
import fiambres from "../../../assets/fiambres.png";

interface Product {
  title: string;
  icon: string;
}

// Array of product categories with imported images
const productCategories: Product[] = [
  { title: "Aceites", icon: aceites },
  { title: "Lacteos", icon: lacteos },
  { title: "Galletas y cereales", icon: galletas },
  { title: "Pastas", icon: pastas },
  { title: "Quesos", icon: quesos },
  { title: "Bebidas", icon: bebidas },
  { title: "Enlatados", icon: enlatados },
  { title: "Aderezos", icon: aderezos },
  { title: "Jugos", icon: jugos },
  { title: "Fiambres", icon: fiambres },
];

const Categories: React.FC = () => (
  <div className="products">
    <h2>Productos</h2>
    <p>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</p>
    <div className="product-grid">
      {productCategories.map((product, index) => (
        <CategoryCard key={index} icon={product.icon} title={product.title} />
      ))}
    </div>
    <Link className="more-products" to="/productos">
      Ver más productos
    </Link>
  </div>
);

export default Categories;
