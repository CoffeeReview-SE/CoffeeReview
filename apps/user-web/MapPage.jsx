import React from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../BrandLogo.jsx";
import StoreMap from "./StoreMap.jsx";

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <div className="store-map-page">
      <header className="store-map-page__bar">
        <a className="store-map-page__brand" href="/" onClick={(event) => {
          event.preventDefault();
          navigate("/");
        }}>
          <BrandLogo size={32} tone="light" /> SaigonCoffee
        </a>
        <button className="store-map-page__home" onClick={() => navigate("/")} type="button">
          Về trang chủ
        </button>
      </header>
      <StoreMap />
    </div>
  );
}
