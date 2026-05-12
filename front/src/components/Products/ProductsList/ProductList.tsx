import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./ProductList.css";
import ProductCard from "./ProductCard";
import { useLocation } from "react-router-dom";
import Breadcrums from "../../Breadcrumbs/Breadcrums";
import Spinner from "../../Spinner/Spinner";
import SearchIcon from "@mui/icons-material/Search";

const BACKEND_URI = import.meta.env.VITE_BACK_APP_URI;

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
  price: number;
  offer?: boolean;
  state?: boolean;

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

  const location = useLocation();
  const query = location.state?.query || "";

  // =========================
  // FETCH PRODUCTS
  // =========================
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URI}/store/products`);
        const filteredProducts: Product[] = response.data.filter(
          (product: Product) => product.state === true,
        );
        setAllProducts(filteredProducts);
        if (query) {
          setInputFilterProduct(query);
        }
      } catch (error) {
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // =========================
  // FETCH CATEGORIES
  // =========================
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URI}/items`);
        setItems(response.data);
      } catch (error) {
        setError("Error al traer categorías.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  // =========================
  // HANDLERS
  // =========================
  const handleCategoryClick = (item: Item) => {
    setSelectedCategoryId(item._id);
    setSelectedCategoryName(item.name);
    setSubCategories(item.categories);
    setItemSelected("");

    const subCategoryNames = item.categories.map((c) => c.name);

    const productsOfCategory = allProducts.filter((product) =>
      subCategoryNames.includes(product.category?.name || ""),
    );

    setSubCategoryItems(productsOfCategory);
  };

  const handleSubCategoryClick = (subCategory: SubCategoryItem) => {
    const filteredProducts = allProducts.filter(
      (product) => product.category?.name === subCategory.name,
    );

    setSubCategoryItems(filteredProducts);
    setItemSelected(subCategory.name);
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
    setSubCategories([]);
    setSubCategoryItems([]);
    setItemSelected("");
    setInputFilterProduct("");
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

        {/* =========================
            CATEGORÍAS (SIDEBAR)
        ========================= */}
        {selectedCategoryId === null ? (
          <div className="products-layout">
            {/* SIDEBAR */}
            <aside className="categories-sidebar">
              <h3 className="sidebar-title">Categorías</h3>

              {items.map((item) => (
                <CategoryCard
                  key={item._id}
                  title={item.name}
                  onClick={() => handleCategoryClick(item)}
                  isSelected={false}
                />
              ))}
            </aside>

            {/* CONTENT */}
            <section className="products-content">
              {/* BOTÓN VOLVER */}
              {selectedCategoryId !== null && (
                <button
                  className="back-to-categories-btn"
                  onClick={handleBackToCategories}
                >
                  ← Volver a categorías
                </button>
              )}

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
                <div className="empty-state">
                  Seleccioná una categoría o buscá un producto.
                </div>
              ) : (
                <div className="product-grid-items">
                  {allProducts
                    .filter((product) =>
                      product.name
                        .toLowerCase()
                        .includes(inputFilterProduct.toLowerCase()),
                    )
                    .map((product) => (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        title={product.name}
                        price={product.price}
                        image={product.images?.[0] || "/imagen-no-disponible.png"}
                        description={product.description || ""}
                        categoryName={itemSelected || ""}
                        typeOfFractionation={product.typeOfFractionation}
                        cap={product.cap}
                      />
                    ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* =========================
              SUBCATEGORÍAS
          ========================= */
          <div className="products-layout">
            <aside className="categories-sidebar">
              <h3 className="sidebar-title">Subcategorías</h3>

              {subCategories.map((subCategory) => (
                <CategoryCard
                  key={subCategory._id}
                  title={subCategory.name}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  isSelected={itemSelected === subCategory.name}
                />
              ))}
            </aside>

            <section className="products-content">
              <button
                className="back-to-categories-btn"
                onClick={handleBackToCategories}
              >
                ← Volver a categorías
              </button>
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

              <div className="product-grid-items">
                {subCategoryItems
                  .filter((product) =>
                    product.name
                      .toLowerCase()
                      .includes(inputFilterProduct.toLowerCase()),
                  )
                  .map((product) => (
                    <ProductCard
                      key={product._id}
                      id={product._id}
                      title={product.name}
                      price={product.price}
                      image={product.images?.[0] || "/imagen-no-disponible.png"}
                      description={product.description || ""}
                      categoryName={itemSelected || ""}
                      typeOfFractionation={product.typeOfFractionation}
                      cap={product.cap}
                    />
                  ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
