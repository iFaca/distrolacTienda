import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "../src/components/NavBar/NavBar";
import Header from "../src/components/Header/Header";
// import CardDelivery from "./components/CardDerlivery/CardDelivery";
import Categories from "./components/Products/HomeProducts/Categories";
import ProductsList from "./components/Products/ProductsList/ProductList";
import About from "./components/About/About";
import HowToBuy from "./components/HowToBuy/HowToBuy";
import Work from "./components/Work/Work";
import Cart from "./components/Cart/Cart";
import Profile from "./components/Profile/Profile";
import ProductDetail from "./components/Products/ProductsList/ProductDetail/ProductDetail";
import CartDetail from "./components/Cart/CartDetail/CartDetail";
import ShippingDetail from "./components/Cart/ShippingDetail/ShippingDetail";
// import Info from "../src/components/Info/Info";
// import Offer from "../src/components/Offer/Offer";
import Footer from "./components/Footer/Footer";
function App() {
  return (
    <Router>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Categories />
              {/*<Info />
              <CardDelivery />
              <Offer />*/}
            </>
          }
        />
        <Route path="/productos" element={<ProductsList />} />
        <Route path="/productos/:id" element={<ProductDetail />} />
        <Route path="/sobrenosotros" element={<About />} />
        <Route path="/comocomprar" element={<HowToBuy />} />
        <Route path="/trabaja" element={<Work />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/detalledepedido" element={<CartDetail />} />
        <Route path="/editarpedido" element={<ShippingDetail />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
