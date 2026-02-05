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
  description?: string;
  priceLists?: PriceList[];
  offer?: boolean;
  state?: boolean;

  // 🔥 CLAVE PARA PESADOS
  typeOfFractionation?: "No" | "Unitario" | "Pesado";
  cap?: number;
}

const ProductList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
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
        const filteredProducts: Product[] = response.data.filter(
          (product: Product) => product.state === true,
        );
        setAllProducts(filteredProducts);
      } catch (error) {
        console.error("Error al traer productos:", error);
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
      setItems(response.data);
    } catch (error) {
      console.error("Error al traer items:", error);
      setError("Error al traer categorías.");
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
        (product) => product.category?.name === subCategory.name,
      );
      setSubCategoryItems(filteredProducts);
      setItemSelected(subCategory.name);
    } catch (error) {
      console.error(error);
      setError("Error al cargar productos.");
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
                  {allProducts
                    .filter((product) =>
                      product.name
                        .toLowerCase()
                        .includes(inputFilterProduct.toLowerCase()),
                    )
                    .map((product) => {
                      const salePrice =
                        product.priceLists?.at(-1)?.salePrice || 0;

                      return (
                        <ProductCard
                          key={product._id}
                          id={product._id}
                          title={product.name}
                          price={salePrice}
                          image={
                            product.images?.[0] || "/imagen-no-disponible.png"
                          }
                          description={product.description || ""}
                          categoryName={itemSelected || ""}
                          // 🔥 FIX DEFINITIVO
                          typeOfFractionation={product.typeOfFractionation}
                          cap={product.cap}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="subcategories-container">
            <div className="product-grid">
              {subCategories.map((subCategory) => (
                <CategoryCard
                  key={subCategory._id}
                  title={subCategory.name}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  isSelected={itemSelected === subCategory.name}
                />
              ))}

              {subCategoryItems.length > 0 && (
                <>
                  <div className="search-products-subcategory">
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
                  <div className="product-grid-items">
                    {subCategoryItems
                      .filter((product) => {
                        return product.name
                          .toLowerCase()
                          .includes(inputFilterProduct.toLowerCase());
                      })
                      .map((product) => {
                        const salePrice =
                          product.priceLists?.at(-1)?.salePrice || 0;

                        return (
                          <ProductCard
                            key={product._id}
                            id={product._id}
                            title={product.name}
                            price={salePrice}
                            image={
                              product.images?.[0] || "/imagen-no-disponible.png"
                            }
                            description={product.description || ""}
                            categoryName={itemSelected || ""}
                            // 🔥 FIX DEFINITIVO
                            typeOfFractionation={product.typeOfFractionation}
                            cap={product.cap}
                          />
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
