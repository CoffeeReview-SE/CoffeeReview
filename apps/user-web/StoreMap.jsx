import React, { useEffect, useRef, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useLanguage } from "./LanguageContext.jsx";
import "./StoreMap.css";

const currentLocationIcon = divIcon({
  className: "current-location-icon",
  html: '<span class="current-location-icon__pulse"></span><span class="current-location-icon__dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const locations = [
  {
    id: 1,
    name: "The Coffee House - Nguyễn Huệ",
    lat: 10.7741,
    lng: 106.7034,
    address: "45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  },
  {
    id: 2,
    name: "Highlands Coffee - Võ Văn Ngân",
    lat: 10.8502,
    lng: 106.772,
    address: "125 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh",
  },
  {
    id: 3,
    name: "Phúc Long - Quang Trung",
    lat: 10.8334,
    lng: 106.6652,
    address: "Q. Gò Vấp, TP. Hồ Chí Minh",
  },
];

function ChangeView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.65 });
  }, [center, map, zoom]);

  return null;
}

export default function StoreMap() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]);
  const [mapZoom, setMapZoom] = useState(12);
  const [userPosition, setUserPosition] = useState(null);
  const [locationStatus, setLocationStatus] = useState({ key: "map.requesting" });
  const [isLocating, setIsLocating] = useState(false);
  const requestedLocation = useRef(false);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("vi");
  const filteredLocations = locations.filter((item) =>
    `${item.name} ${item.address}`.toLocaleLowerCase("vi").includes(normalizedSearch),
  );

  const selectLocation = (item) => {
    setMapCenter([item.lat, item.lng]);
    setMapZoom(16);
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ key: "map.unsupported" });
      return;
    }

    setIsLocating(true);
    setLocationStatus({ key: "map.locatingStatus" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        setUserPosition({ position, accuracy: coords.accuracy });
        setMapCenter(position);
        setMapZoom(16);
        setLocationStatus({ key: "map.located", values: { accuracy: Math.round(coords.accuracy) } });
        setIsLocating(false);
      },
      (error) => {
        const key = error.code === error.PERMISSION_DENIED
          ? "map.denied"
          : error.code === error.POSITION_UNAVAILABLE
            ? "map.unavailable"
            : "map.timeout";
        setLocationStatus({ key });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  };

  useEffect(() => {
    // Tự lấy GPS khi mở trang; ref tránh gọi lại trong React StrictMode.
    if (!requestedLocation.current) {
      requestedLocation.current = true;
      locateMe();
    }
  }, []);

  return (
    <section className="store-map" id="store-map" aria-labelledby="store-map-title">
      <div className="store-map__intro">
        <p className="store-map__eyebrow">{t("map.eyebrow")}</p>
        <h1 id="store-map-title">{t("map.title")}</h1>
        <p>{t("map.description")}</p>
      </div>

      <label className="store-map__search-label" htmlFor="store-map-search">
        {t("map.searchLabel")}
      </label>
      <input
        id="store-map-search"
        className="store-map__search"
        type="search"
        placeholder={t("map.searchPlaceholder")}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <button className="store-map__locate" type="button" onClick={locateMe} disabled={isLocating}>
        {isLocating ? t("map.locating") : t("map.locate")}
      </button>
      <p className="store-map__location-status" role="status" aria-live="polite">
        {t(locationStatus.key, locationStatus.values)}
      </p>

      <div className="store-map__layout">
        <aside className="store-map__results" aria-label={t("map.results")}>
          <p className="store-map__count">{t("map.count", { count: filteredLocations.length })}</p>
          {filteredLocations.length ? (
            filteredLocations.map((item) => (
              <button
                className="store-map__result"
                key={item.id}
                onClick={() => selectLocation(item)}
                type="button"
              >
                <span className="store-map__pin" aria-hidden="true">●</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.address}</small>
                </span>
              </button>
            ))
          ) : (
            <p className="store-map__empty">{t("map.empty")}</p>
          )}
        </aside>

        <MapContainer
          className="store-map__canvas"
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredLocations.map((item) => (
            <Marker key={item.id} position={[item.lat, item.lng]}>
              <Popup>
                <strong>{item.name}</strong>
                <br />
                {item.address}
              </Popup>
            </Marker>
          ))}
          {userPosition && (
            <Marker position={userPosition.position} icon={currentLocationIcon} zIndexOffset={1000}>
              <Tooltip permanent direction="top" offset={[0, -12]}>
                {t("map.current")}
              </Tooltip>
              <Popup>
                <strong>{t("map.userCurrent")}</strong>
                <br />
                {userPosition.position[0].toFixed(6)}, {userPosition.position[1].toFixed(6)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <p className="store-map__note">
        {t("map.note")}
      </p>
    </section>
  );
}
