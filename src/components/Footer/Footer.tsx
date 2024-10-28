import "./Footer.css";
import Instagram from "../../assets/instagram.png";
import Linkedin from "../../assets/linkedin.png";
import Facebook from "../../assets/facebook.png";
import LogoFooter from "../../assets/logo footer.png";

export default function Footer() {
  return (
    <div className="footer">
      <div className="social-icons-container">
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Instagram} alt="Instagram icon" className="social-icon" />
        </a>
        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Linkedin} alt="LinkedIn icon" className="social-icon" />
        </a>
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Facebook} alt="Facebook icon" className="social-icon" />
        </a>
      </div>
      <img src={LogoFooter} className="footer-logo" alt="Company logo" />
    </div>
  );
}
