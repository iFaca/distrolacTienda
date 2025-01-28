import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types";
import {
  useUpdateUserInfoMutation,
  useChangePasswordMutation,
} from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { BASE_URL } from "../../constants";

export default function Profile() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: userInfo?.username || "",
    email: userInfo?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [updateUserInfo, { isLoading: isUpdating }] =
    useUpdateUserInfoMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  useEffect(() => {
    if (userInfo) {
      setFormData({
        username: userInfo.username,
        email: userInfo.email,
      });
    }
  }, [userInfo]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: userInfo?.username || "",
      email: userInfo?.email || "",
    });
    setError("");
    setSuccess("");
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = userInfo?.token;
    if (!token) {
      setError("No se encontró el token de autenticación.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el perfil.");
      }

      setSuccess("Perfil actualizado con éxito.");
      dispatch(setCredentials({ ...userInfo, ...formData }));
    } catch (err) {
      setError(err.message || "Hubo un problema al procesar tu solicitud.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmNewPassword
    ) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    try {
      const response = await changePassword(passwordData).unwrap();

      if (response && response.message) {
        setSuccess("Contraseña cambiada con éxito.");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch (err: any) {
      setError(err?.data?.message || "Error al cambiar la contraseña.");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <h2 className="mb-4">Mi Perfil</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleProfileSubmit} className="mb-4">
            <Form.Group controlId="username" className="mb-3">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleProfileChange}
                disabled={!isEditing}
                required
              />
            </Form.Group>

            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                disabled={!isEditing}
                required
              />
            </Form.Group>

            <div className="d-grid gap-2">
              {!isEditing ? (
                <Button variant="primary" onClick={handleEditClick}>
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isUpdating || !validateEmail(formData.email)}
                  >
                    {isUpdating ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </Form>

          <h3 className="mb-4">Cambiar Contraseña</h3>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group controlId="currentPassword" className="mb-3">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
              />
            </Form.Group>

            <Form.Group controlId="newPassword" className="mb-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
              />
            </Form.Group>

            <Form.Group controlId="confirmNewPassword" className="mb-3">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmNewPassword: e.target.value,
                  }))
                }
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Cambiando Contraseña...
                </>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
