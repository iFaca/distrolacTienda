import "./brands.css";

import brescia from "../../assets/brescialat-Photoroom.png";
import cagnoli from "../../assets/cagnoli-Photoroom.png";
import chuker from "../../assets/chuker-Photoroom.png";
import citric from "../../assets/citric-Photoroom.png";
import delicias from "../../assets/delicias de la nonna-Photoroom.png";
import fox from "../../assets/Fox-Photoroom.png";
import granix from "../../assets/granix-Photoroom.png";
import ilolay from "../../assets/ilolay-Photoroom.png";
import indias from "../../assets/indias-Photoroom.png";
import laItaliana from "../../assets/la italiana-Photoroom.png";
import noalsa from "../../assets/noalsa-Photoroom.png";
import paladini from "../../assets/paladini-Photoroom.png";
import profecia from "../../assets/profecia-Photoroom.png";
import ramolac from "../../assets/ramolac-Photoroom.png";
import santaMaria from "../../assets/santa maria-Photoroom.png";
import talca from "../../assets/talca-Photoroom.png";
import trozer from "../../assets/trozer-Photoroom.png";

const items: Array<[string, string]> = [
  [brescia, "Brescialat"],
  [cagnoli, "Cagnoli"],
  [chuker, "Chuker"],
  [citric, "Citric"],
  [delicias, "Delicias De La Nonna"],
  [fox, "Fox"],
  [granix, "Granix"],
  [ilolay, "Ilolay"],
  [indias, "Indias"],
  [laItaliana, "La Italiana"],
  [noalsa, "Noalsa"],
  [paladini, "Paladini"],
  [profecia, "Profecía"],
  [ramolac, "Ramolac"],
  [santaMaria, "Santa María"],
  [talca, "Talca"],
  [trozer, "Trozer"],
];

const Brands = () => (
  <div className="brands-full-container">
    <div className="brands-container">
      <div className="text-products-home" style={{ marginBottom: 20 }}>
        <div className="h2-container">
          <h2>MARCAS LÍDERES</h2>
        </div>
        <h2>QUE CONFÍAN EN NOSOTROS</h2>
      </div>

      <div className="items-container">
        {items.map(([src, alt]) => (
          <div className="item-brand" key={alt}>
            <img src={src} alt={alt} className="brand-img" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Brands;
