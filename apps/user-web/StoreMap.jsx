import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "./StoreMap.css";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]);
  const [mapZoom, setMapZoom] = useState(12);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("vi");
  const filteredLocations = locations.filter((item) =>
    `${item.name} ${item.address}`.toLocaleLowerCase("vi").includes(normalizedSearch),
  );

  const selectLocation = (item) => {
    setMapCenter([item.lat, item.lng]);
    setMapZoom(16);
  };

  return (
    <section className="store-map" id="store-map" aria-labelledby="store-map-title">
      <div className="store-map__intro">
        <p className="store-map__eyebrow">KHÁM PHÁ SÀI GÒN</p>
        <h1 id="store-map-title">Tìm quán cà phê trên bản đồ</h1>
        <p>Dữ liệu địa điểm mẫu để bạn trải nghiệm giao diện bản đồ và tìm kiếm.</p>
      </div>

      <label className="store-map__search-label" htmlFor="store-map-search">
        Tìm theo tên quán hoặc địa chỉ
      </label>
      <input
        id="store-map-search"
        className="store-map__search"
        type="search"
        placeholder="Ví dụ: Quận 1, Highlands..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <div className="store-map__layout">
        <aside className="store-map__results" aria-label="Địa điểm tìm thấy">
          <p className="store-map__count">{filteredLocations.length} địa điểm</p>
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
            <p className="store-map__empty">Không tìm thấy địa điểm phù hợp.</p>
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
        </MapContainer>
      </div>
      <p className="store-map__note">
        Địa điểm hiện là dữ liệu mẫu trong frontend; chưa kết nối backend hoặc database.
      </p>
    </section>
  );
}
