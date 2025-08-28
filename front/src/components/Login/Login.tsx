import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
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
  dni: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: -32.8894,
  lng: -68.8458,
};

const Login: React.FC = () => {
  // Estados Login
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Estados Registro
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
  });
  const [showRegisterPassword, setShowRegisterPassword] =
    useState<boolean>(false);
  const [registerValidated, setRegisterValidated] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>("");

  // Mapa y Autocomplete
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const modalAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(
    null
  );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Redux y navegación
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/home");
    }
  }, [userInfo]);

  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError("");
    const form = e.currentTarget;

    if (!registerData.address || registerData.address.trim() === "") {
      setRegisterError("La dirección es requerida");
      return;
    }
    if (!registerData.dni || !/^\d{8}$/.test(registerData.dni)) {
      setRegisterError("El DNI debe tener 8 dígitos numéricos");
      return;
    }
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setRegisterValidated(true);
      return;
    }
    setRegisterValidated(true);

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }

    try {
      const dataToSend = {
        username: registerData.username,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        dni: registerData.dni,
        email: registerData.email,
        password: registerData.password,
        address: registerData.address.trim(),
        phone: registerData.phone,
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
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place?.formatted_address) {
        setRegisterData((prev) => ({
          ...prev,
          address: place.formatted_address!,
        }));
        if (place.geometry?.location) {
          setMarkerPos({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      }
    }
  };

  const handleModalPlaceChanged = () => {
    if (modalAutocompleteRef.current) {
      const place = modalAutocompleteRef.current.getPlace();
      if (place?.geometry?.location) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarkerPos(pos);
        setRegisterData((prev) => ({
          ...prev,
          address: place.formatted_address || prev.address,
        }));
      }
    }
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

            <Tabs defaultActiveKey="login" className="mb-4" justify>
              {/* === LOGIN === */}
              <Tab eventKey="login" title="Iniciar Sesión">
                {error && <Alert variant="danger">{error}</Alert>}
                <Form noValidate validated={validated} onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email o Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Mostrar contraseña"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <Button type="submit" className="w-100" disabled={isLoginLoading}>
                    {isLoginLoading ? (
                      <Spinner as="span" animation="border" size="sm" />
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </Form>
              </Tab>

              {/* === REGISTRO === */}
              <Tab eventKey="register" title="Crear Cuenta">
                {registerError && <Alert variant="danger">{registerError}</Alert>}
                <Form noValidate validated={registerValidated} onSubmit={handleRegister}>
                  <Form.Group className="mb-3" controlId="registerUsername">
                    <Form.Label>Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerFirstName">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerLastName">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3" controlId="registerDni">
                    <Form.Label>DNI</Form.Label>
                    <Form.Control
                      type="text"
                      name="dni"
                      value={registerData.dni}
                      onChange={handleRegisterChange}
                      required
                      pattern="^[0-9]{8}$"
                    />
                    <Form.Control.Feedback type="invalid">
                      El DNI debe tener 8 dígitos numéricos.
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerPhone">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerAddress">
                    <Form.Label>Dirección</Form.Label>
                    <div className="input-group">
                      {isLoaded && (
                        <Autocomplete
                          onLoad={(ac) => {
                            autocompleteRef.current = ac;
                          }}
                          onPlaceChanged={handlePlaceChanged}
                        >
                          <Form.Control
                            type="text"
                            name="address"
                            value={registerData.address}
                            onChange={handleRegisterChange}
                            placeholder="Ingrese o busque su dirección"
                            required
                          />
                        </Autocomplete>
                      )}
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowMapModal(true)}
                      >
                        Mapa
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      Por favor ingresa tu dirección.
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerPassword">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                          type={showRegisterPassword ? "text" : "password"}
                          name="password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          required
                          minLength={6}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerConfirmPassword">
                        <Form.Label>Confirmar Contraseña</Form.Label>
                        <Form.Control
                          type={showRegisterPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Check
                    type="checkbox"
                    label="Mostrar contraseñas"
                    checked={showRegisterPassword}
                    onChange={(e) => setShowRegisterPassword(e.target.checked)}
                  />
                  <Button type="submit" className="w-100" disabled={isRegisterLoading}>
                    {isRegisterLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </Form>
              </Tab>
            </Tabs>
          </div>
        </Col>
      </Row>

      {/* Modal Mapa */}
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
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markerPos || defaultCenter}
              zoom={15}
              onClick={(e) => {
                if (e.latLng) {
                  const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                  setMarkerPos(pos);
                  if (window.google) {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: pos }, (results, status) => {
                      if (status === "OK" && results && results[0]) {
                        setRegisterData((prev) => ({
                          ...prev,
                          address: results[0].formatted_address,
                        }));
                      }
                    });
                  }
                }
              }}
            >
              {markerPos && (
                <Marker
                  position={markerPos}
                  draggable
                  onDragEnd={(e) => {
                    if (e.latLng && window.google) {
                      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                      setMarkerPos(pos);
                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode({ location: pos }, (results, status) => {
                        if (status === "OK" && results && results[0]) {
                          setRegisterData((prev) => ({
                            ...prev,
                            address: results[0].formatted_address,
                          }));
                        }
                      });
                    }
                  }}
                />
              )}
            </GoogleMap>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowMapModal(false)}>
            Confirmar Ubicación
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Login;
