import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./ProductList.css";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import Breadcrums from "../../Breadcrumbs/Breadcrums";
import Spinner from "../../Spinner/Spinner";
import SearchIcon from "@mui/icons-material/Search";

const BACKEND_URI = import.meta.env.VITE_BACK_APP_URI;

interface PriceList {
  salePrice: number;
}

interface SubCategoryItem {
  _id: string;
  name: string;
  item: string;
  createdAt: string;
  updatedAt: string;
}

interface Item {
  _id: string;
  name: string;
  categories: SubCategoryItem[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  images?: string[];
  category?: { _id: string; name: string };
  details?: string;
  description?: string;
  currentStock?: number;
  purchasePrice?: number;
  priceLists?: PriceList[];
  offer?: boolean;
  state: boolean;
}

const ProductList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [subCategoryItems, setSubCategoryItems] = useState<Product[]>([]);
  const [itemSelected, setItemSelected] = useState("");
  const [inputFilterProduct, setInputFilterProduct] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URI}/products`);
        const allProducts: Product[] = response.data.filter(
          (p: { state: boolean }) => p.state === true
        );
        setAllProducts(allProducts);
      } catch (error) {
        console.error("Error al traer todos los productos:", error);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const fetchAllItems = async () => {
    try {
      setLoading(true);
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
    fetchAllItems();
  }, []);

  const handleCategoryClick = (item: Item) => {
    setSelectedCategoryId(item._id);
    setSubCategories(item.categories);
    setSubCategoryItems([]);
    setSelectedCategoryName(item.name);
  };

  const handleSubCategoryClick = async (subCategory: SubCategoryItem) => {
    try {
      setLoading(true);
      const filteredProducts = allProducts.filter(
        (product) => product.category?.name === subCategory.name
      );
      setSubCategoryItems(filteredProducts);
      setItemSelected(subCategory.name);
    } catch (error) {
      console.error("Error al traer los items de la subcategoría:", error);
      setError("Error al cargar los items de la subcategoría.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSubCategories([]);
    setSubCategoryItems([]);
    setItemSelected("");
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="products-container">
      {loading && <Spinner />}
      <div className="product-container-2">
        {/* Breadcrumbs */}
        <div className="breadcrum-container">
          {selectedCategoryId === null ? (
            <Breadcrums items={[{ label: "Productos" }]} />
          ) : (
            <Breadcrums
              items={[
                {
                  label: "Productos",
                  to: "/productos",
                  onClick: handleBackToCategories,
                },
                { label: selectedCategoryName || "" },
              ]}
            />
          )}
        </div>

        {/* Si no hay categoría seleccionada: mostrar items */}
        {selectedCategoryId === null ? (
          <div className="categories-container">
            <div className="product-grid-2">
              <div className="header-products-list">
                <div className="text-products-home">
                  <div className="h2-container">
                    <h2>PRODUCTOS</h2>
                  </div>
                  <h2>POR CATEGORÍAS</h2>
                </div>

                <div className="search-bar-products">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={inputFilterProduct}
                    onChange={(e) => setInputFilterProduct(e.target.value)}
                    className="search-input-products"
                  />
                  <div className="search-icon-container">
                    <SearchIcon className="search-icon-products" />
                  </div>
                </div>
              </div>

              {inputFilterProduct === "" ? (
                items.map((item) => (
                  <CategoryCard
                    key={item._id}
                    title={item.name}
                    onClick={() => handleCategoryClick(item)}
                    isSelected={false}
                  />
                ))
              ) : (
                <div className="product-grid-items">
                  {(() => {
                    const filteredProducts = allProducts.filter((product) =>
                      product.name
                        .toLowerCase()
                        .includes(inputFilterProduct.toLowerCase())
                    );

                    if (allProducts.length === 0)
                      return <p>No se encontraron productos.</p>;

                    if (filteredProducts.length === 0)
                      return (
                        <p>
                          No hay productos que coincidan con "
                          {inputFilterProduct}".
                        </p>
                      );

                    return filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        title={product.name}
                        price={
                          product.priceLists?.length &&
                          product.priceLists[product.priceLists.length - 1]
                            ?.salePrice
                            ? product.priceLists[product.priceLists.length - 1]
                                ?.salePrice
                            : "N/A"
                        }
                        image={
                          product.images?.[0] || "/imagen-no-disponible.png"
                        }
                        description={product.description || ""}
                        categoryName={itemSelected || ""}
                      />
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="subcategories-container">
            <div className="product-grid">
              <div className="header-products-list">
                <div className="text-products-home">
                  <div className="h2-container">
                    <h2>{selectedCategoryName}</h2>
                  </div>
                </div>
              </div>

              {/* Subcategorías */}
              <div className="product-grid">
                {subCategories.length > 0 ? (
                  subCategories.map((subCategory) => (
                    <CategoryCard
                      key={subCategory._id}
                      title={subCategory.name}
                      onClick={() => handleSubCategoryClick(subCategory)}
                      isSelected={itemSelected === subCategory.name}
                    />
                  ))
                ) : (
                  <p>No hay subcategorías disponibles.</p>
                )}
              </div>

              {/* Productos de subcategoría */}
              {subCategoryItems.length > 0 && (
                <div className="product-list-items">
                  <div className="text-title-sub">
                    <h5>Productos de la Subcategoría </h5>
                    <h5 className="item-h5">{itemSelected}</h5>
                  </div>
                  <hr />
                  <div className="product-grid-items">
                    {subCategoryItems.map((product) => (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        title={product.name}
                        price={
                          product.priceLists?.length &&
                          product.priceLists[product.priceLists.length - 1]
                            ?.salePrice
                            ? product.priceLists[product.priceLists.length - 1]
                                ?.salePrice
                            : "N/A"
                        }
                        image={
                          product.images?.[0] || "/imagen-no-disponible.png"
                        }
                        description={product.description || ""}
                        categoryName={itemSelected || ""}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
