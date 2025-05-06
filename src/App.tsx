// App.tsx después de eliminar BrowserRouter
import "./App.css";
import { Routes, Route } from "react-router-dom"; // Eliminamos BrowserRouter aquí
import NavBar from "../src/components/NavBar/NavBar";
import Header from "../src/components/Header/Header";
import Categories from "./components/Products/HomeProducts/Categories";
import ProductsList from "./components/Products/ProductsList/ProductList";
import About from "./components/About/About";
import HowToBuy from "./components/HowToBuy/HowToBuy";
import Work from "./components/Work/Work";
import Cart from "./components/Cart/Cart";
import Login from "./components/Login/Login";
import ProductDetail from "./components/Products/ProductsList/ProductDetail/ProductDetail";
import CartDetail from "./components/Cart/CartDetail/CartDetail";
import ShippingDetail from "./components/Cart/ShippingDetail/ShippingDetail";
import Footer from "./components/Footer/Footer";
import Profile from "./components/Profile/Profile";
import Orders from "./components/Profile/MyOrders/MyOrders";
import { LoadScript } from "@react-google-maps/api";

function App() {
  return (
    <div className="app-container">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Categories />
                {/* <Info />
                    <CardDelivery />
                    <Offer /> */}
              </>
            }
          />
          <Route path="/productos" element={<ProductsList />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/sobrenosotros" element={<About />} />
          <Route path="/comocomprar" element={<HowToBuy />} />
          <Route path="/trabaja" element={<Work />} />
          <Route path="/login" element={<Login />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/detalledepedido" element={<CartDetail />} />
          <Route path="/editarpedido" element={<ShippingDetail />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/mispedidos" element={<Orders />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
