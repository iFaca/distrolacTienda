import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "../src/components/NavBar/NavBar";
import Header from "../src/components/Header/Header";
// import CardDelivery from "./components/CardDerlivery/CardDelivery";
import Products from "./components/Products/HomeProducts/Products";
import ProductsList from "./components/Products/ProductsList/ProductList";
import About from "./components/About/About";
import HowToBuy from "./components/HowToBuy/HowToBuy";
import Work from "./components/Work/Work";
import Cart from "./components/Cart/Cart";
import Profile from "./components/Profile/Profile";
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
              <Products />
              {/*<Info />
              <CardDelivery />
              <Offer />*/}
            </>
          }
        />
        <Route path="/productos" element={<ProductsList />} />
        <Route path="/sobrenosotros" element={<About />} />
        <Route path="/comocomprar" element={<HowToBuy />} />
        <Route path="/trabaja" element={<Work />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/carrito" element={<Cart />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
