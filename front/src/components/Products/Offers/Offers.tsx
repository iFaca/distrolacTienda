import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../ProductsList/ProductCard';
import Spinner from '../../Spinner/Spinner';
// 1. Elimina la importación del CSS de ofertas
// import './Offers.css'; 
// 2. Importa el CSS de ProductList. Asegúrate de que la ruta relativa sea correcta.
import '../ProductsList/ProductList.css'; 

const BACKEND_URI = import.meta.env.VITE_BACK_APP_URI;

interface Product {
  _id: string;
  name: string;
  images: string[];
  category: { _id: string; name: string };
  details: string;
  description: string;
  currentStock: number;
  offer?: boolean;
  priceLists: Array<{
    salePrice: number;
  }>;
}

const Offers: React.FC = () => {
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ... la lógica para obtener los datos sigue siendo la misma ...
    const fetchOfferProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BACKEND_URI}/products`);
        const allProducts: Product[] = response.data;
        const filteredProducts = allProducts.filter(product => product.offer === true);
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

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    // Puedes mantener un estilo simple para el error o crear uno
    return <div style={{ textAlign: 'center', color: 'red', margin: '20px' }}>{error}</div>;
  }
    
  if (offerProducts.length === 0) {
    return null; // No renderizar nada si no hay ofertas
  }

  // 3. Reemplaza el return con esta nueva estructura JSX
  return (
    <div className="products-container"> {/* Contenedor principal */}
      <div className="product-container-2"> {/* Contenedor secundario */}
        
        {/* Estructura para el título, idéntica a ProductList */}
        <div className="header-products-list">
            <div className="text-products-home">
                <div className="h2-container">
                    <h2>PRODUCTOS</h2>
                </div>
                <h2>EN OFERTA</h2>
            </div>
        </div>

        {/* Contenedor para la lista de productos */}
        <div className="product-list-items">
          <hr />
          <div className="product-grid-items"> {/* El grid que contiene las tarjetas */}
            {offerProducts.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                title={product.name}
                price={
                  product.priceLists && product.priceLists.length >= 5
                    ? product.priceLists[4].salePrice
                    : undefined // Usar undefined si no hay precio
                }
                image={product.images[0]}
                description={product.description}
                categoryName={product.category.name || ""}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;