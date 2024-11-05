import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./ProductList.css";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

const BACKEND_URI = import.meta.env.VITE_BACK_APP_URI;

// Define las interfaces para tus datos
interface SubCategoryItem {
  _id: string;
  name: string;
  item: string; // ID del item principal al que pertenece
  createdAt: string;
  updatedAt: string;
}

interface Item {
  _id: string;
  name: string;
  categories: SubCategoryItem[]; // Array de subcategorías
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  category: { _id: string; name: string }; // Categoría del producto
  details: string;
  description: string;
  currentStock: number;
  purchasePrice: number;
}

const ProductList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [subCategoryItems, setSubCategoryItems] = useState<Product[]>([]); // Cambia el tipo aquí a Product

  // Función para obtener todos los items
  const fetchAllItems = async () => {
    try {
      const response = await axios.get(`${BACKEND_URI}/items`);
      console.log("Datos de items de la API:", response.data);
      setItems(response.data);
    } catch (error) {
      console.error("Error al traer los items:", error);
      setError(
        "Error al traer los items. Verifica la consola para más detalles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItems(); // Llamar a la API al montar el componente
  }, []);

  const handleCategoryClick = (item: Item) => {
    console.log("Item seleccionado al hacer clic:", item);
    setSelectedCategoryId(item._id);
    setSubCategories(item.categories); // Obtener subcategorías del item seleccionado
    setSubCategoryItems([]); // Reiniciar items de subcategoría
  };

  const navigate = useNavigate();

  const handleSubCategoryClick = async (subCategory: SubCategoryItem) => {
    console.log("Subcategoría seleccionada:", subCategory);
    try {
      // Hacer la solicitud GET para obtener todos los productos
      const response = await axios.get(`${BACKEND_URI}/products`);
      const allProducts: Product[] = response.data;

      // Filtrar los productos para encontrar los que coinciden con la subcategoría seleccionada
      const filteredProducts = allProducts.filter(
        (product) => product.category.name === subCategory.name // Comparar el name de la subcategoría con el name de la categoría del producto
      );

      console.log("Productos filtrados de la subcategoría:", filteredProducts);
      setSubCategoryItems(filteredProducts); // Establecer los items de la subcategoría
    } catch (error) {
      console.error("Error al traer los items de la subcategoría:", error);
      setError("Error al cargar los items de la subcategoría.");
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSubCategories([]);
    setSubCategoryItems([]); // Reiniciar items de subcategoría
  };

  // Renderizado de carga y errores
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="products-container">
      {selectedCategoryId === null ? (
        <div className="product-grid">
          {items.map((item) => (
            <CategoryCard
              key={item._id}
              title={item.name}
              onClick={() => handleCategoryClick(item)} // Al hacer clic, obtener las subcategorías
            />
          ))}
        </div>
      ) : (
        <div>
          <button onClick={handleBackToCategories}>Volver a Categorías</button>
          <h2>Subcategorías</h2>
          <div className="product-grid">
            {subCategories.length > 0 ? (
              subCategories.map((subCategory) => (
                <CategoryCard
                  key={subCategory._id}
                  title={subCategory.name}
                  onClick={() => handleSubCategoryClick(subCategory)} // Llamar a la función para obtener items de la subcategoría
                />
              ))
            ) : (
              <p>No hay subcategorías disponibles.</p>
            )}
          </div>

          {subCategoryItems.length > 0 && (
            <div>
              <h3>Items de Subcategoría</h3>
              <div className="product-grid">
                {subCategoryItems.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    title={product.name}
                    purchasePrice={product.purchasePrice}
                    image={product.images[0]} // Mostrar la primera imagen del producto
                    description={product.description} // Asegúrate de pasar la descripción
                    onClick={() => {
                      console.log(`Producto seleccionado: ${product.name}`);
                      navigate(`/productos/${product._id}`, {
                        state: {
                          id: product._id,
                          title: product.name,
                          image: product.images[0],
                          description: product.description,
                          purchasePrice: product.purchasePrice,
                        },
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
