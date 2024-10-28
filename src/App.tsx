import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "../src/components/NavBar/NavBar";
import Header from "../src/components/Header/Header";
import CardDelivery from "./components/CardDerlivery/CardDelivery";
import Products from "../src/components/Products/Products";
import Info from "../src/components/Info/Info";
import Offer from "../src/components/Offer/Offer";
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
              <Info />
              <CardDelivery />
              <Offer />
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
