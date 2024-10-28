import "./NavBar.css";
import Logo from "../../assets/logotienda.png";
import ProfileIcon from "../../assets/iconprofile.png";
import CartIcon from "../../assets/iconcart.png";
export default function NavBar() {
  return (
    <div className="navbar">
      <img src={Logo} alt="Logo" className="navbar-logo" />
      <ul className="navbar-links-cont">
        <a>
          <li className="navbar-links">
            <h2>Productos</h2>
          </li>
        </a>
        <a>
          <li className="navbar-links">
            <h2>Sobre nosotros</h2>
          </li>
        </a>
        <a>
          <li className="navbar-links">
            <h2>Como comprar?</h2>
          </li>
        </a>
        <a>
          <li className="navbar-links">
            <h2>Trabajá con nosotros</h2>
          </li>
        </a>
      </ul>
      <div className="navbar-icon-container">
        <a>
          <img src={ProfileIcon} className="navbar-icon" />
        </a>
        <a>
          <img src={CartIcon} className="navbar-icon" />
        </a>
      </div>
    </div>
  );
}
