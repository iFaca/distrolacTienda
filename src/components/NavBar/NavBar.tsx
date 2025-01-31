// NavBar.tsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../slices/authSlice";
import "./NavBar.css";
import Logo from "../../assets/logotienda.png";
import ProfileIcon from "../../assets/iconprofile.png";
import CartIcon from "../../assets/iconcart.png";
import { RootState } from "../types";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <div className="navbar">
      <a href="/">
        <img src={Logo} alt="Logo" className="navbar-logo" />
      </a>

      <ul className="navbar-links-cont">
        <a href="/productos">
          <li className="navbar-links">
            <h2>Productos</h2>
          </li>
        </a>
        <a href="/sobrenosotros">
          <li className="navbar-links">
            <h2>Sobre nosotros</h2>
          </li>
        </a>
        <a href="/comocomprar">
          <li className="navbar-links">
            <h2>Como comprar?</h2>
          </li>
        </a>
        <a href="/trabaja">
          <li className="navbar-links">
            <h2>Trabajá con nosotros</h2>
          </li>
        </a>
      </ul>

      <div className="icons-container">
        {userInfo ? (
          <div className="user-menu">
            <img
              src={ProfileIcon}
              alt="Profile"
              className="navbar-icon"
              onClick={() => setIsOpen(!isOpen)}
            />
            {isOpen && (
              <ul className="menu-dropdown">
                <li className="menu-header">Hola, {userInfo.username}</li>
                <li>
                  <a href="/perfil">Mi Perfil</a>
                </li>
                <li>
                  <a href="/mispedidos">Mis Pedidos</a>
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
        <a href="/carrito">
          <img src={CartIcon} alt="Cart" className="navbar-icon" />
        </a>
      </div>
    </div>
  );
}
