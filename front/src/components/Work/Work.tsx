import { useState } from "react";
import "./Work.css"; // Asegúrate de tener un archivo CSS para los estilos
import axios from "axios";
import Alert from "../Alert/Alert";
import Spinner from "../Spinner/Spinner";

const BACKEND_API_URL = import.meta.env.VITE_FORM_API || "/form-api";

export default function Work() {
  // Estado para manejar los datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertStatus, setAlertStatus] = useState<string>("");
  const [alertEvent, setAlertEvent] = useState<boolean>(false);

  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  // Función para manejar el cambio en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleShowAlert = (message: string, status: string) => {
    setAlertMessage(message);
    setAlertStatus(status);
    setShowAlert(true);
    setAlertEvent((prev) => !prev);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos del formulario:", formData);
    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_API_URL}/nodemailer/sendEmail`,
        formData
      );
      if (response) {
        console.log("Email enviado:", response.data);
        setHasAnswered(true);
        handleShowAlert("Gracias por tu interés!", "success");
      }
    } catch (error) {
      console.log("Error al enviar el email", error);
      handleShowAlert("Error al enviar el formulario", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Spinner />}
      <div className="work-container">
        <Alert
          message={alertMessage}
          status={alertStatus}
          onClose={() => setShowAlert(false)}
          show={showAlert}
          event={() => setAlertEvent(!alertEvent)}
        />
        <h2 className="work-title">
          Convertite en vendedor oficial de DISTROLAC
        </h2>
        <p className="work-description">
          Estamos emocionados de invitarte a formar parte de Distrolac, una
          distribuidora líder en fiambres y lácteos de la más alta calidad. Si
          buscas una oportunidad de crecimiento profesional y personal, esta es
          tu oportunidad.
        </p>
        <p className="work-description">
          Somos un equipo apasionado, dedicado y comprometido, enfocado en hacer
          llegar las mejores marcas al mejor precio en nuestra querida provincia
          de Mendoza. Estamos orgullosos de los clientes que nos eligen día a
          día, y es por esto que te presentamos nuestra nueva plataforma, donde
          podrás comprar tus productos y recibirlos al día siguiente. Para
          nosotros es muy importante que puedas abastecer tu negocio teniendo un
          proveedor amigo y de confianza que sea capaz de resolver cualquier
          tipo de problema que puedas llegar a tener.
        </p>
        <p className="work-description">
          Te invitamos a formar parte del staff de distrolac, donde podrás
          generar ingresos y llevar la mejores marcas a los negocios de tu zona,
          con todo nuestro respaldo con años de trayectoria.
        </p>
        <p className="work-description">
          Completa el formulario y un agente nuestro se pondrá en contacto con
          vos para darte toda la información necesaria y estar un paso más cerca
          de forma parte de esta gran familia.
        </p>

        {/* Formulario */}
        <form className="work-form" onSubmit={handleSubmit}>
          {hasAnswered ? (
            <>
              <span className="material-icons check-form">check_circle</span>
              <h3 className="answer-work-title">
                ¡Gracias por completar el formulario!
              </h3>
              <p>Nos estaremos comunicando con vos proximamente.</p>
            </>
          ) : (
            <>
              <h3 className="form-title">¡Únete a la familia!</h3>
              <p className="form-subtitle">
                Llena el formulario y obtén toda la información para empezar a
                ser parte de la familia Distrolac.
              </p>

              {/* Campo Nombre */}
              <label htmlFor="nombre" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Escribe tu nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="form-input"
              />

              {/* Campo Apellido */}
              <label htmlFor="apellido" className="form-label">
                Apellido
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                placeholder="Escribe tu apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="form-input"
              />

              {/* Campo Email */}
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Escribe tu email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />

              {/* Campo Teléfono */}
              <label htmlFor="telefono" className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="Escribe tu teléfono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="form-input"
              />

              {/* Botón Enviar */}
              <button type="submit" className="form-submit-button">
                Enviar
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
