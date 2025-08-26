import React, { useState, useEffect, useRef } from "react";
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
// Asegúrate que Autocomplete esté importado
import { Autocomplete } from "@react-google-maps/api";
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
  // Mantenemos estos campos comentados para referencia futura
  // street: string;
  // streetNumber: string;
  // postalCode: string;
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

  // Estados para el Mapa y Autocomplete
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null); // Autocomplete del formulario principal
  // --- NUEVO ESTADO PARA AUTOCOMPLETE DEL MODAL ---
  const [modalAutocomplete, setModalAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null); // Autocomplete dentro del modal

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  // Efecto para inicializar el mapa cuando el modal se muestra
  useEffect(() => {
    if (showMapModal && mapRef.current && window.google) {
      // Crear el mapa
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: -32.8894, lng: -68.8458 }, // Coordenadas por defecto de Mendoza
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Crear el marcador
      const markerInstance = new window.google.maps.Marker({
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      setMap(mapInstance);
      setMarker(markerInstance);

      // Si hay una dirección existente, geocodificarla y centrar el mapa
      if (registerData.address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { address: registerData.address },
          (results, status) => {
            if (
              status === "OK" &&
              results &&
              results[0] &&
              results[0].geometry
            ) {
              const location = results[0].geometry.location;
              mapInstance.setCenter(location);
              markerInstance.setPosition(location);
            } else {
              // Si falla la geocodificación, usar geolocalización
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                    mapInstance.setCenter(pos);
                    markerInstance.setPosition(pos);
                  },
                  () => {
                    // Si falla la geolocalización, usar coordenadas por defecto
                    const defaultPos = { lat: -32.8894, lng: -68.8458 };
                    mapInstance.setCenter(defaultPos);
                    markerInstance.setPosition(defaultPos);
                  }
                );
              }
            }
          }
        );
      } else {
        // Si no hay dirección, intentar usar geolocalización
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              mapInstance.setCenter(pos);
              markerInstance.setPosition(pos);
            },
            () => {
              // Si falla la geolocalización, usar coordenadas por defecto
              const defaultPos = { lat: -32.8894, lng: -68.8458 };
              mapInstance.setCenter(defaultPos);
              markerInstance.setPosition(defaultPos);
            }
          );
        }
      }

      // Listener para actualizar la dirección cuando se arrastra el marcador
      markerInstance.addListener("dragend", () => {
        const position = markerInstance.getPosition();
        if (position) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              setRegisterData((prev) => ({
                ...prev,
                address: results[0].formatted_address,
              }));
            }
          });
        }
      });

      // Cleanup function
      return () => {
        if (marker) {
          marker.setMap(null);
        }
        setMap(null);
        setMarker(null);
      };
    }
  }, [showMapModal, registerData.address]); // Incluir 'map' aquí asegura que listeners se añadan si el mapa cambia

  // --- HANDLERS PARA AUTOCOMPLETE DEL FORMULARIO PRINCIPAL ---
  const onLoadAutocomplete = (
    autocompleteInstance: google.maps.places.Autocomplete
  ) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setRegisterData((prev) => ({
          ...prev,
          address: place.formatted_address,
        }));
      }
    }
  };

  // --- NUEVOS HANDLERS PARA AUTOCOMPLETE DEL MODAL ---
  const onLoadModalAutocomplete = (
    autocompleteInstance: google.maps.places.Autocomplete
  ) => {
    autocompleteInstance.setFields([
      "address_components",
      "geometry",
      "name",
      "formatted_address",
    ]);
    setModalAutocomplete(autocompleteInstance);
  };

  const onModalPlaceChanged = () => {
    if (!modalAutocomplete) return;

    try {
      const place = modalAutocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.warn("No se encontró geometría para el lugar seleccionado");
        return;
      }

      // Actualizar el mapa
      if (map && marker) {
        const location = place.geometry.location;

        // Centrar el mapa en la ubicación
        map.setCenter(location);
        map.setZoom(17);

        // Mover el marcador
        marker.setPosition(location);

        // Actualizar el campo de dirección
        if (place.formatted_address) {
          setRegisterData((prev) => ({
            ...prev,
            address: place.formatted_address,
          }));
        }
      }
    } catch (error) {
      console.error("Error al procesar el lugar seleccionado:", error);
    }
  };
  // --- MANEJADORES DE FORMULARIOS ---
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

    console.log("Datos del formulario antes de validar:", registerData);

    // Validación específica para la dirección
    if (!registerData.address || registerData.address.trim() === "") {
      console.error("Error: La dirección está vacía");
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
      // Obtener el valor de la dirección directamente del input
      const addressInput = document.getElementById(
        "address-input"
      ) as HTMLInputElement;
      const addressValue = addressInput
        ? addressInput.value
        : registerData.address;

      // Crear un objeto nuevo para enviar, no usar spreading para asegurar que todos los campos estén explícitos
      const dataToSend = {
        username: registerData.username,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        address: addressValue.trim(),
        phone: registerData.phone, // Usar el valor recuperado del input o del estado
        dni: registerData.dni,
        alias: registerData.alias,
      };

      console.log("Datos que se enviarán:", dataToSend);

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
        setRegisterError(""); // Limpiar error si ahora coinciden o si se edita la primera
      }
    }
  };

  // Función para cerrar el modal y actualizar la dirección desde el marcador
  const handleCloseMapModal = () => {
    // Asegurarse de que la dirección se actualice con la última posición del marcador
    if (marker) {
      const position = marker.getPosition();
      if (position) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setRegisterData((prev) => ({
              ...prev,
              address: results[0].formatted_address,
            }));
          }
        });
      }
    }
    setShowMapModal(false);
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
              {/* Campos de Registro ... (mejoras en validación de contraseña) */}
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
                  />{" "}
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
                      <InputGroup className="adress-group">
                        <Autocomplete
                          onLoad={(autocompleteInstance) => {
                            setAutocomplete(autocompleteInstance);
                          }}
                          onPlaceChanged={() => {
                            if (autocomplete) {
                              const place = autocomplete.getPlace();
                              if (place && place.formatted_address) {
                                setRegisterData((prevData) => ({
                                  ...prevData,
                                  address: place.formatted_address,
                                }));
                                if (
                                  map &&
                                  marker &&
                                  place.geometry &&
                                  place.geometry.location
                                ) {
                                  const location = place.geometry.location;
                                  map.panTo(location);
                                  map.setZoom(17);
                                  marker.setPosition(location);
                                }
                              }
                            }
                          }}
                        >
                          <Form.Control
                            type="text"
                            name="address"
                            id="address-input"
                            placeholder="Ingresa o busca tu dirección"
                            value={registerData.address}
                            onChange={handleRegisterChange}
                            required
                            disabled={isRegisterLoading}
                            aria-describedby="registerAddressFeedback"
                            className="input-form adress-input"
                          />
                        </Autocomplete>
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

              <div>
                {/* <div md={8}>
                      <Form.Group controlId="registerStreet">
                        <Form.Label>Calle</Form.Label>
                        <Form.Control
                          type="text"
                          name="street"
                          placeholder="Ingrese el nombre de la calle"
                          value={registerData.street}
                          onChange={handleRegisterChange}
                          disabled={isRegisterLoading}
                        />
                      </Form.Group>
                    </div> */}
                {/* <div md={4}>
                      <Form.Group
                      
                        controlId="registerStreetNumber"
                      >
                        <Form.Label>Número</Form.Label>
                        <Form.Control
                          type="text"
                          name="streetNumber"
                          placeholder="Número"
                          value={registerData.streetNumber}
                          onChange={handleRegisterChange}
                          disabled={isRegisterLoading}
                        />
                      </Form.Group>
                    </div> */}
              </div>

              {/* Campos para código postal y teléfono */}
              <div>
                {/* <div>
                      <Form.Group
                      
                        controlId="registerPostalCode"
                      >
                        <Form.Label>Código Postal</Form.Label>
                        <Form.Control
                          type="text"
                          name="postalCode"
                          placeholder="Ingrese el código postal"
                          value={registerData.postalCode}
                          onChange={handleRegisterChange}
                          disabled={isRegisterLoading}
                        />
                      </Form.Group>
                    </div> */}
                {/* <div>
                      <Form.Group controlId="registerPhone">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          placeholder="Ingrese su teléfono"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          disabled={isRegisterLoading}
                        />
                      </Form.Group>
                    </div> */}
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
              {/* Campos de Login ... (sin cambios) */}
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

      {/* === Modal para el mapa (CORREGIDO) === */}
      <Modal
        show={showMapModal}
        onHide={handleCloseMapModal} // Usar handler personalizado para asegurar actualización de dirección
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Selecciona tu ubicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* --- INPUT DE BÚSQUEDA DENTRO DEL MODAL --- */}
          <Autocomplete
            onLoad={onLoadModalAutocomplete}
            onPlaceChanged={onModalPlaceChanged}
            options={{
              componentRestrictions: { country: "ar" },
              fields: [
                "address_components",
                "geometry",
                "name",
                "formatted_address",
              ],
              types: ["address"],
            }}
          >
            <Form.Control
              type="text"
              placeholder="Buscar dirección en el mapa..."
              style={{ width: "100%" }}
            />
          </Autocomplete>
          <div
            ref={mapRef}
            style={{
              height: "400px",
              width: "100%",
              backgroundColor: "#e0e0e0",
            }}
          ></div>
        </Modal.Body>
        <Modal.Footer>
          {/* Botón para cerrar el modal (usará handleCloseMapModal) */}
          <Button variant="primary" onClick={handleCloseMapModal}>
            Confirmar Ubicación
          </Button>
        </Modal.Footer>
      </Modal>
    </div> // Cierre del Container principal
  ); // Cierre del return
}; // Cierre del componente Login

export default Login;
