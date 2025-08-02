import { useEffect, useState } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import emailjs from "@emailjs/browser";
import { RootState } from "../../types";
import "./ShippingDetail.css";
import Breadcrums from "../../Breadcrumbs/Breadcrums";
import Alert from "../../Alert/Alert";
import Spinner from "../../Spinner/Spinner";

const EMAIL_SERVICE_ID = "service_szd7tra";
const EMAIL_TEMPLATE_CLIENT_ID = "template_9afqj0i";
const EMAIL_TEMPLATE_ADMIN_ID = "template_qnvxrh8";
const EMAIL_PUBLIC_KEY = "ouk745ASI3P1s6qZj";
const ADMIN_EMAIL = "distrolacpedidos@gmail.com";

interface ShippingData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string; // Campo unificado de dirección
  phone: string;
  dni?: string; // Asegurarse de que dni esté presente
  alias?: string; // Asegurarse de que alias esté presente
  comments?: string;
}

interface CartItem {
  id: string;
  sku?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  priceListId?: string;
}

interface PriceList {
  _id: string;
  name: string;
  marginInPercentage: number;
  sellerComissionInPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export default function ShippingDetail() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "", // Campo unificado de dirección
    phone: "",
    comments: "",
    alias: "", // Asegurarse de que alias esté presente 
    dni: "", // Asegurarse de que dni esté presente
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertStatus, setAlertStatus] = useState<string>("");
  const [alertEvent, setAlertEvent] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  // Función para obtener directamente el perfil del usuario
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

      return await response.json();
    } catch (error) {
      console.error("Error al obtener perfil completo:", error);
      return null;
    }
  };
  // Cargar datos del localStorage y userInfo al iniciar
  useEffect(() => {
    const storedShippingData = localStorage.getItem("shippingData");
    const storedCartItems = localStorage.getItem("cart");
    const storedTotal = localStorage.getItem("total");

    if (storedShippingData) {
      const parsedData = JSON.parse(storedShippingData);
      console.log("Datos de envío almacenados:", parsedData);
      setShippingData(parsedData);
    } else if (userInfo) {
      console.log("UserInfo para shipping:", userInfo);

      // Intentar obtener datos de respaldo
      let savedAddress = "";
      let savedPhone = "";

      try {
        const savedData = localStorage.getItem("userProfileData");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          savedAddress = parsedData.address || "";
          savedPhone = parsedData.phone || "";
          console.log("Datos recuperados de perfil guardado:", parsedData);
        }
      } catch (err) {
        console.error("Error al recuperar datos guardados:", err);
      }

      setShippingData({
        username: userInfo.username || "",
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        address: userInfo.address || savedAddress || "", // Campo unificado
        phone: userInfo.phone || savedPhone || "",
        dni: userInfo.dni || "", // Asegurarse de que dni esté presente
        alias: userInfo.alias || "", // Asegurarse de que alias esté presente
        comments: "",
      });
    }

    if (storedCartItems) setCartItems(JSON.parse(storedCartItems));
    if (storedTotal) setTotal(parseFloat(storedTotal));
  }, [userInfo]);

  // Obtener el perfil directamente del backend si no tenemos address
  useEffect(() => {
    const getProfileData = async () => {
      // Solo intentamos obtener el perfil si:
      // 1. Hay un usuario logueado con token
      // 2. No tenemos dirección o la dirección está vacía
      if (
        userInfo?.token &&
        (!shippingData.address || shippingData.address.trim() === "")
      ) {
        setIsLoadingProfile(true);

        try {
          const profileData = await fetchUserProfile(userInfo.token);

          if (profileData) {
            console.log(
              "Perfil obtenido directamente del backend:",
              profileData
            );

            // Actualizar con los datos obtenidos
            setShippingData((prev) => ({
              ...prev,
              address: profileData.address || prev.address,
              phone: profileData.phone || prev.phone,
              alias: profileData.alias || prev.alias, // Asegurarse de que alias esté presente
              dni: profileData.dni || prev.dni, // Asegurarse de que
              // Mantener otros datos si es necesario
            }));

            // Guardar en localStorage para futuros accesos
            localStorage.setItem(
              "userProfileData",
              JSON.stringify({
                address: profileData.address || "",
                phone: profileData.phone || "",
              })
            );
          }
        } catch (error) {
          console.error("Error al obtener perfil del usuario:", error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    getProfileData();
  }, [userInfo, shippingData.address]);

  const formatOrderDetails = (items: CartItem[]) => {
    return items
      .map(
        (item) => `
      Producto: ${item.title}
      ${item.sku ? `SKU: ${item.sku}` : ""}
      Cantidad: ${item.quantity}
      Precio unitario: $${Number(item.price).toFixed(2)}
      Subtotal: $${(item.quantity * item.price).toFixed(2)}
      ------------------------
    `
      )
      .join("\n");
  };

  const getStoreVendor = async () => {
    try {
      // Asegúrate de que la URL base sea correcta
      const baseUrl = import.meta.env.VITE_BACK_APP_URI;
      const url = `${baseUrl}/users/store-vendor`;

      console.log("Calling URL:", url); // Para debugging

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al obtener el vendedor de tienda"
        );
      }

      const storeVendor = await response.json();
      return storeVendor._id;
    } catch (error) {
      console.error("Error obteniendo vendedor de tienda:", error);
      throw error;
    }
  };

  const getStorePriceList = async (): Promise<PriceList> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_APP_URI}/price-lists`,
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al obtener las listas de precios: ${response.status}`
        );
      }

      const priceLists = await response.json();
      const storePriceList = priceLists.find(
        (list: PriceList) => list.name === "Lista Tienda Online"
      );

      if (!storePriceList) {
        throw new Error("No se encontró la lista de precios de la tienda");
      }

      return storePriceList;
    } catch (error) {
      console.error("Error al obtener la lista de precios:", error);
      throw error;
    }
  };

  const validateCartItem = (item: CartItem) => {
    if (!item.title) console.error("Falta title en item:", item);
    if (!item.quantity) console.error("Falta quantity en item:", item);
    if (!item.price) console.error("Falta price en item:", item);
    if (!item.image) console.error("Falta image en item:", item);
    if (!item.id) console.error("Falta id en item:", item);

    return item.title && item.quantity && item.price && item.image && item.id;
  };
  const handleConfirmOrder = async () => {
    if (isSubmitting) return;

    try {
      setLoading(true);
      setIsSubmitting(true);

      if (!cartItems.every(validateCartItem)) {
        handleShowAlert(
          "Algunos productos no tienen todos los campos requeridos",
          "error"
        );
        throw new Error(
          "Algunos productos no tienen todos los campos requeridos"
        );
      }

      const priceList = await getStorePriceList();
      const storeVendorId = await getStoreVendor();

      // Extraer información de la dirección completa para compatibilidad
      // En caso de que el backend aún espere street y streetNumber
      let street = "";
      let streetNumber = "";

      if (shippingData.address) {
        // Intento básico de extraer calle y número
        const addressParts = shippingData.address.split(" ");
        if (addressParts.length >= 2) {
          // Asumimos que el último elemento es el número
          streetNumber = addressParts.pop() || "";
          // El resto es la calle
          street = addressParts.join(" ");
        } else {
          street = shippingData.address;
        }
      }

      const orderData = {
        storeOrder: {
          user: userInfo._id,
          customerInfo: {
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            email: shippingData.email,
            phone: shippingData.phone,
            address: shippingData.address, // Dirección completa
            street: street, // Para compatibilidad
            streetNumber: streetNumber, // Para compatibilidad
            fullName: `${shippingData.firstName} ${shippingData.lastName}`,
            dni: shippingData.dni || "", 
            alias: shippingData.alias || "",
          },
          orderItems: cartItems.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            systemProductId: item.id,
          })),
          subtotal: total,
          shippingCost: 0,
          total: total,
          status: "pendiente",
        },
        systemOrder: {
          orderType: "store",
          orderNumber: `ST-${Date.now()}`,
          storeClient: {
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            email: shippingData.email,
            phone: shippingData.phone,
            fullName: `${shippingData.firstName} ${shippingData.lastName}`,
            dni: shippingData.dni || "",
            alias: shippingData.alias || "",
            isStoreClient: true,
          },
          seller: storeVendorId,
          products: cartItems.map((item) => ({
            product: item.id,
            quantity: item.quantity,
            price: item.price,
            selectedPriceList: priceList._id,
            totalPrice: item.price * item.quantity,
          })),
          totalAmount: total,
          orderStatus: "pending",
          orderDate: new Date().toISOString(),
          delivery: {
            status: "NO ENTREGADO",
            address: shippingData.address, // Añadir dirección completa aquí
          },
          notes: shippingData.comments || "",
        },
      };

      console.log("Enviando datos de orden:", orderData);

      const response = await fetch(
        `${import.meta.env.VITE_BACK_APP_URI}/store/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo?.token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);

        // Manejar errores específicos
        if (errorData.duplicateFields) {
          handleShowAlert("Ya existe un registro similar", "error");
          throw new Error(
            `Ya existe un registro similar: ${errorData.duplicateFields.join(
              ", "
            )}`
          );
        }
        handleShowAlert("Error al crear la orden", "error");
        throw new Error(
          `Error al crear la orden: ${errorData.message || response.statusText}`
        );
      }

      const savedOrder = await response.json();
      console.log("Orden creada exitosamente:", savedOrder);

      const commonTemplateParams = {
        to_name: `${shippingData.firstName} ${shippingData.lastName}`,
        customer_phone: shippingData.phone,
        customer_address: shippingData.address, // Usar dirección completa
        order_details: formatOrderDetails(cartItems),
        order_subtotal: `$${total.toFixed(2)}`,
        order_shipping: "Gratis",
        order_total: `$${total.toFixed(2)}`,
        order_date: new Date().toLocaleDateString(),
        comments: shippingData.comments || "Sin comentarios",
      };

      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_CLIENT_ID,
        {
          ...commonTemplateParams,
          to_email: shippingData.email,
        },
        EMAIL_PUBLIC_KEY
      );

      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ADMIN_ID,
        {
          ...commonTemplateParams,
          to_email: ADMIN_EMAIL,
          customer_email: shippingData.email,
        },
        EMAIL_PUBLIC_KEY
      );

      localStorage.removeItem("cart");
      localStorage.removeItem("total");
      localStorage.removeItem("shippingData");

      setCartItems([]);
      setTotal(0);
      setShowConfirmation(true);

      setTimeout(() => {
        navigate("/mispedidos", { replace: true });
      }, 3000);
    } catch (error) {
      console.error("Error detallado:", error);
      handleShowAlert(
        "Error al procesar el pedido. Por favor, inténtalo de nuevo más tarde.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleShowAlert = (message: string, status: string) => {
    setAlertMessage(message);
    setAlertStatus(status);
    setShowAlert(true);
    setAlertEvent((prev) => !prev);
  };

  return (
    <div className="shipping-full-container">
      {loading && <Spinner />}
      <Alert
        message={alertMessage}
        status={alertStatus}
        onClose={() => setShowAlert(false)}
        show={showAlert}
        event={() => setAlertEvent(!alertEvent)}
      />
      <div className="shipping-container-1">
        <div className="breadcrum-container">
          <Breadcrums
            items={[
              { label: "Mi carrito", to: "/carrito" },
              { label: "Detalles del pedido", to: "/detalledepedido" },
              { label: "Confirmar pedido" },
            ]}
          />
        </div>
        <div className="red-underline">
          <h1>CONFIRMAR PEDIDO</h1>
        </div>
        <div className="shipping-container">
          <div className="shipping-leftcolumn">
            <div className="shipping-info">
              <div className="shipping-info-row">
                <span>Email</span>
                <span>{shippingData.email || "No especificado"}</span>
                <button onClick={() => navigate("/detalledepedido")}>
                  Editar
                </button>
              </div>
              <div className="shipping-info-row">
                <span>Teléfono</span>
                <span>{shippingData.phone || "No especificado"}</span>
                <button onClick={() => navigate("/detalledepedido")}>
                  Editar
                </button>
              </div>
              <div className="shipping-info-row">
                <span>Nombre completo</span>
                <span>
                  {shippingData.firstName && shippingData.lastName
                    ? `${shippingData.firstName} ${shippingData.lastName}`
                    : "No especificado"}
                </span>
                <button onClick={() => navigate("/detalledepedido")}>
                  Editar
                </button>
              </div>
              <div className="shipping-info-row">
                <span>Dirección</span>
                <span>
                  {shippingData.address
                    ? shippingData.address
                    : "No especificado"}
                </span>
                <button onClick={() => navigate("/detalledepedido")}>
                  Editar
                </button>
              </div>
            </div>

            <fieldset className="shipping-method">
              <legend>Método de envío</legend>
              <hr className="red-line-login" />
              <div className="shipping-method-option">
                <div className="adress-inputs">
                  <input type="radio" name="shipping-method" defaultChecked />
                  <label>Entrega a domicilio</label>
                </div>
                <span>Gratis</span>
              </div>
            </fieldset>

            <div className="shipping-buttons">
              <a
                className="shipping-back"
                onClick={() => navigate("/detalledepedido")}
              >
                Volver a detalles
              </a>
              <button
                className="shipping-confirm"
                onClick={handleConfirmOrder}
                disabled={isSubmitting || showConfirmation || isLoadingProfile}
              >
                {isSubmitting
                  ? "Procesando..."
                  : isLoadingProfile
                  ? "Cargando datos..."
                  : showConfirmation
                  ? "Procesado"
                  : "Confirmar pedido"}
              </button>
            </div>
          </div>

          <div className="shipping-rightcolumn">
            <ul className="shipping-cartitems">
              {cartItems.map((item) => (
                <li key={item.id} className="shipping-cartitem">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h3 className="title-item-detail">{item.title}</h3>
                    <p>${Number(item.price).toFixed(2)}</p>
                  </div>
                  <span>x{item.quantity}</span>
                </li>
              ))}
            </ul>
            <hr className="red-line-login" />
            <div className="shipping-summary">
              <div className="shipping-totals">
                <div>
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div>
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="shipping-total-row">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {showConfirmation && (
            <div className="confirmation-popup">
              <div className="confirmation-content">
                <h3>¡Pedido Confirmado!</h3>
                <p>
                  Tu pedido ha sido procesado. Recibirás un email con los
                  detalles.
                </p>
                <p>Serás redirigido al inicio en unos segundos...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
