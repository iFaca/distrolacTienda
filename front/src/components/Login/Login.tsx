import React, { useState /*, useEffect, useRef*/ } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Tab,
  Tabs,
  Modal,
  InputGroup,
} from "react-bootstrap";
/* ===== GOOGLE MAPS REMOVIDO (COMENTADO)
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
===== */
import { useLoginMutation, useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import "./Login.css";
import BackIcon from "@mui/icons-material/ArrowBack";
import Logo from "../../assets/logotienda.png";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
  dni: string;
  alias: string;
}

const Login: React.FC = () => {
  // Estados para Login
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Estados para Registro
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    dni: "",
    alias: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] =
    useState<boolean>(false);
  const [registerValidated, setRegisterValidated] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>("");

  /* ===== GOOGLE MAPS REMOVIDO (COMENTADO)
  // Estados para el Mapa y Autocomplete
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null); // Autocomplete del formulario principal
  const [modalAutocomplete, setModalAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null); // Autocomplete dentro del modal

  // Loader de Google Maps (usar variable de entorno)
  const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
    "places",
  ];
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // Efecto para inicializar el mapa cuando el modal se muestra (y la API ya cargó)
  useEffect(() => { ... }, [showMapModal, isLoaded, registerData.address]);

  // HANDLERS PARA AUTOCOMPLETE DEL FORMULARIO PRINCIPAL
  const onLoadAutocomplete = (...) => { ... };
  const onPlaceChanged = () => { ... };

  // HANDLERS PARA AUTOCOMPLETE DEL MODAL
  const onLoadModalAutocomplete = (...) => { ... };
  const onModalPlaceChanged = () => { ... };

  // Función para cerrar el modal y actualizar la dirección desde el marcador
  const handleCloseMapModal = () => { ... };
  ===== */

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  // MANEJADORES DE FORMULARIOS
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);

    try {
      const loginData: LoginFormData = { email: usernameOrEmail, password };
      const res = await login(loginData).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err: any) {
      setError(err?.data?.message || err?.error || "Error al iniciar sesión.");
      console.error("Error de login:", err);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError("");
    const form = event.currentTarget;

    // Validación específica para la dirección (ahora solo input plano)
    if (!registerData.address || registerData.address.trim() === "") {
      setRegisterError("La dirección es requerida");
      return;
    }

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setRegisterValidated(true);
      return;
    }
    setRegisterValidated(true);

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      const confirmPasswordInput = form.elements.namedItem(
        "confirmPassword"
      ) as HTMLInputElement;
      if (confirmPasswordInput) {
        confirmPasswordInput.setCustomValidity("Las contraseñas no coinciden");
      }
      return;
    }

    try {
      // Tomamos la dirección directamente del estado (no hay Autocomplete)
      const dataToSend = {
        username: registerData.username,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        address: registerData.address.trim(),
        phone: registerData.phone,
        dni: registerData.dni,
        alias: registerData.alias,
      };

      const res = await register(dataToSend).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err: any) {
      console.error("Error completo al registrar:", err);
      setRegisterError(
        err?.data?.message || err?.error || "Error al crear la cuenta."
      );
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "dni") {
      const autoGeneratedAlias = value + ".distrolac";
      setRegisterData((prev) => ({
        ...prev,
        alias: autoGeneratedAlias,
      }));
    }
    // Limpiar error de coincidencia si se modifica alguna contraseña
    if (name === "password" || name === "confirmPassword") {
      const form = e.target.form;
      if (form) {
        const confirmPasswordInput = form.elements.namedItem(
          "confirmPassword"
        ) as HTMLInputElement;
        if (confirmPasswordInput) {
          confirmPasswordInput.setCustomValidity("");
        }
      }
      if (name === "confirmPassword" && registerData.password !== value) {
        setRegisterError("Las contraseñas no coinciden");
      } else {
        setRegisterError("");
      }
    }
  };

  /* ===== GOOGLE MAPS REMOVIDO (COMENTADO)
  if (loadError) {
    return (
      <div className="login-page">
        <Alert variant="danger">
          Error cargando Google Maps: {String(loadError)}
        </Alert>
      </div>
    );
  }
  ===== */

  return (
    <div className="login-page">
      <div className={showRegister ? "left-container" : "hidden-register"}>
        <div>
          <div className="logo-container">
            <img
              src={Logo}
              alt="Distrolac Logo"
              className="distro-logo-login"
            />
          </div>
          <div className="div-register-container">
            <h1 className="title-auth">Registrarse</h1>
            <hr className="red-line-login" />
            {registerError && <Alert variant="danger">{registerError}</Alert>}
            <Form
              noValidate
              validated={registerValidated}
              onSubmit={handleRegister}
              className="register-form "
            >
              {/* Campos de Registro */}
              <div>
                <Form.Group controlId="registerEmail">
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    aria-describedby="registerEmailFeedback"
                    className="input-form"
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerEmailFeedback"
                  >
                    Ingrese un email válido.
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div>
                <Form.Group controlId="registerUsername">
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    aria-describedby="registerUsernameFeedback"
                    className="input-form"
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerUsernameFeedback"
                  >
                    Elija un nombre de usuario.
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div>
                <Form.Group controlId="registerDNI">
                  <Form.Control
                    type="text"
                    name="dni"
                    placeholder="DNI"
                    value={registerData.dni}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    aria-describedby="registerDNIFeedback"
                    className="input-form"
                    minLength={8}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerDNIFeedback"
                  >
                    Ingrese un DNI válido.
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div>
                <Form.Group controlId="registerPassword">
                  <Form.Control
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    aria-describedby="registerPasswordFeedback"
                    minLength={6}
                    className="input-form"
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerPasswordFeedback"
                  >
                    Elija una contraseña (mínimo 6 caracteres).
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div>
                <Form.Group controlId="registerConfirmPassword">
                  <Form.Control
                    type={showRegisterPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    aria-describedby="registerConfirmPasswordFeedback"
                    pattern={registerData.password.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      "\\$&"
                    )}
                    className="input-form"
                  />
                  {/* Escapar caracteres especiales para pattern */}
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerConfirmPasswordFeedback"
                  >
                    Las contraseñas no coinciden.
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <Form.Group controlId="registerShowPassword">
                <Form.Check
                  type="checkbox"
                  label="Mostrar contraseña"
                  checked={showRegisterPassword}
                  onChange={(e) => setShowRegisterPassword(e.target.checked)}
                  disabled={isRegisterLoading}
                />
              </Form.Group>

              <div className="delivery-auth">
                <h1 className="title-auth">Datos del envío</h1>
                <div className="name-lastname-auth">
                  <div>
                    <Form.Group controlId="registerFirstName">
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Nombre"
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        required
                        disabled={isRegisterLoading}
                        aria-describedby="registerFirstNameFeedback"
                        className="input-form"
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        id="registerFirstNameFeedback"
                      >
                        Ingrese su nombre.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div>
                    <Form.Group controlId="registerLastName">
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Apellido"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        required
                        disabled={isRegisterLoading}
                        aria-describedby="registerLastNameFeedback"
                        className="input-form"
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        id="registerLastNameFeedback"
                      >
                        Ingrese su apellido.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>
                <div>
                  <Form.Group controlId="registerPhone">
                    <Form.Control
                      type="text"
                      name="phone"
                      placeholder="Ingrese su teléfono"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      required
                      disabled={isRegisterLoading}
                      className="input-form"
                    />
                  </Form.Group>
                </div>
                <div>
                  <div>
                    <Form.Group controlId="registerAddress">
                      {/* ===== INPUT PLANO SIN GOOGLE MAPS ===== */}
                      <InputGroup className="adress-group">
                        <Form.Control
                          type="text"
                          name="address"
                          id="address-input"
                          placeholder="Ingresa tu dirección"
                          value={registerData.address}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                          aria-describedby="registerAddressFeedback"
                          className="input-form adress-input"
                        />
                        {/* Botón Mapa removido (comentado)
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowMapModal(true)}
                          disabled={isRegisterLoading}
                          title="Abrir mapa para seleccionar ubicación"
                          style={{ whiteSpace: "nowrap" }}
                          className="input-form"
                        >
                          Mapa
                        </Button>
                        */}
                      </InputGroup>
                      <Form.Control.Feedback
                        type="invalid"
                        id="registerAddressFeedback"
                      >
                        Por favor ingresa tu dirección.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Campos comentados de referencia futura (conservados) */}
              <div>{/* Street / Number placeholders */}</div>
              <div>{/* PostalCode / Phone placeholders duplicados */}</div>

              <div className="buttons-container">
                <div
                  onClick={() => {
                    if (showLogin) {
                      navigate(-1);
                    } else {
                      setShowRegister(false);
                      setShowLogin(true);
                    }
                  }}
                  className="back-btn"
                >
                  <p>
                    <BackIcon /> Volver
                  </p>
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isRegisterLoading}
                  className="auth-btn"
                >
                  {isRegisterLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className={showLogin ? "right-container" : "hidden-login"}>
        <div id="login-register-div" className="login-register-div">
          {/* === Tab de Login === */}
          <div className="div-login-container">
            <h1 className="title-auth">Acceder</h1>
            <hr className="red-line-login" />
            {error && <Alert variant="danger">{error}</Alert>}
            <Form
              noValidate
              validated={validated}
              onSubmit={handleLogin}
              className="login-form "
            >
              {/* Campos de Login */}
              <Form.Group controlId="loginEmail">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  disabled={isLoginLoading}
                  aria-describedby="loginEmailFeedback"
                  className="input-form"
                />
                <Form.Control.Feedback type="invalid" id="loginEmailFeedback">
                  Ingrese un email válido.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="loginPassword">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoginLoading}
                  aria-describedby="loginPasswordFeedback"
                  className="input-form"
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="loginPasswordFeedback"
                >
                  Ingrese su contraseña.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="loginShowPassword">
                <Form.Check
                  type="checkbox"
                  label="Mostrar contraseña"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  disabled={isLoginLoading}
                />
              </Form.Group>
              <div className="login-button-container">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoginLoading}
                  className="auth-btn"
                >
                  {isLoginLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </div>
              <div className="button-register-container">
                <hr className="red-line-login" />
                <a
                  onClick={() => {
                    setShowRegister(true);
                    setShowLogin(false);
                  }}
                  className="button-register"
                >
                  No tienes cuenta?, Regístrate
                </a>
              </div>
            </Form>
          </div>

          {/* === Tab de Registro === */}
        </div>
      </div>

      {/* === Modal para el mapa (REMOVIDO/COMENTADO) ===
      <Modal
        show={showMapModal}
        onHide={handleCloseMapModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Selecciona tu ubicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoaded ? (
            <>
              <Autocomplete ... />
              <div ref={mapRef} style={{ height: "400px", width: "100%", backgroundColor: "#e0e0e0" }} />
            </>
          ) : (
            <div style={{ height: 400 }} className="d-flex align-items-center justify-content-center">
              <Spinner animation="border" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseMapModal}>
            Confirmar Ubicación
          </Button>
        </Modal.Footer>
      </Modal>
      */}
    </div> // Cierre del Container principal
  ); // Cierre del return
}; // Cierre del componente Login

export default Login;
