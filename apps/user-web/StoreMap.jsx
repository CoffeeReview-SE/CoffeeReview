import React, { useEffect, useMemo, useRef, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useLanguage } from "./LanguageContext.jsx";
import { getUserApi } from "./api.js";
import { trackAudio } from "../analytics/tracking.js";
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

function KeepMapSized() {
  const map = useMap();

  useEffect(() => {
    let frame = 0;
    const invalidate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    };
    const container = map.getContainer();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(invalidate);
    observer?.observe(container);
    window.addEventListener("resize", invalidate);
    window.addEventListener("orientationchange", invalidate);
    invalidate();
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("orientationchange", invalidate);
      window.cancelAnimationFrame(frame);
    };
  }, [map]);

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
  const [locationStatus, setLocationStatus] = useState({ key: "map.requesting" });
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyAudioEnabled, setNearbyAudioEnabled] = useState(false);
  const [nearbyAudioStatus, setNearbyAudioStatus] = useState("");
  const [tileStatus, setTileStatus] = useState("loading");
  const [tileRetry, setTileRetry] = useState(0);
  const requestedLocation = useRef(false);
  const playedNearbyBrands = useRef(new Set());
  const nearbyAudioQueue = useRef([]);
  const isSpeakingNearby = useRef(false);
  const isPreparingNearby = useRef(false);
  const speakNextNearby = useRef(null);
  const proximityAudioActive = useRef(nearbyAudioEnabled);
  const proximityAudioGeneration = useRef(0);
  const tileEventHandlers = useMemo(() => ({
    load: () => setTileStatus("ready"),
    tileerror: () => setTileStatus("error"),
  }), []);
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
    vi: { enable: "Lấy GPS & tự phát audio", disable: "Tắt audio gần bạn", enabled: "Đã bật. Đang tìm thương hiệu trong bán kính 2 km…", found: names => `Đang đọc mô tả: ${names.join(", ")}`, none: "Chưa có thương hiệu có mô tả trong bán kính 2 km.", noCoordinates: "Dữ liệu chi nhánh chưa có tọa độ để tìm cửa hàng gần bạn.", gps: "Cho phép GPS để tự phát audio thương hiệu gần bạn.", denied: "Không lấy được GPS. Hãy kiểm tra quyền vị trí của trình duyệt." },
    en: { enable: "Use GPS & auto-play nearby audio", disable: "Disable nearby audio", enabled: "On. Looking for brands within 2 km…", found: names => `Reading: ${names.join(", ")}`, none: "No brands with descriptions found within 2 km.", noCoordinates: "Branch coordinates are missing, so nearby stores cannot be found.", gps: "Allow GPS to play audio for nearby brands.", denied: "Could not get GPS. Check your browser location permission." },
    ja: { enable: "GPSで近くの音声を自動再生", disable: "近くの音声を無効にする", enabled: "有効です。半径2 km以内のブランドを検索中…", found: names => `再生中: ${names.join(", ")}`, none: "半径2 km以内に説明のあるブランドがありません。", noCoordinates: "支店の座標がないため、近くの店舗を検索できません。", gps: "近くのブランド音声を再生するにはGPSを許可してください。", denied: "GPSを取得できません。ブラウザーの位置情報権限を確認してください。" },
    zh: { enable: "使用 GPS 自动播放附近品牌语音", disable: "关闭附近语音", enabled: "已开启，正在查找 2 公里内的品牌…", found: names => `正在朗读：${names.join("、")}`, none: "2 公里内没有带有介绍的品牌。", noCoordinates: "缺少分店坐标，无法查找附近门店。", gps: "允许 GPS 以自动播放附近品牌介绍。", denied: "无法获取 GPS。请检查浏览器的位置权限。" },
  }[languageCode] || { enable: "Use GPS & auto-play nearby audio", disable: "Disable nearby audio", enabled: "On. Looking for brands within 2 km…", found: names => `Reading: ${names.join(", ")}`, none: "No brands with descriptions found within 2 km.", noCoordinates: "Branch coordinates are missing, so nearby stores cannot be found.", gps: "Allow GPS to play audio for nearby brands.", denied: "Could not get GPS. Check your browser location permission." };

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
      const speech = new SpeechSynthesisUtterance(speechText);
      speech.lang = voiceLanguage;
      const voice = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith(voiceLanguage.toLowerCase()));
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
      window.speechSynthesis.speak(speech);
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
      playedNearbyBrands.current.clear();
      isSpeakingNearby.current = false;
      isPreparingNearby.current = false;
    };
  }, [nearbyAudioEnabled, languageCode]);

  useEffect(() => {
    if (!nearbyAudioEnabled || !userPosition || !brandCatalog.length) return;
    if (locations.length && !locations.some(branch => branch.lat != null && branch.lat !== "" && branch.lng != null && branch.lng !== "" && Number.isFinite(Number(branch.lat)) && Number.isFinite(Number(branch.lng)))) {
      setNearbyAudioStatus(proximityText.noCoordinates);
      return;
    }
    const nearestByBrand = new Map();
    for (const branch of locations) {
      if (branch.lat == null || branch.lat === "" || branch.lng == null || branch.lng === "") continue;
      const lat = Number(branch.lat);
      const lng = Number(branch.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const distance = distanceMeters(userPosition.position[0], userPosition.position[1], lat, lng);
      if (distance > PROXIMITY_RADIUS_METERS) continue;
      const current = nearestByBrand.get(branch.brandId);
      if (!current || distance < current.distance) nearestByBrand.set(branch.brandId, { distance });
    }
    const brandsById = new Map(brandCatalog.map(brand => [brand.id, brand]));
    const nearby = [...nearestByBrand.entries()]
      .map(([id, info]) => ({ brand: brandsById.get(id), distance: info.distance }))
      .filter(item => item.brand?.description?.trim())
      .sort((a, b) => a.distance - b.distance);
    const newlyNearby = nearby.map(item => item.brand).filter(brand => !playedNearbyBrands.current.has(brand.id));
    if (!newlyNearby.length) {
      if (!nearby.length) setNearbyAudioStatus(proximityText.none);
      return;
    }
    newlyNearby.forEach(brand => playedNearbyBrands.current.add(brand.id));
    nearbyAudioQueue.current.push(...newlyNearby);
    setNearbyAudioStatus(proximityText.found(newlyNearby.map(brand => brand.name)));
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
  const mappedLocations = filteredLocations.flatMap(item => {
    if (item.lat == null || item.lat === "" || item.lng == null || item.lng === "") return [];
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [{ ...item, lat, lng }] : [];
  });

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
      <p className="store-map__location-status" role="status" aria-live="polite">
        {t(locationStatus.key, locationStatus.values)}
      </p>

      <div className="store-map__layout">
        <aside className="store-map__results" aria-label={t("map.results")}>
          <p className="store-map__count">{t("map.count", { count: filteredLocations.length })}</p>
          {filteredLocations.length ? (
            filteredLocations.map((item) => (
              <div className="store-map__result" key={item.id}>
                <button className="store-map__select" onClick={() => selectLocation(item)} type="button">
                <span className="store-map__pin" aria-hidden="true">●</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.address}</small>
                  {item.lat == null || item.lng == null ? <small>{t("map.unverified")}</small> : null}
                </span>
                </button>
                {Number.isFinite(item.lat) && Number.isFinite(item.lng) && (
                  <a className="store-map__directions" href={googleDirectionsUrl(item, userPosition)} target="_blank" rel="noopener noreferrer">
                    {t("map.directions")}
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="store-map__empty">{t("map.empty")}</p>
          )}
        </aside>

        <div className="store-map__canvas-wrap">
        <MapContainer
          className="store-map__canvas"
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom
        >
          <KeepMapSized />
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            key={tileRetry}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            eventHandlers={tileEventHandlers}
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
        {tileStatus !== "ready" && (
          <div className={`store-map__tile-status${tileStatus === "error" ? " is-error" : ""}`} role="status" aria-live="polite">
            <span>{tileStatus === "error" ? t("map.tilesError") : t("map.tilesLoading")}</span>
            {tileStatus === "error" && <button type="button" onClick={() => { setTileStatus("loading"); setTileRetry(value => value + 1); }}>{t("map.tilesRetry")}</button>}
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
