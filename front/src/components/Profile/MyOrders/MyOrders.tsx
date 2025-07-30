// src/components/MyOrders/MyOrders.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table, Button, Container, Modal } from "react-bootstrap";
import { RootState } from "../../types";
import "./MyOrders.css";
import Breadcrums from "../../Breadcrumbs/Breadcrums";
import Spinner from "../../Spinner/Spinner";

const BASE_URL = import.meta.env.VITE_BACK_APP_URI;

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    comments?: string;
  };
  orderItems: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  orderDate: string;
  createdAt: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { userInfo } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/store/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar los pedidos");
        }

        const data = await response.json();
        console.log("data ordenes", data);
        setOrders(data);
      } catch (error) {
        setError("Error al cargar tus pedidos");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      fetchOrders();
    }
  }, [userInfo]);

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        className="order-detail-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalle del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="order-detail-section">
            <h5>Información del Cliente</h5>
            <p>
              <strong>Nombre:</strong> {selectedOrder.customerInfo.firstName}{" "}
              {selectedOrder.customerInfo.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedOrder.customerInfo.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {selectedOrder.customerInfo.phone}
            </p>
            <p>
              <strong>Dirección:</strong> {selectedOrder.customerInfo.address}
            </p>
            {selectedOrder.customerInfo.comments && (
              <p>
                <strong>Comentarios:</strong>{" "}
                {selectedOrder.customerInfo.comments}
              </p>
            )}
          </div>

          <div className="order-detail-section mt-4">
            <h5>Productos</h5>
            <Table responsive className="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.orderItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-info">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="product-image"
                        />
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="order-detail-section mt-4">
            <h5>Resumen del Pedido</h5>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Envío:</span>
                <span>
                  {selectedOrder.shippingCost === 0
                    ? "Gratis"
                    : `$${selectedOrder.shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="order-detail-section mt-4">
            <p>
              <strong>Fecha del pedido:</strong>{" "}
              {new Date(selectedOrder.orderDate).toLocaleDateString()}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  if (loading) {
    return (
      <>
        <Spinner />
      </>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <div className="my-orders-full-container">
      <div className="my-orders-container">
        <div className="breadcrum-container">
          <Breadcrums items={[{ label: "Mis pedidos" }]} />
        </div>
        <div className="red-underline">
          <h1 className="cart-title">MIS PEDIDOS</h1>
        </div>
        {orders.length === 0 ? (
          <div className="text-center mt-4">
            <p>No tienes pedidos realizados aún.</p>
            <Button
              onClick={() => navigate("/productos")}
              className="btn-orders"
            >
              Ir a Productos
            </Button>
          </div>
        ) : (
          <>
            <Table
              striped
              bordered
              hover
              responsive
              className="orders-table mt-3"
            >
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Dirección de Entrega</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>{`${order.customerInfo?.address}` || ""}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => handleShowDetails(order)}
                        className="detail-button"
                      >
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <OrderDetailModal />
          </>
        )}
      </div>
    </div>
  );
}
