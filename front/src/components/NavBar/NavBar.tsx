// NavBar.tsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../slices/authSlice";
import "./NavBar.css";
import Logo from "../../assets/logotienda.png";
import ProfileIcon from "../../assets/iconprofile.png";
import CartIcon from "../../assets/iconcart.png";
import { RootState } from "../types";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import Badge from "@mui/material/Badge";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [hasItems, setHasItems] = useState(false);

  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const [cartData, setCartData] = useState<any[]>(() => {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  });

  useEffect(() => {
    const handleStorage = () => {
      const data = localStorage.getItem("cart");
      setCartData(data ? JSON.parse(data) : []);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    console.log("cartData", cartData);
    if (cartData.length > 0) {
      setHasItems(true);
    } else {
      setHasItems(false);
    }
  }, [cartData]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsOpen(false);
    setIsNavOpen(false);
  };

  const handleNavClick = () => {
    setIsNavOpen(false);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar">
        <a href="/">
          <img src={Logo} alt="Logo" className="navbar-logo" />
        </a>

        {/* El menú de navegación no cambia */}
        <ul className={`navbar-links-cont ${isNavOpen ? "active" : ""}`}>
          <a href="/productos" onClick={handleNavClick}>
            <li
              className={
                location.pathname === "/productos"
                  ? "navbar-links active-links"
                  : "navbar-links"
              }
            >
              Productos
            </li>
          </a>
          <a href="/sobrenosotros" onClick={handleNavClick}>
            <li
              className={
                location.pathname === "/sobrenosotros"
                  ? "navbar-links active-links"
                  : "navbar-links"
              }
            >
              Sobre nosotros
            </li>
          </a>
          <a href="/comocomprar" onClick={handleNavClick}>
            <li
              className={
                location.pathname === "/comocomprar"
                  ? "navbar-links active-links"
                  : "navbar-links"
              }
            >
              Como comprar?
            </li>
          </a>
          <a href="/trabaja" onClick={handleNavClick}>
            <li
              className={
                location.pathname === "/trabaja"
                  ? "navbar-links active-links"
                  : "navbar-links"
              }
            >
              Trabajá con nosotros
            </li>
          </a>
        </ul>

        <div className="icons-container">
          {/* Menú de perfil y login */}
          {userInfo ? (
            <div className="user-menu">
              <PersonIcon
                onClick={() => setIsOpen(!isOpen)}
                className="account-icon"
              />
              {isOpen && (
                <ul className="menu-dropdown">
                  <li className="menu-header">
                    Hola, <b>{userInfo.username}</b>
                  </li>
                  <li>
                    <a href="/perfil" onClick={() => setIsOpen(false)}>
                      Mi Perfil
                    </a>
                  </li>
                  <li>
                    <a href="/mispedidos" onClick={() => setIsOpen(false)}>
                      Mis Pedidos
                    </a>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <a href="/login">
              <img src={ProfileIcon} alt="Login" className="navbar-icon" />
            </a>
          )}

          {/* Icono del carrito */}
          <a href="/carrito" className="cart-container-navbar">
            <Badge
              color="error"
              variant="dot"
              invisible={!hasItems}
              overlap="circular"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <ShoppingCartOutlinedIcon className="cart-icon" />
            </Badge>
          </a>
          <button
            className={`hamburger-menu ${isNavOpen ? "active" : ""}`}
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
