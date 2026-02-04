import "./WhatsAppButton.css";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_PHONE = "5492616605818";
const DEFAULT_MESSAGE = "Hola! Quería hacer una consulta 😊";

const WhatsAppButton: React.FC = () => {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    DEFAULT_MESSAGE,
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="WhatsApp"
    >
      <FaWhatsapp size={32} />
    </a>
  );
};

export default WhatsAppButton;
