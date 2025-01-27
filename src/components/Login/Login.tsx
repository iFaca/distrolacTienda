import React, { useState } from "react";
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
} from "react-bootstrap";
import { useLoginMutation, useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import "./Login.css";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] =
    useState<boolean>(false);
  const [registerValidated, setRegisterValidated] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>("");

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  // Manejador del formulario de login
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const loginData: LoginFormData = {
        email: usernameOrEmail, // Ahora enviamos el campo como email
        password,
      };

      console.log("Sesion iniciada por:", loginData); // Para debug

      const res = await login(loginData).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err: any) {
      console.error("Error de login:", err);
      setError(err?.data?.message || "Ha ocurrido un error al iniciar sesión.");
    }
  };

  // Manejador del formulario de registro
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError("");

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setRegisterValidated(true);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err: any) {
      setRegisterError(
        err?.data?.message || "Ha ocurrido un error al crear la cuenta."
      );
    }
  };

  // Manejador de cambios en el formulario de registro
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container className="login-page">
      <Row className="justify-content-md-center align-items-center min-vh-100">
        <Col xs={12} md={6} lg={4}>
          <div className="login-container p-4 border rounded bg-white shadow">
            <Tabs defaultActiveKey="login" className="mb-4" justify>
              {/* Tab de Login */}
              <Tab eventKey="login" title="Iniciar Sesión">
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form
                  noValidate
                  validated={validated}
                  onSubmit={handleLogin}
                  className="login-form"
                >
                  <Form.Group className="mb-3">
                    <Form.Label>Usuario o Email</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingrese su usuario o email"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      required
                      disabled={isLoginLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoginLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
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
                        <Spinner size="sm" className="me-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </Form>
              </Tab>

              {/* Tab de Registro */}
              <Tab eventKey="register" title="Crear Cuenta">
                {registerError && (
                  <Alert variant="danger" className="mb-4">
                    {registerError}
                  </Alert>
                )}

                <Form
                  noValidate
                  validated={registerValidated}
                  onSubmit={handleRegister}
                  className="register-form"
                >
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre de Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Elija un nombre de usuario"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      required
                      disabled={isRegisterLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Elija un nombre de usuario
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Ingrese su email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                      disabled={isRegisterLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Ingrese un email válido
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      placeholder="Elija una contraseña"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      disabled={isRegisterLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Elija una contraseña
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar Contraseña</Form.Label>
                    <Form.Control
                      type={showRegisterPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirme su contraseña"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      disabled={isRegisterLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Confirme su contraseña
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
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
                        <Spinner size="sm" className="me-2" />
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
    </Container>
  );
};

export default Login;
