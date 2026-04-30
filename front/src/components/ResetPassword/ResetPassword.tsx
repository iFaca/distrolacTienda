import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { useResetPasswordMutation } from "../slices/usersApiSlice";
import "./ResetPassword.css";
import Logo from "../../assets/logotienda.png";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      setError("Token no válido");
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await resetPassword({ token, password: formData.password }).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err?.data?.message || "Error al restablecer la contraseña");
    }
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-success">
            <img src={Logo} alt="Distrolac Logo" className="reset-logo" />
            <Alert variant="success">
              <Alert.Heading>¡Contraseña actualizada!</Alert.Heading>
              <p>Tu contraseña ha sido restablecida correctamente.</p>
              <p>Serás redirigido al inicio de sesión...</p>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <img src={Logo} alt="Distrolac Logo" className="reset-logo" />

        <h1 className="title-auth">Restablecer Contraseña</h1>
        <hr className="red-line-login" />

        {error && <Alert variant="danger">{error}</Alert>}

        <Form
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
          className="reset-form"
        >
          <Form.Group controlId="resetPassword">
            <Form.Label className="auth-label">Nueva Contraseña</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Nueva contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={isLoading}
              className="input-form"
            />
            <Form.Control.Feedback type="invalid">
              La contraseña debe tener al menos 6 caracteres.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="resetConfirmPassword">
            <Form.Label className="auth-label">Confirmar Contraseña</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              isInvalid={
                validated && formData.password !== formData.confirmPassword
              }
              className="input-form"
            />
            <Form.Control.Feedback type="invalid">
              Las contraseñas no coinciden.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="resetShowPassword">
            <Form.Check
              type="checkbox"
              label="Mostrar contraseña"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              disabled={isLoading}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="auth-btn"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Restableciendo...
              </>
            ) : (
              "Restablecer Contraseña"
            )}
          </Button>

          <div className="back-to-login">
            <a onClick={() => navigate("/login")}>Volver al inicio de sesión</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
