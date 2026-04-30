import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button, Alert, Modal, InputGroup } from "react-bootstrap";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useLoginMutation, useRegisterMutation, useForgotPasswordMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import "./Login.css";
import BackIcon from "@mui/icons-material/ArrowBack";
import Logo from "../../assets/logotienda.png";

/* =====================================================
   VALIDACIONES
===================================================== */
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
const phoneRegex = /^\d+$/;
const dniRegex = /^\d{8}$/;
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const genericRegisterErrorRegex =
  /error al crear usuario|no pudimos crear la cuenta|internal server error|request failed/i;

const extractValidationMessage = (text: string): string | null => {
  const normalized = text.replace(/\s+/g, " ").trim();

  const fullMatch = normalized.match(/validation failed:\s*(.+)$/i);
  if (fullMatch?.[1]) {
    return fullMatch[1]
      .replace(/^(password|phone|email|dni)\s*:\s*/i, "")
      .replace(/^storeuser\s+validation\s+failed:\s*/i, "")
      .trim();
  }

  const passwordMatch = normalized.match(/la contrase[ñn]a[^.]*\.?/i);
  if (passwordMatch?.[0]) return passwordMatch[0].trim();

  const phoneMatch = normalized.match(/(tel[eé]fono|phone)[^.]*\.?/i);
  if (phoneMatch?.[0]) return phoneMatch[0].trim();

  return null;
};

const getRegisterErrorMessage = (err: any): string => {
  const status = err?.status;
  const data = err?.data ?? {};

  const candidateTexts = [
    typeof data === "string" ? data : null,
    data?.message,
    data?.error,
    data?.details,
    err?.error,
    err?.message,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  for (const text of candidateTexts) {
    const extractedMessage = extractValidationMessage(text);
    if (extractedMessage) {
      return extractedMessage;
    }
  }

  const nestedErrors = [
    data?.errors,
    data?.error?.errors,
    data?.details?.errors,
    data?.details,
  ];

  for (const candidate of nestedErrors) {
    if (candidate && typeof candidate === "object") {
      const messages = Object.values(candidate)
        .map((error: any) => error?.message || error)
        .filter((msg): msg is string => typeof msg === "string" && msg.trim().length > 0);

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  const duplicateFields = Array.isArray(data?.duplicateFields)
    ? data.duplicateFields.map((field: unknown) => String(field).toLowerCase())
    : [];

  const rawMessage = [data?.message, data?.error, err?.message, ...duplicateFields]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isValidationError =
    /validation failed|validatorerror|datos inv[aá]lidos|invalid/.test(rawMessage);

  if (isValidationError) {
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message
        .replace(/^\w+\s+validation failed:\s*/i, "")
        .trim();
    }

    if (/password|contrase[ñn]a/.test(rawMessage)) {
      return "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número.";
    }

    if (/\bphone\b|tel[eé]fono/.test(rawMessage)) {
      return "El teléfono no es válido. Ingresá solo números.";
    }

    return "Algunos datos no son válidos. Revisalos e intentá nuevamente.";
  }

  const isDuplicateError =
    status === 409 ||
    /duplicate|duplicad|unique|already exists|ya existe|p2002/.test(rawMessage);

  if (duplicateFields.includes("dni") || /\bdni\b/.test(rawMessage)) {
    return "Ya existe una cuenta con ese DNI. Si ya tenes cuenta, inicia sesion.";
  }

  if (
    duplicateFields.includes("email") ||
    /\bemail\b|correo/.test(rawMessage)
  ) {
    return "Ya existe una cuenta con ese email. Proba iniciar sesion o usar otro email.";
  }

  if (
    duplicateFields.includes("username") ||
    duplicateFields.includes("alias") ||
    /username|usuario|alias/.test(rawMessage)
  ) {
    return "Ya existe una cuenta con esos datos. Proba con otros valores.";
  }

  if (isDuplicateError) {
    return "Ya existe una cuenta con esos datos. Revisa DNI, email o alias.";
  }

  if (
    typeof data?.message === "string" &&
    data.message.trim() &&
    !genericRegisterErrorRegex.test(data.message)
  ) {
    return data.message;
  }

  if (typeof err?.error === "string") {
    const extractedMessage = extractValidationMessage(err.error);
    if (extractedMessage) {
      return extractedMessage;
    }
  }

  return "No pudimos crear la cuenta. Intenta nuevamente en unos minutos.";
};

interface RegisterFormData {
  username: string; // queda en el state pero ya no se pide en el formulario
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
  alias: string;
}

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  const reason = params.get("reason");

  const [checkoutMessage, setCheckoutMessage] = useState("");

  // ================= LOGIN =================
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");

  // ================= REGISTER =================
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: "", // ya no se completa en UI, backend lo genera
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    alias: "",
  });

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerValidated, setRegisterValidated] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [dniServerError, setDniServerError] = useState(false);
  const [emailServerError, setEmailServerError] = useState(false);

  // ================= MAPA =================
  const [showMapModal, setShowMapModal] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [modalAutocomplete, setModalAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  // ================= FORGOT PASSWORD =================
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotEmailValid, setForgotEmailValid] = useState(true);
  const [forgotLoading, setForgotLoading] = useState(false);

  /* MENSAJE SI VIENE DEL CHECKOUT */
  useEffect(() => {
    if (reason === "checkout") {
      setCheckoutMessage(
        "Para continuar con la compra debes iniciar sesión o crear una cuenta.",
      );
    }
  }, [reason]);

  // ================= MAP EFFECT =================
  useEffect(() => {
    if (!isLoaded || !showMapModal || !mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat: -32.8894, lng: -68.8458 },
      mapTypeControl: false,
      streetViewControl: false,
    });

    const markerInstance = new google.maps.Marker({
      map: mapInstance,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    if (registerData.address) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: registerData.address }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          mapInstance.setCenter(results[0].geometry.location);
          markerInstance.setPosition(results[0].geometry.location);
        }
      });
    }

    markerInstance.addListener("dragend", () => {
      const position = markerInstance.getPosition();
      if (!position) return;

      new google.maps.Geocoder().geocode(
        { location: position },
        (results, status) => {
          if (status === "OK" && results?.[0]) {
            setRegisterData((prev) => ({
              ...prev,
              address: results[0].formatted_address,
            }));
          }
        },
      );
    });

    return () => {
      markerInstance.setMap(null);
      setMap(null);
      setMarker(null);
    };
  }, [isLoaded, showMapModal]);

  // ================= LOGIN HANDLER =================
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    try {
      const res = await login({
        email: usernameOrEmail,
        password,
      }).unwrap();

      dispatch(setCredentials({ ...res }));

      if (redirect) {
        navigate(`/${redirect}`, { replace: true });
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err?.data?.message || "Error al iniciar sesión.");
    }
  };

  // ================= REGISTER HANDLER =================
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterErrorType(null);
    setRegisterValidated(true);
    // Limpiar errores del servidor al intentar registrar nuevamente
    setDniServerError(false);
    setEmailServerError(false);

    if (!nameRegex.test(registerData.firstName)) {
      setRegisterError("Nombre inválido.");
      setRegisterErrorType("client");
      return;
    }

    if (!nameRegex.test(registerData.lastName)) {
      setRegisterError("Apellido inválido.");
      setRegisterErrorType("client");
      return;
    }

    if (!dniRegex.test(registerData.dni)) {
      setRegisterError("DNI inválido. Debe tener exactamente 8 dígitos.");
      return;
    }

    if (!phoneRegex.test(registerData.phone)) {
      setRegisterError("Teléfono inválido. Debe tener entre 8 y 15 dígitos.");
      return;
    }

    // Validar contraseña con regex (min 8 chars, lowercase, uppercase, number, symbol)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;
    if (!passwordRegex.test(registerData.password)) {
      setRegisterError(
        "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un símbolo."
      );
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden.");
      setRegisterErrorType("client");
      return;
    }

    try {
      // No enviamos username: el backend lo genera automáticamente
      const { username: _username, ...payload } = registerData;

      const res = await register(payload as any).unwrap();
      dispatch(setCredentials({ ...res }));

      if (redirect) {
        navigate(`/${redirect}`, { replace: true });
      } else {
        navigate("/");
      }
    } catch (err: any) {
      // Mostrar mensaje de error específico del backend
      const errorMessage = err?.data?.message || "Error al crear la cuenta.";
      setRegisterError(errorMessage);

      // Si el error es sobre DNI, marcar el campo como inválido
      if (errorMessage.toLowerCase().includes("dni")) {
        setDniServerError(true);
      }

      // Si el error es sobre usuario ya registrado, marcar email como inválido
      if (errorMessage.toLowerCase().includes("usuario ya registrado")) {
        setEmailServerError(true);
      }
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const normalizedValue = name === "phone" ? value.replace(/\D/g, "") : value;

    setRegisterData((prev) => ({
      ...prev,
      [name]: normalizedValue,
      ...(name === "dni" ? { alias: `${normalizedValue}.distrolac` } : {}),
    }));
    // Limpiar errores del servidor cuando el usuario modifica los campos
    if (name === "dni") {
      setDniServerError(false);
    }
    if (name === "email") {
      setEmailServerError(false);
    }
  };

  // ================= FORGOT PASSWORD HANDLER =================
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleForgotEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForgotEmail(value);
    setForgotEmailValid(emailRegex.test(value) || value === "");
    setForgotError("");
    setForgotSuccess("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail) {
      setForgotError("El email es requerido");
      return;
    }

    if (!emailRegex.test(forgotEmail)) {
      setForgotError("Ingrese un email válido");
      return;
    }

    try {
      await forgotPassword(forgotEmail).unwrap();
      setForgotSuccess("Se ha enviado un correo con instrucciones para restablecer tu contraseña");
      setForgotEmail("");
    } catch (err: any) {
      setForgotError(err?.data?.message || "Error al enviar el correo");
    }
  };

  return (
    <div className="login-page">
      {checkoutMessage && (
        <div className="checkout-alert-container">
          <Alert variant="info">{checkoutMessage}</Alert>
        </div>
      )}

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
            {registerError && registerErrorType === "server" && (
              <Alert variant="danger">{registerError}</Alert>
            )}

            <Form
              noValidate
              validated={registerValidated}
              onSubmit={handleRegister}
              className="register-form "
            >
              <div>
                <Form.Group controlId="registerEmail">
                  <Form.Label className="auth-label">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    isInvalid={emailServerError}
                    aria-describedby="registerEmailFeedback"
                    className="input-form"
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerEmailFeedback"
                  >
                    {emailServerError ? "Este email ya está registrado" : "Ingrese un email válido."}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div>
                <Form.Group controlId="registerDNI">
                  <Form.Label className="auth-label">DNI</Form.Label>
                  <Form.Control
                    type="text"
                    name="dni"
                    placeholder="DNI"
                    value={registerData.dni}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    isInvalid={dniServerError}
                    aria-describedby="registerDNIFeedback"
                    className="input-form"
                    minLength={8}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerDNIFeedback"
                  >
                    {dniServerError ? "El DNI ya está registrado. Por favor usa otro." : "Ingrese un DNI válido."}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div>
                <Form.Group controlId="registerPassword">
                  <Form.Label className="auth-label">Contraseña</Form.Label>
                  <Form.Control
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    aria-describedby="registerPasswordFeedback"
                    className="input-form"
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerPasswordFeedback"
                  >
                    La contraseña debe tener al menos 6 caracteres e incluir una
                    letra mayúscula, una minúscula y un número.
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div>
                <Form.Group controlId="registerConfirmPassword">
                  <Form.Label className="auth-label">
                    Confirmar contraseña
                  </Form.Label>
                  <Form.Control
                    type={showRegisterPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    isInvalid={
                      registerValidated &&
                      registerData.password !== registerData.confirmPassword
                    }
                    aria-describedby="registerConfirmPasswordFeedback"
                    className="input-form"
                  />

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
                      <Form.Label className="auth-label">Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Nombre"
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        required
                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$"
                        disabled={isRegisterLoading}
                        className="input-form"
                      />
                    </Form.Group>
                  </div>

                  <div>
                    <Form.Group controlId="registerLastName">
                      <Form.Label className="auth-label">Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Apellido"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        required
                        disabled={isRegisterLoading}
                        className="input-form"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div>
                  <Form.Group controlId="registerPhone">
                    <Form.Label className="auth-label">Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      placeholder="Ingrese su teléfono"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      required
                      inputMode="numeric"
                      disabled={isRegisterLoading}
                      className="input-form"
                    />
                  </Form.Group>
                </div>

                <div>
                  <Form.Group controlId="registerAddress">
                    <Form.Label className="auth-label">Dirección</Form.Label>

                    <InputGroup className="adress-group">
                      {isLoaded ? (
                        <Autocomplete
                          onLoad={(instance) => setAutocomplete(instance)}
                          onPlaceChanged={() => {
                            if (autocomplete) {
                              const place = autocomplete.getPlace();
                              if (place && place.formatted_address) {
                                setRegisterData((prev) => ({
                                  ...prev,
                                  address: place.formatted_address ?? "",
                                }));

                                if (
                                  map &&
                                  marker &&
                                  place.geometry &&
                                  place.geometry.location
                                ) {
                                  map.panTo(place.geometry.location);
                                  map.setZoom(17);
                                  marker.setPosition(place.geometry.location);
                                }
                              }
                            }
                          }}
                        >
                          <Form.Control
                            type="text"
                            name="address"
                            placeholder="Ingresa o busca tu dirección"
                            value={registerData.address}
                            onChange={handleRegisterChange}
                            required
                            disabled={isRegisterLoading}
                            className="input-form adress-input"
                          />
                        </Autocomplete>
                      ) : (
                        <Form.Control
                          type="text"
                          placeholder="Cargando Google Maps..."
                          disabled
                          className="input-form adress-input"
                        />
                      )}

                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowMapModal(true)}
                        disabled={isRegisterLoading}
                        className="input-form"
                      >
                        Mapa
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </div>
              </div>

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
                  {isRegisterLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className={showLogin ? "right-container" : "hidden-login"}>
        <div id="login-register-div" className="login-register-div">
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
              <Form.Group controlId="loginEmail">
                <Form.Label className="auth-label">Email o usuario</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Email o usuario"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  disabled={isLoginLoading}
                  className="input-form"
                />
              </Form.Group>

              <Form.Group controlId="loginPassword">
                <Form.Label className="auth-label">Contraseña</Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoginLoading}
                  className="input-form"
                />
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

              <div className="forgot-password-container">
                <a
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail("");
                    setForgotError("");
                    setForgotSuccess("");
                    setForgotEmailValid(true);
                  }}
                  className="forgot-password-link"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="login-button-container">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoginLoading}
                  className="auth-btn"
                >
                  {isLoginLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <Modal
        show={showForgotModal}
        onHide={() => setShowForgotModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Recuperar Contraseña</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="forgot-modal-text">
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
          </p>

          {forgotError && (
            <Alert variant="danger">{forgotError}</Alert>
          )}
          {forgotSuccess && (
            <Alert variant="success">{forgotSuccess}</Alert>
          )}

          <Form onSubmit={handleForgotPassword}>
            <Form.Group controlId="forgotEmail">
              <Form.Label className="auth-label">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email"
                value={forgotEmail}
                onChange={handleForgotEmailChange}
                isInvalid={!forgotEmailValid && forgotEmail !== ""}
                disabled={isForgotLoading || !!forgotSuccess}
                className="input-form"
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                Ingrese un email válido.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowForgotModal(false)}
            disabled={isForgotLoading}
          >
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={handleForgotPassword}
            disabled={isForgotLoading || !!forgotSuccess}
            className="auth-btn"
          >
            {isForgotLoading ? "Enviando..." : "Enviar"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showMapModal}
        onHide={() => setShowMapModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Selecciona tu ubicación</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Autocomplete
            onLoad={(instance) => setModalAutocomplete(instance)}
            onPlaceChanged={() => {
              if (!modalAutocomplete) return;
              const place = modalAutocomplete.getPlace();
              if (place.geometry && place.geometry.location && map && marker) {
                map.setCenter(place.geometry.location);
                marker.setPosition(place.geometry.location);
                setRegisterData((prev) => ({
                  ...prev,
                  address: place.formatted_address || prev.address,
                }));
              }
            }}
          >
            <Form.Control type="text" placeholder="Buscar dirección..." />
          </Autocomplete>

          <div
            ref={mapRef}
            style={{
              height: "400px",
              width: "100%",
              backgroundColor: "#e0e0e0",
            }}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowMapModal(false)}>
            Confirmar Ubicación
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
