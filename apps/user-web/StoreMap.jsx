import React, { useEffect, useRef, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useLanguage } from "./LanguageContext.jsx";
import { getUserApi } from "./api.js";
import { trackAudio } from "../analytics/tracking.js";
import { getSpeechVoice, speechLanguageTag } from "./speechVoice.js";
import "./StoreMap.css";

const currentLocationIcon = divIcon({
  className: "current-location-icon",
  html: '<span class="current-location-icon__pulse"></span><span class="current-location-icon__dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const brandPinColors = ["#273b2e", "#8a4f2d", "#536c54", "#9a3d32", "#745c3f", "#35566b"];
function coffeeMarkerIcon(brandId) {
  const color = brandPinColors[Math.abs(Number(brandId) || 0) % brandPinColors.length];
  return divIcon({
    className: "coffee-map-marker-icon",
    html: `<span class="coffee-map-pin" style="--pin-color:${color}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Zm12 2h2a2 2 0 0 1 0 4h-2M4 21h15M8 3c0 2 2 2 2 4m2-4c0 2 2 2 2 4" /></svg></span>`,
    iconSize: [34, 40],
    iconAnchor: [17, 38],
  });
}

function googleDirectionsUrl(item, userPosition) {
  const params = new URLSearchParams({ api: "1", destination: `${item.lat},${item.lng}` });
  if (userPosition) params.set("origin", `${userPosition.position[0]},${userPosition.position[1]}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

const PROXIMITY_RADIUS_METERS = 2000;
function distanceMeters(aLat, aLng, bLat, bLng) {
  const radians = degrees => degrees * Math.PI / 180;
  const dLat = radians(bLat - aLat);
  const dLng = radians(bLng - aLng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ChangeView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.65 });
  }, [center, map, zoom]);

  return null;
}

export default function StoreMap() {
  const { t, languageCode } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState([]);
  const [brandCatalog, setBrandCatalog] = useState([]);
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]);
  const [mapZoom, setMapZoom] = useState(12);
  const [userPosition, setUserPosition] = useState(null);
  const [locationStatus, setLocationStatus] = useState({ key: "" });
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyAudioEnabled, setNearbyAudioEnabled] = useState(false);
  const [nearbyAudioStatus, setNearbyAudioStatus] = useState("");
  const autoPlayedNearestBranch = useRef(false);
  const nearbyAudioQueue = useRef([]);
  const isSpeakingNearby = useRef(false);
  const isPreparingNearby = useRef(false);
  const speakNextNearby = useRef(null);
  const proximityAudioActive = useRef(nearbyAudioEnabled);
  const proximityAudioGeneration = useRef(0);
  proximityAudioActive.current = nearbyAudioEnabled;
  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/branches", { signal: controller.signal })
      .then(rows => { if (Array.isArray(rows)) setLocations(rows); })
      .catch(() => { if (!controller.signal.aborted) setLocations([]); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/brands", { signal: controller.signal })
      .then(rows => { if (Array.isArray(rows)) setBrandCatalog(rows); })
      .catch(() => { if (!controller.signal.aborted) setBrandCatalog([]); });
    return () => controller.abort();
  }, []);

  const proximityText = {
    vi: { enable: "Lấy GPS & tự phát audio", disable: "Tắt audio gần bạn", enabled: "Đã bật. Đang tìm thương hiệu trong bán kính 2 km…", found: names => `Đang đọc mô tả: ${names.join(", ")}`, none: "Chưa có thương hiệu có mô tả trong bán kính 2 km.", gps: "Cho phép GPS để tự phát audio thương hiệu gần bạn.", denied: "Không lấy được GPS. Hãy kiểm tra quyền vị trí của trình duyệt." },
    en: { enable: "Use GPS & auto-play nearby audio", disable: "Disable nearby audio", enabled: "On. Looking for brands within 2 km…", found: names => `Reading: ${names.join(", ")}`, none: "No brands with descriptions found within 2 km.", gps: "Allow GPS to play audio for nearby brands.", denied: "Could not get GPS. Check your browser location permission." },
    ja: { enable: "GPSで近くの音声を自動再生", disable: "近くの音声を無効にする", enabled: "有効です。半径2 km以内のブランドを検索中…", found: names => `再生中: ${names.join(", ")}`, none: "半径2 km以内に説明のあるブランドがありません。", gps: "近くのブランド音声を再生するにはGPSを許可してください。", denied: "GPSを取得できません。ブラウザーの位置情報権限を確認してください。" },
    zh: { enable: "使用 GPS 自动播放附近品牌语音", disable: "关闭附近语音", enabled: "已开启，正在查找 2 公里内的品牌…", found: names => `正在朗读：${names.join("、")}`, none: "2 公里内没有带有介绍的品牌。", gps: "允许 GPS 以自动播放附近品牌介绍。", denied: "无法获取 GPS。请检查浏览器的位置权限。" },
  }[languageCode] || { enable: "Use GPS & auto-play nearby audio", disable: "Disable nearby audio", enabled: "On. Looking for brands within 2 km…", found: names => `Reading: ${names.join(", ")}`, none: "No brands with descriptions found within 2 km.", gps: "Allow GPS to play audio for nearby brands.", denied: "Could not get GPS. Check your browser location permission." };

  useEffect(() => {
    speakNextNearby.current = async () => {
      if (isSpeakingNearby.current || isPreparingNearby.current || !proximityAudioActive.current) return;
      const brand = nearbyAudioQueue.current.shift();
      if (!brand) return;
      if (!brand.description?.trim()) { speakNextNearby.current?.(); return; }
      const generation = proximityAudioGeneration.current;
      const sourceLanguage = (brand.descriptionLanguageCode || "vi").toLowerCase();
      let speechText = brand.description.trim();
      let voiceLanguage = sourceLanguage;
      isPreparingNearby.current = true;
      if (sourceLanguage !== languageCode) {
        try {
          const translated = await getUserApi(`/api/localization/brands/${brand.id}/translations/${languageCode}`, { method: "POST" });
          if (translated.description) {
            speechText = translated.description;
            voiceLanguage = languageCode;
          }
        } catch {
          // Keep speaking the stored description if the translation service is unavailable.
        }
      }
      if (generation !== proximityAudioGeneration.current || !proximityAudioActive.current) {
        isPreparingNearby.current = false;
        return;
      }
      const voice = await getSpeechVoice(voiceLanguage);
      if (generation !== proximityAudioGeneration.current || !proximityAudioActive.current) {
        isPreparingNearby.current = false;
        return;
      }
      const speech = new SpeechSynthesisUtterance(speechText);
      speech.lang = speechLanguageTag(voiceLanguage);
      if (voice) speech.voice = voice;
      speech.onstart = () => {
        isSpeakingNearby.current = true;
        trackAudio({ brandId: Number(brand.id), languageCode: voiceLanguage, eventId: crypto.randomUUID() });
      };
      const finish = () => {
        isSpeakingNearby.current = false;
        isPreparingNearby.current = false;
        speakNextNearby.current?.();
      };
      speech.onend = finish;
      speech.onerror = finish;
      isPreparingNearby.current = false;
      isSpeakingNearby.current = true;
      window.speechSynthesis.cancel();
      try {
        window.speechSynthesis.speak(speech);
      } catch {
        finish();
      }
    };
  }, [languageCode]);

  useEffect(() => {
    if (!nearbyAudioEnabled) return undefined;
    if (!navigator.geolocation || !("speechSynthesis" in window)) {
      setNearbyAudioStatus(proximityText.denied);
      return undefined;
    }
    setNearbyAudioStatus(proximityText.enabled);
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => setUserPosition({ position: [coords.latitude, coords.longitude], accuracy: coords.accuracy }),
      () => setNearbyAudioStatus(proximityText.denied),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
    return () => {
      proximityAudioGeneration.current += 1;
      navigator.geolocation.clearWatch(watchId);
      window.speechSynthesis.cancel();
      nearbyAudioQueue.current = [];
      autoPlayedNearestBranch.current = false;
      isSpeakingNearby.current = false;
      isPreparingNearby.current = false;
    };
  }, [nearbyAudioEnabled, languageCode]);

  useEffect(() => {
    if (!nearbyAudioEnabled || !userPosition || !brandCatalog.length) return;
    if (autoPlayedNearestBranch.current) return;
    const nearest = locations
      .filter(branch => Number.isFinite(branch.lat) && Number.isFinite(branch.lng))
      .map(branch => ({ branch, distance: distanceMeters(userPosition.position[0], userPosition.position[1], branch.lat, branch.lng) }))
      .filter(item => item.distance <= PROXIMITY_RADIUS_METERS)
      .sort((a, b) => a.distance - b.distance)[0];
    if (!nearest) {
      setNearbyAudioStatus(proximityText.none);
      return;
    }
    const brandsById = new Map(brandCatalog.map(brand => [brand.id, brand]));
    const brand = brandsById.get(nearest.branch.brandId);
    if (!brand?.description?.trim()) {
      setNearbyAudioStatus(proximityText.none);
      return;
    }
    autoPlayedNearestBranch.current = true;
    nearbyAudioQueue.current = [brand];
    setNearbyAudioStatus(proximityText.found([nearest.branch.name || brand.name]));
    speakNextNearby.current?.();
  }, [nearbyAudioEnabled, userPosition, locations, brandCatalog, languageCode]);

  const toggleNearbyAudio = () => {
    if (!nearbyAudioEnabled) {
      if (!navigator.geolocation) { setNearbyAudioStatus(proximityText.denied); return; }
      if (!("speechSynthesis" in window)) { setNearbyAudioStatus(proximityText.denied); return; }
      setNearbyAudioEnabled(true);
      setNearbyAudioStatus(proximityText.gps);
      return;
    }
    setNearbyAudioEnabled(false);
    setNearbyAudioStatus("");
  };
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("vi");
  const filteredLocations = locations.filter((item) =>
    `${item.name} ${item.brand} ${item.address}`.toLocaleLowerCase("vi").includes(normalizedSearch),
  );
  const nearbyLocationsByDistance = userPosition
    ? locations
      .filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .map(item => ({ ...item, distanceFromUser: distanceMeters(userPosition.position[0], userPosition.position[1], item.lat, item.lng) }))
      .filter(item => item.distanceFromUser <= PROXIMITY_RADIUS_METERS)
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
    : [];
  const locationsByDistance = userPosition
    ? nearbyLocationsByDistance.filter(item => `${item.name} ${item.brand} ${item.address}`.toLocaleLowerCase("vi").includes(normalizedSearch))
    : filteredLocations;
  const nearbyRankById = new Map(nearbyLocationsByDistance.map((item, index) => [item.id, index + 1]));
  const nearestBranchId = nearbyLocationsByDistance[0]?.id;
  const mappedLocations = locationsByDistance.filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));
  const formatDistance = distance => distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`;
  const selectLocation = (item) => {
    if (item.lat == null || item.lng == null) return;
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

  const locateAndEnableNearbyAudio = () => {
    if (!nearbyAudioEnabled) {
      if (!navigator.geolocation || !("speechSynthesis" in window)) {
        setNearbyAudioStatus(proximityText.denied);
        return;
      }
      setNearbyAudioEnabled(true);
      setNearbyAudioStatus(proximityText.gps);
    }
    locateMe();
  };

  return (
    <section className="store-map" id="store-map" aria-labelledby="store-map-title">
      <div className="store-map__intro">
        <p className="store-map__eyebrow">{t("map.eyebrow")}</p>
        <h1 id="store-map-title">{t("map.title")}</h1>
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
      <button className="store-map__locate" type="button" onClick={locateAndEnableNearbyAudio} disabled={isLocating} aria-label={t("map.locate")}>
        {isLocating ? t("map.locating") : t("map.locate")}
      </button>
      {nearbyAudioEnabled && <button className="store-map__nearby-audio" type="button" onClick={toggleNearbyAudio} aria-pressed="true">{proximityText.disable}</button>}
      {nearbyAudioStatus && <p className="store-map__nearby-status" role="status" aria-live="polite">{nearbyAudioStatus}</p>}
      {locationStatus.key && <p className="store-map__location-status" role="status" aria-live="polite">
        {t(locationStatus.key, locationStatus.values)}
      </p>}

      <div className="store-map__layout">
        <aside className="store-map__results" aria-label={t("map.results")}>
          <div className="store-map__table-wrap">
            <table className="store-map__table store-map__summary-table">
              <caption>Tổng số chi nhánh đang có</caption>
              <tbody><tr><th scope="row">Tất cả địa điểm</th><td>{locations.length}</td></tr></tbody>
            </table>
          </div>
          <div className="store-map__table-wrap">
            <table className="store-map__table store-map__nearby-table">
              <caption>Chi nhánh trong bán kính 2 km · gần đến xa ({locationsByDistance.length})</caption>
              <thead><tr><th scope="col">#</th><th scope="col">Chi nhánh</th><th scope="col">Khoảng cách</th></tr></thead>
              <tbody>
                {!userPosition ? (
                  <tr><td colSpan={3} className="store-map__table-empty">Đang chờ vị trí GPS.</td></tr>
                ) : locationsByDistance.length ? locationsByDistance.map(item => (
                  <tr key={item.id} className={item.id === nearestBranchId ? "store-map__nearest-row" : undefined}>
                    <td>{nearbyRankById.get(item.id)}</td>
                    <td>
                      <button className="store-map__table-select" onClick={() => selectLocation(item)} type="button">{item.name}</button>
                      <small>{item.address}</small>
                      {item.id === nearestBranchId && nearbyAudioEnabled && <small className="store-map__audio-note">Tự phát audio</small>}
                      <a className="store-map__table-directions" href={googleDirectionsUrl(item, userPosition)} target="_blank" rel="noopener noreferrer">{t("map.directions")}</a>
                    </td>
                    <td>{formatDistance(item.distanceFromUser)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="store-map__table-empty">Không có chi nhánh phù hợp trong bán kính 2 km.</td></tr>
                )}
              </tbody>
            </table>
          </div>
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
          {mappedLocations.map((item) => (
            <Marker key={item.id} position={[item.lat, item.lng]} icon={coffeeMarkerIcon(item.brandId)} riseOnHover>
              <Tooltip direction="top" sticky className="coffee-map-tooltip">
                {item.brand || item.name}
              </Tooltip>
              <Popup>
                <strong>{item.brand || item.name}</strong>
                <br />
                {item.address}
                {item.phone && <><br />{item.phone}</>}
                <br />
                <a className="store-map__directions" href={googleDirectionsUrl(item, userPosition)} target="_blank" rel="noopener noreferrer">
                  {t("map.directionsGoogle")}
                </a>
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
    </section>
  );
}
