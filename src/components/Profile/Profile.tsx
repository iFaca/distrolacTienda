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

// Función auxiliar para obtener el perfil completo
const fetchUserProfile = async (token: string) => {
  try {
    const response = await fetch("/api/store/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener el perfil");
    }

    const data = await response.json();
    console.log("Datos completos del perfil recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener perfil completo:", error);
    return null;
  }
};

export default function Profile() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
  });

  // Estado para el formulario de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Estados para mensajes y carga
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Mutations
  const [updateUserInfo, { isLoading }] = useUpdateUserInfoMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  // Función para cargar el perfil completo
  const loadFullProfile = async () => {
    if (!userInfo || !userInfo.token) return;

    setIsLoadingProfile(true);

    try {
      // 1. Intentar obtener del backend
      const profileData = await fetchUserProfile(userInfo.token);

      if (profileData) {
        // Actualizar el estado del formulario con los datos completos
        const updatedFormData = {
          username: profileData.username || userInfo.username || "",
          firstName: profileData.firstName || userInfo.firstName || "",
          lastName: profileData.lastName || userInfo.lastName || "",
          email: profileData.email || userInfo.email || "",
          address: profileData.address || userInfo.address || "",
          phone: profileData.phone || userInfo.phone || "",
        };

        setFormData(updatedFormData);

        // Actualizar Redux con los datos completos
        dispatch(
          setCredentials({
            ...userInfo,
            ...profileData,
            address: profileData.address || userInfo.address,
          })
        );

        // Actualizar localStorage para respaldo
        localStorage.setItem(
          "userProfileData",
          JSON.stringify({
            phone: updatedFormData.phone,
            address: updatedFormData.address,
          })
        );

        return;
      }
    } catch (error) {
      console.error("Error al cargar perfil completo:", error);
    } finally {
      setIsLoadingProfile(false);
    }

    // 2. Si falla la API, usar datos de localStorage como respaldo
    try {
      const savedProfile = localStorage.getItem("userProfileData");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        console.log("Usando datos de respaldo:", parsedProfile);

        setFormData((prev) => ({
          ...prev,
          address: parsedProfile.address || prev.address,
          phone: parsedProfile.phone || prev.phone,
        }));
      }
    } catch (err) {
      console.error("Error al cargar datos de respaldo:", err);
    }
  };

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    if (userInfo) {
      console.log("UserInfo en Profile:", userInfo);

      // Configurar datos iniciales desde Redux
      const initialFormData = {
        username: userInfo.username || "",
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        address: userInfo.address || "",
        phone: userInfo.phone || "",
      };

      setFormData(initialFormData);

      // Verificar si necesitamos cargar datos adicionales
      const needsAdditionalData = !userInfo.address || !userInfo.phone;
      if (needsAdditionalData) {
        loadFullProfile();
      }
    }
  }, [userInfo]);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Guardar campos críticos en localStorage
    if (name === "phone" || name === "address") {
      try {
        const savedData = localStorage.getItem("userProfileData") || "{}";
        const parsedData = JSON.parse(savedData);

        localStorage.setItem(
          "userProfileData",
          JSON.stringify({
            ...parsedData,
            [name]: value,
          })
        );
      } catch (err) {
        console.error("Error al guardar datos:", err);
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      console.log("Enviando actualización de perfil:", formData);

      // Actualizar en localStorage antes del envío
      localStorage.setItem(
        "userProfileData",
        JSON.stringify({
          phone: formData.phone,
          address: formData.address,
        })
      );

      // Enviar al backend
      const result = await updateUserInfo(formData).unwrap();

      // Actualizar Redux con la respuesta
      dispatch(
        setCredentials({
          ...userInfo,
          ...result,
          address: result.address || formData.address,
          phone: result.phone || formData.phone,
        })
      );

      setSuccess("Perfil actualizado con éxito");

      // Volver a cargar el perfil completo para sincronizar
      setTimeout(() => loadFullProfile(), 1000);
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      setError(err?.data?.message || "Error al actualizar el perfil");
    }
  };

  // Manejar cambio de contraseña
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      await changePassword(passwordData).unwrap();
      setSuccess("Contraseña actualizada con éxito");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err: any) {
      setError(err?.data?.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <h2>Mi Perfil</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          {isLoadingProfile && (
            <Alert variant="info">
              <Spinner animation="border" size="sm" className="me-2" />
              Cargando datos de perfil...
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ingresa tu dirección completa"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ingresa tu número de teléfono"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </Form>

          <h3 className="mt-4">Cambiar Contraseña</h3>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
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
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
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
