import "./NavBar.css";
import Logo from "../../assets/logotienda.png";
import ProfileIcon from "../../assets/iconprofile.png";
import CartIcon from "../../assets/iconcart.png";
export default function NavBar() {
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
      <div className="navbar-icon-container">
        <a href="/perfil">
          <img src={ProfileIcon} className="navbar-icon" />
        </a>
        <a href="/carrito">
          <img src={CartIcon} className="navbar-icon" />
        </a>
      </div>
    </div>
  );
}
