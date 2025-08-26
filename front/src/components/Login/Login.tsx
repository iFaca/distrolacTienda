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
} from "react-bootstrap";
// Asegúrate que Autocomplete esté importado
import { Autocomplete } from "@react-google-maps/api";
import { useLoginMutation, useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import "./Login.css";
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
      // ⚠️ Ya no leemos el DOM por id; usamos el estado para evitar warnings/controlId
      const dataToSend = {
        username: registerData.username,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        address: registerData.address.trim(),
        phone: registerData.phone, // valor del estado
      };

      console.log("Datos que se enviarán:", JSON.stringify(dataToSend));

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
    <Container className="login-page">
      <Row className="justify-content-md-center align-items-center min-vh-100">
        <Col xs={12} md={8} lg={6} xl={5}>
          <div className="login-container p-4 p-md-5 border rounded bg-white shadow-sm">
            <div className="login-logo text-center mb-4">
              <img
                src={Logo}
                alt="Distrolac Logo"
                style={{ maxWidth: "150px", height: "auto" }}
              />
            </div>

            <Tabs
              defaultActiveKey="login"
              id="login-register-tabs"
              className="mb-4"
              justify
            >
              {/* === Tab de Login === */}
              <Tab eventKey="login" title="Iniciar Sesión">
                {error && (
                  <Alert variant="danger" className="mt-3">
                    {error}
                  </Alert>
                )}
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={handleLogin}
                  className="login-form mt-3"
                >
                  {/* Campos de Login ... (sin cambios) */}
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingrese su email"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      required
                      disabled={isLoginLoading}
                      aria-describedby="loginEmailFeedback"
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      id="loginEmailFeedback"
                    >
                      Ingrese un email válido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoginLoading}
                      aria-describedby="loginPasswordFeedback"
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      id="loginPasswordFeedback"
                    >
                      Ingrese su contraseña.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="loginShowPassword">
                    <Form.Check
                      type="checkbox"
                      label="Mostrar contraseña"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      disabled={isLoginLoading}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isLoginLoading}
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
                </Form>
              </Tab>

              {/* === Tab de Registro === */}
              <Tab eventKey="register" title="Crear Cuenta">
                {registerError && (
                  <Alert variant="danger" className="mt-3">
                    {registerError}
                  </Alert>
                )}
                <Form
                  noValidate
                  validated={registerValidated}
                  onSubmit={handleRegister}
                  className="register-form mt-3"
                >
                  {/* Campos de Registro ... (mejoras en validación de contraseña) */}
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="registerUsername">
                        <Form.Label>Nombre de Usuario</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          placeholder="Elija un nombre de usuario"
                          value={registerData.username}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                          aria-describedby="registerUsernameFeedback"
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          id="registerUsernameFeedback"
                        >
                          Elija un nombre de usuario.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group
                        className="mb-3"
                        controlId="registerFirstName"
                      >
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          placeholder="Ingrese su nombre"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                          aria-describedby="registerFirstNameFeedback"
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          id="registerFirstNameFeedback"
                        >
                          Ingrese su nombre.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerLastName">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          placeholder="Ingrese su apellido"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                          aria-describedby="registerLastNameFeedback"
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          id="registerLastNameFeedback"
                        >
                          Ingrese su apellido.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="registerEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Ingrese su email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                          aria-describedby="registerEmailFeedback"
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          id="registerEmailFeedback"
                        >
                          Ingrese un email válido.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="registerPhone">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          placeholder="Ingrese su teléfono"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="registerAddress">
                        <Form.Label>Dirección</Form.Label>
                        <div className="input-group">
                          <Autocomplete
                            onLoad={(autocompleteInstance) => {
                              console.log("Autocomplete cargado correctamente");
                              setAutocomplete(autocompleteInstance);
                            }}
                            onPlaceChanged={() => {
                              if (autocomplete) {
                                const place = autocomplete.getPlace();
                                if (place && place.formatted_address) {
                                  console.log(
                                    "Dirección seleccionada (autocomplete):",
                                    place.formatted_address
                                  );

                                  // Actualizar el estado de manera explícita con un callback
                                  setRegisterData((prevData) => {
                                    const newData = {
                                      ...prevData,
                                      address: place.formatted_address,
                                    };
                                    console.log(
                                      "Estado actualizado con dirección:",
                                      newData
                                    );
                                    return newData;
                                  });

                                  // Si el mapa está abierto, actualizar también su posición
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
                              placeholder="Ingresa o busca tu dirección"
                              value={registerData.address}
                              onChange={(e) => {
                                const addressValue = e.target.value;
                                handleRegisterChange(e);
                                console.log(
                                  "Dirección actualizada manualmente:",
                                  addressValue
                                );
                              }}
                              required
                              disabled={isRegisterLoading}
                              aria-describedby="registerAddressFeedback"
                              style={{ marginRight: "8px" }}
                            />
                          </Autocomplete>
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowMapModal(true)}
                            disabled={isRegisterLoading}
                            title="Abrir mapa para seleccionar ubicación"
                          >
                            Mapa
                          </Button>
                        </div>
                        <Form.Control.Feedback
                          type="invalid"
                          id="registerAddressFeedback"
                        >
                          Por favor ingresa tu dirección.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerPassword">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                          type={showRegisterPassword ? "text" : "password"}
                          name="password"
                          placeholder="Elija una contraseña"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                          aria-describedby="registerPasswordFeedback"
                          minLength={6}
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          id="registerPasswordFeedback"
                        >
                          Elija una contraseña (mínimo 6 caracteres).
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group
                        className="mb-3"
                        controlId="registerConfirmPassword"
                      >
                        <Form.Label>Confirmar Contraseña</Form.Label>
                        <Form.Control
                          type={showRegisterPassword ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Confirme su contraseña"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          required
                          disabled={isRegisterLoading}
                          aria-describedby="registerConfirmPasswordFeedback"
                          pattern={registerData.password.replace(
                            /[.*+?^${}()|[\]\\]/g,
                            "\\$&"
                          )}
                        />{" "}
                        {/* Escapar caracteres especiales para pattern */}
                        <Form.Control.Feedback
                          type="invalid"
                          id="registerConfirmPasswordFeedback"
                        >
                          Las contraseñas no coinciden.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-4" controlId="registerShowPassword">
                    <Form.Check
                      type="checkbox"
                      label="Mostrar contraseña"
                      checked={showRegisterPassword}
                      onChange={(e) =>
                        setShowRegisterPassword(e.target.checked)
                      }
                      disabled={isRegisterLoading}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isRegisterLoading}
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
                </Form>
              </Tab>
            </Tabs>
          </div>
        </Col>
      </Row>

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
              className="mb-3"
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
    </Container> // Cierre del Container principal
  ); // Cierre del return
}; // Cierre del componente Login

export default Login;
