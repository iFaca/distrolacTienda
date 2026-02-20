import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./HomeSearch.css";
import SearchIcon from "@mui/icons-material/Search";

const BACKEND_URI = import.meta.env.VITE_BACK_APP_URI;

interface Product {
  _id: string;
  name: string;
  images?: string[];
  priceLists?: { salePrice: number }[];
}

const HomeSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URI}/products`);

        const filtered = res.data
          .filter((p: Product) =>
            p.name.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 6);

        setResults(filtered);
      } catch (error) {
        console.error("Error buscando productos", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="home-search">
      {/* INPUT + ICONO */}
      <div className="home-search-input-wrapper">
        <SearchIcon className="home-search-icon" />

        <input
          className="home-search-input"
          placeholder="¿Qué estás buscando?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate(`/productos`, { state: { query } });
            }
          }}
        />
      </div>

      {(results.length > 0 || loading) && (
        <div className="search-dropdown">
          {loading && <div className="search-loading">Buscando...</div>}

          {results.map((p) => (
            <Link
              key={p._id}
              to={`/productos/${p._id}`}
              className="search-result-item"
              onClick={() => setQuery("")}
            >
              <span>{p.name}</span>

              {p.priceLists?.length ? (
                <span className="search-price">
                  ${p.priceLists.at(-1)?.salePrice}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
