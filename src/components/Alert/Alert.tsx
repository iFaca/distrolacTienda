import "./Alert.css";
import IconClose from "@mui/icons-material/CloseRounded";
import SuccessIcon from "@mui/icons-material/CheckCircle";
import { useEffect } from "react";

interface AlertProps {
  message: string;
  status: string;
  onClose: () => void;
  show: boolean;
  event: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, status, onClose, show, event }) => {
  // Oculta el alert automáticamente después de 2.5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // o 3000 ms si prefieres
    return () => clearTimeout(timer);
  }, [event]);

  return (
    <div
      className={`alert-container ${
        status === "success" ? "success" : "error"
      }${show ? " show" : ""}`}
    >
      <div className="alert-text-container">
        {status === "success" ? <SuccessIcon /> : ""}
        <p>{message}</p>
        <p className="icon-close" onClick={onClose}>
          <IconClose />
        </p>
      </div>
    </div>
  );
};

export default Alert;
