import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../ProductsList/ProductCard";
import Spinner from "../../Spinner/Spinner";
import "../ProductsList/ProductList.css";

const BACKEND_URI = import.meta.env.VITE_BACK_APP_URI;

interface Product {
  _id: string;
  name: string;
  images?: string[];
  category?: { _id: string; name: string };
  details?: string;
  description?: string;
  currentStock?: number;
  offer?: boolean;
  priceLists?: Array<{
    salePrice: number;
  }>;
  state?: boolean;
}

const Offers: React.FC = () => {
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfferProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BACKEND_URI}/products`);
        const allProducts: Product[] = response.data || [];
        const filteredProducts = allProducts.filter(
          (product) => product.offer === true && product.state === true,
        );
        setOfferProducts(filteredProducts);
      } catch (err) {
        console.error("Error al traer los productos en oferta:", err);
        setError("No se pudieron cargar las ofertas.");
      } finally {
        setLoading(false);
      }
    };
    fetchOfferProducts();
  }, []);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div style={{ textAlign: "center", color: "red", margin: "20px" }}>
        {error}
      </div>
    );
  if (offerProducts.length === 0) return null;

  return (
    <div className="products-container home-container">
      <div className="product-container-2">
        <div className="header-products-list">
          <div className="text-products-home">
            <div className="h2-container">
              <h2>PRODUCTOS</h2>
            </div>
            <h2>EN OFERTA</h2>
          </div>
        </div>

        <div className="product-list-items">
          <hr />
          <div className="product-grid-items">
            {offerProducts.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                title={product.name}
                price={
                  product.priceLists && product.priceLists.length > 0
                    ? product.priceLists.at(-1)?.salePrice // último precio si existe
                    : undefined
                }
                image={product.images?.[0] || "/imagen-no-disponible.png"}
                description={product.description || ""}
                categoryName={product.category?.name || ""}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
