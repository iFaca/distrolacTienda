import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button, Alert, Modal, InputGroup } from "react-bootstrap";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useLoginMutation, useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import "./Login.css";
import BackIcon from "@mui/icons-material/ArrowBack";
import Logo from "../../assets/logotienda.png";

/* =====================================================
   🔽 VALIDACIONES NUEVAS (NO EXISTÍAN ANTES)
===================================================== */
const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{4,20}$/;
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
const phoneRegex = /^\d{8,15}$/;
const dniRegex = /^\d{8}$/;
/* =====================================================
   🔼 FIN VALIDACIONES NUEVAS
===================================================== */

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  username: string;
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
  // ================= LOGIN =================
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");

  // ================= REGISTER =================
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: "",
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
    libraries: ["places"],
  });

  // ================= REDUX =================
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

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
      navigate("/");
    } catch (err: any) {
      setError(err?.data?.message || "Error al iniciar sesión.");
    }
  };

  // ================= REGISTER HANDLER =================
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterValidated(true);

    /* =====================================================
   🔽 VALIDACIONES NUEVAS EN SUBMIT
===================================================== */

    // USERNAME
    if (!registerData.username.trim()) {
      setRegisterError("El nombre de usuario es obligatorio.");
      return;
    }

    if (!usernameRegex.test(registerData.username)) {
      setRegisterError(
        "El nombre de usuario debe tener entre 4 y 20 caracteres y al menos una letra.",
      );
      return;
    }

    // NOMBRE
    if (!registerData.firstName.trim()) {
      setRegisterError("El nombre es obligatorio.");
      return;
    }

    if (!nameRegex.test(registerData.firstName)) {
      setRegisterError("El nombre solo puede contener letras.");
      return;
    }

    // APELLIDO
    if (!registerData.lastName.trim()) {
      setRegisterError("El apellido es obligatorio.");
      return;
    }

    if (!nameRegex.test(registerData.lastName)) {
      setRegisterError("El apellido solo puede contener letras.");
      return;
    }

    // DNI
    if (!registerData.dni.trim()) {
      setRegisterError("El DNI es obligatorio.");
      return;
    }

    if (!dniRegex.test(registerData.dni)) {
      setRegisterError("El DNI debe tener exactamente 8 dígitos.");
      return;
    }

    // TELÉFONO
    if (!registerData.phone.trim()) {
      setRegisterError("El teléfono es obligatorio.");
      return;
    }

    if (!phoneRegex.test(registerData.phone)) {
      setRegisterError("Ingrese un teléfono válido.");
      return;
    }

    // DIRECCIÓN
    if (!registerData.address) {
      setRegisterError("La dirección es requerida.");
      return;
    }

    // CONTRASEÑAS
    if (!registerData.password || !registerData.confirmPassword) {
      setRegisterError("Debe completar ambas contraseñas.");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }

    /* =====================================================
   🔼 FIN VALIDACIONES NUEVAS
===================================================== */

    try {
      const res = await register(registerData).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err: any) {
      setRegisterError(err?.data?.message || "Error al crear la cuenta.");
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "dni" ? { alias: `${value}.distrolac` } : {}),
    }));
  };
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
                    pattern="^(?=.*[a-zA-Z])[a-zA-Z0-9]{4,20}$"
                    disabled={isRegisterLoading}
                    aria-describedby="registerUsernameFeedback"
                    className="input-form"
                  />
                  <Form.Control.Feedback type="invalid">
                    Debe tener entre 4 y 20 caracteres y al menos una letra.
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
                    minLength={8}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$"
                    className="input-form"
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerPasswordFeedback"
                  >
                    La contraseña debe tener mínimo 8 caracteres, incluir una
                    mayúscula, una minúscula, un número y un símbolo.
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div>
                <Form.Group controlId="registerConfirmPassword">
                  <Form.Control
                    type={showRegisterPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    disabled={isRegisterLoading}
                    isInvalid={
                      registerValidated &&
                      registerData.password !== registerData.confirmPassword
                    }
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
                    <Form.Control
                      type="text"
                      name="phone"
                      placeholder="Ingrese su teléfono"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      required
                      pattern="^\d{8,15}$"
                      disabled={isRegisterLoading}
                      className="input-form"
                    />
                  </Form.Group>
                </div>
                <div>
                  <Form.Group controlId="registerAddress">
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
                                  address: place.formatted_address,
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
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  disabled={isLoginLoading}
                  className="input-form"
                />
              </Form.Group>

              <Form.Group controlId="loginPassword">
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
