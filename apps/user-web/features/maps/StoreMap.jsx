import React, { useCallback, useEffect, useRef, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import LocalizedBranchAddress from "../../components/LocalizedBranchAddress.jsx";
import { brandDescriptionLanguage, getUserApi } from "../../../shared/api/userApi.js";
import { trackAudio } from "../../../analytics/tracking.js";
import { getSpeechVoice, speechLanguageTag } from "../../utils/speechVoice.js";
import { getOfflineBrandTranslation } from "../../i18n/offlineBrandTranslations.js";
import "./StoreMap.css";
import { distanceToRoute, shouldReroute } from "./routeTracking.mjs";

const currentLocationIcon = divIcon({
  className: "current-location-icon",
  html: '<span class="current-location-icon__pulse"></span><span class="current-location-icon__dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const distanceLabelAnchorIcon = divIcon({
  className: "store-map__distance-anchor",
  html: "",
  iconSize: [1, 1],
  iconAnchor: [0, 0],
});

const measurementStartIcon = divIcon({
  className: "store-map__measure-marker",
  html: '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31S2 21.3 2 12a10 10 0 1 1 20 0c0 9.3-10 19-10 19Z" fill="#315746" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="11" r="6" fill="#fff"/><text x="12" y="14" text-anchor="middle" font-size="8" font-weight="700" fill="#315746">A</text></svg>',
  iconSize: [34, 44],
  iconAnchor: [17, 42],
});

const measurementEndIcon = divIcon({
  className: "store-map__measure-marker",
  html: '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31S2 21.3 2 12a10 10 0 1 1 20 0c0 9.3-10 19-10 19Z" fill="#a85c2a" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="11" r="6" fill="#fff"/><text x="12" y="14" text-anchor="middle" font-size="8" font-weight="700" fill="#a85c2a">B</text></svg>',
  iconSize: [34, 44],
  iconAnchor: [17, 42],
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

const DEFAULT_PROXIMITY_RADIUS_KM = 2;
const WALKING_AUDIO_RADIUS_METERS = 500;
const SAVED_LOCATION_KEY = "sgcoffee.lastGpsPosition";
function readSavedPosition() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(SAVED_LOCATION_KEY) || "null");
    if (Array.isArray(saved?.position) && saved.position.length === 2 && saved.position.every(Number.isFinite)) return saved;
  } catch { /* Ignore unavailable or invalid session storage. */ }
  return null;
}

function savePosition(position) {
  try { window.sessionStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(position)); }
  catch { /* The map can still use the current location for this page. */ }
}

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

function MapPointPicker({ enabled, onPick }) {
  useMapEvents({ click: event => { if (enabled) onPick([event.latlng.lat, event.latlng.lng]); } });
  return null;
}

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function FitRoute({ route }) {
  const map = useMap();
  useEffect(() => {
    if (route) {
      map.closePopup();
      map.fitBounds(route.paths.flat(), { padding: [45, 65], maxZoom: 17 });
    }
  }, [map, route]);
  return null;
}

function FollowPosition({ enabled, position, onPause }) {
  const map = useMapEvents({ dragstart: onPause });
  useEffect(() => {
    if (enabled && position) map.setView(position, Math.max(16, map.getZoom()), { animate: true, duration: 0.5 });
  }, [enabled, position, map]);
  return null;
}

function FitLocations({ locations, active, resetCenter }) {
  const map = useMap();
  const wasActive = useRef(active);
  const previousLocations = useRef(locations);
  useEffect(() => {
    const locationsChanged = previousLocations.current !== locations;
    if (active && (!wasActive.current || locationsChanged)) {
      const mapped = locations.filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));
      if (mapped.length) map.fitBounds(mapped.map(item => [item.lat, item.lng]), { padding: [42, 42], maxZoom: 13, animate: true });
    } else if (!active && wasActive.current && resetCenter) {
      map.setView(resetCenter, 16, { animate: true, duration: 0.65 });
    }
    wasActive.current = active;
    previousLocations.current = locations;
  }, [active, locations, map, resetCenter]);
  return null;
}

function MapControls({ onLocate, t }) {
  const map = useMap();
  return (
    <div className="store-map__map-controls" aria-label={t("map.controls")}>
      <button className="store-map__map-locate" type="button" title={t("map.locate")} aria-label={t("map.locate")} onClick={onLocate}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></svg>
      </button>
      <div className="store-map__map-zoom" aria-label={t("map.zoomControls")}>
        <button type="button" title={t("map.zoomIn")} aria-label={t("map.zoomIn")} onClick={() => map.zoomIn()}>+</button>
        <button type="button" title={t("map.zoomOut")} aria-label={t("map.zoomOut")} onClick={() => map.zoomOut()}>−</button>
      </div>
    </div>
  );
}

export default function StoreMap({ fullScreen = false, enableDistanceMeasure = false, routeDestination = null, initialSearch = "" }) {
  const mapRef = useRef(null);
  const routingPanelRef = useRef(null);
  const { t, languageCode } = useLanguage();
  const voiceTargetLanguage = languageCode;
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState([]);
  const [brandCatalog, setBrandCatalog] = useState([]);
  const [catalogLoadError, setCatalogLoadError] = useState(false);
  const [activeDescriptionBrand, setActiveDescriptionBrand] = useState(null);
  const [descriptionTranslations, setDescriptionTranslations] = useState({});
  const descriptionTranslationCache = useRef(new Map());
  const descriptionTranslationRequests = useRef(new Set());
  const descriptionTranslationControllers = useRef(new Set());
  const [userPosition, setUserPosition] = useState(() => readSavedPosition());
  const [mapCenter, setMapCenter] = useState(() => readSavedPosition()?.position || [10.7769, 106.7009]);
  const [mapZoom, setMapZoom] = useState(() => readSavedPosition() ? 16 : 12);
  const [mapToast, setMapToast] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [measureActive, setMeasureActive] = useState(false);
  const [measurement, setMeasurement] = useState(null);
  const [navigationActive, setNavigationActive] = useState(false);
  const [following, setFollowing] = useState(false);
  const [navigationStatus, setNavigationStatus] = useState("");
  const navigationFix = useRef(null);
  const offRouteSince = useRef(null);
  const lastRouteRequest = useRef(0);
  const [travelMode, setTravelMode] = useState("motorcycle");
  const [routeState, setRouteState] = useState({ status: "idle" });
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const routeOptions = routeState.status === "ready"
    ? (routeState.route.routes?.length ? routeState.route.routes : [routeState.route])
    : [];
  const selectedRoute = routeOptions[selectedRouteIndex] || routeOptions[0];
  const selectRoute = index => {
    setSelectedRouteIndex(index);
    offRouteSince.current = null;
  };
  const [routeAttempt, setRouteAttempt] = useState(0);
  const routeCache = useRef(new Map());
  const handledRouteDestination = useRef("");
  useEffect(() => {
    if (initialSearch) setSearchTerm(initialSearch);
  }, [initialSearch]);
  useEffect(() => {
    if (!measurement) { setRouteState({ status: "idle" }); return; }
    setSelectedRouteIndex(0);
    const controller = new AbortController();
    const params = new URLSearchParams({ startLat: measurement.start[0], startLng: measurement.start[1], endLat: measurement.end[0], endLng: measurement.end[1], mode: travelMode });
    const key = params.toString();
    const cached = routeCache.current.get(key);
    if (cached && Date.now() - cached.time < 600000) {
      setRouteState({ status: "ready", route: cached.route });
      return;
    }
    setRouteState({ status: "loading" });
    // Delay avoids duplicate requests during React StrictMode and rapid mode changes.
    const timer = window.setTimeout(() => {
      lastRouteRequest.current = Date.now();
      getUserApi(`/api/routes?${params}`, { signal: controller.signal })
        .then(route => {
          if (controller.signal.aborted) return;
          if (routeCache.current.size >= 20) routeCache.current.clear();
          routeCache.current.set(key, { time: Date.now(), route });
          setRouteState({ status: "ready", route });
        })
        .catch(error => {
          if (!controller.signal.aborted) setRouteState({ status: "error", error: error.message });
        });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [measurement, travelMode, routeAttempt]);
  const [draftStart, setDraftStart] = useState(null);
  const [pendingGpsStart, setPendingGpsStart] = useState(false);
  const [pendingGpsDestination, setPendingGpsDestination] = useState(null);
  const [nearbyAudioEnabled, setNearbyAudioEnabled] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const showAllLocationsRef = useRef(showAllLocations);
  const [radiusInput, setRadiusInput] = useState(String(DEFAULT_PROXIMITY_RADIUS_KM));
  const [proximityRadiusKm, setProximityRadiusKm] = useState(DEFAULT_PROXIMITY_RADIUS_KM);
  const [radiusErrorOpen, setRadiusErrorOpen] = useState(false);
  const proximityRadiusMeters = proximityRadiusKm * 1000;
  const autoPlayedNearestBranch = useRef(false);
  const playedNearbyBranchIds = useRef(new Set());
  const gpsAcquisition = useRef({ active: false, best: null, timer: null, watchId: null });
  const liveGpsWatchId = useRef(null);
  const nearbyAudioQueue = useRef([]);
  const isSpeakingNearby = useRef(false);
  const isPreparingNearby = useRef(false);
  const speakNextNearby = useRef(null);
  const proximityAudioActive = useRef(nearbyAudioEnabled);
  const proximityAudioGeneration = useRef(0);
  const enableAudioAfterGps = useRef(false);
  const mapToastTimer = useRef(null);
  const notificationsSuppressed = useRef(false);
  useEffect(() => {
    if (!navigationActive) return;
    if (!navigator.geolocation) {
      setNavigationStatus("gps");
      setNavigationActive(false);
      setFollowing(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(({ coords, timestamp }) => {
      const fix = { position: [coords.latitude, coords.longitude], accuracy: coords.accuracy, timestamp };
      navigationFix.current = fix;
      setUserPosition(fix);
      savePosition(fix);
      setNavigationStatus(coords.accuracy > 50 ? "weak" : "active");
    }, () => {
      navigationFix.current = null;
      offRouteSince.current = null;
      setNavigationStatus("gps");
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
    return () => { navigator.geolocation.clearWatch(id); navigationFix.current = null; offRouteSince.current = null; };
  }, [navigationActive]);

  useEffect(() => {
    if (!navigationActive || !measurement || routeState.status !== "ready") return;
    const fix = navigationFix.current;
    if (!fix || Date.now() - fix.timestamp > 15000 || fix.accuracy > 50) {
      offRouteSince.current = null;
      return;
    }
    const now = Date.now();
    const threshold = Math.max(travelMode === "walk" ? 35 : 60, fix.accuracy * 2);
    if (distanceToRoute(fix.position, selectedRoute.paths) <= threshold) {
      offRouteSince.current = null;
      return;
    }
    if (offRouteSince.current == null) offRouteSince.current = now;
    if (shouldReroute({ ...fix, paths: selectedRoute.paths, now, lastRequest: lastRouteRequest.current, offRouteSince: offRouteSince.current, mode: travelMode })) {
      lastRouteRequest.current = now;
      offRouteSince.current = null;
      setMeasurement(previous => ({ ...previous, start: fix.position }));
    }
  }, [navigationActive, measurement, routeState, selectedRoute, travelMode, userPosition]);

  useEffect(() => {
    if (!measurement || measureActive || showAllLocations) {
      setNavigationActive(false);
      setFollowing(false);
    }
  }, [measurement, measureActive, showAllLocations]);
  proximityAudioActive.current = nearbyAudioEnabled;
  showAllLocationsRef.current = showAllLocations;

  useEffect(() => {
    if (!userPosition) return;
    if (pendingGpsDestination) {
      setMeasurement({ start: userPosition.position, end: pendingGpsDestination });
      setMeasureActive(false);
      setPendingGpsDestination(null);
    } else if (pendingGpsStart) {
      setDraftStart(userPosition.position);
      setMeasureActive(true);
    } else return;
    setPendingGpsStart(false);
  }, [pendingGpsDestination, pendingGpsStart, userPosition]);

  const showMapToast = useCallback(message => {
    if (notificationsSuppressed.current) return;
    setMapToast({ id: Date.now(), message });
    if (mapToastTimer.current) window.clearTimeout(mapToastTimer.current);
    mapToastTimer.current = window.setTimeout(() => {
      setMapToast(null);
      mapToastTimer.current = null;
    }, 1500);
  }, []);

  const clearMapToast = useCallback(() => {
    if (mapToastTimer.current) window.clearTimeout(mapToastTimer.current);
    mapToastTimer.current = null;
    setMapToast(null);
  }, []);

  const showAllAndStop = useCallback(() => {
    notificationsSuppressed.current = true;
    showAllLocationsRef.current = true;
    setShowAllLocations(true);
    setSearchTerm("");
    setNearbyAudioEnabled(false);
    proximityAudioGeneration.current += 1;
    nearbyAudioQueue.current = [];
    isSpeakingNearby.current = false;
    isPreparingNearby.current = false;
    enableAudioAfterGps.current = false;
    window.speechSynthesis?.cancel();
    clearMapToast();
  }, [clearMapToast]);

  useEffect(() => {
    window.addEventListener("saigoncoffee:show-all-stores", showAllAndStop);
    return () => window.removeEventListener("saigoncoffee:show-all-stores", showAllAndStop);
  }, [showAllAndStop]);

  const startLiveGpsTracking = () => {
    if (!navigator.geolocation || liveGpsWatchId.current != null) return;
    liveGpsWatchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const next = {
          position: [coords.latitude, coords.longitude],
          accuracy: Number.isFinite(coords.accuracy) && coords.accuracy > 0 ? coords.accuracy : 1000,
        };
        setUserPosition(next);
        savePosition(next);
      },
      error => {
        const key = error.code === error.PERMISSION_DENIED
          ? "map.denied"
          : error.code === error.POSITION_UNAVAILABLE
            ? "map.unavailable"
            : "map.timeout";
        showMapToast(t(key));
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 3000 },
    );
  };

  const finishGpsAcquisition = () => {
    const acquisition = gpsAcquisition.current;
    if (!acquisition.active) return;
    acquisition.active = false;
    if (acquisition.timer) window.clearTimeout(acquisition.timer);
    if (acquisition.watchId != null) navigator.geolocation?.clearWatch(acquisition.watchId);
    acquisition.timer = null;
    acquisition.watchId = null;
    const best = acquisition.best;
    if (!best) return;
    startLiveGpsTracking();
    setUserPosition(best);
    savePosition(best);
    if (!showAllLocationsRef.current) {
      setMapCenter(best.position);
      setMapZoom(16);
    }
    showMapToast(t("map.located", { accuracy: Math.round(best.accuracy) }));
    setIsLocating(false);
    if (enableAudioAfterGps.current) {
      enableAudioAfterGps.current = false;
      setNearbyAudioEnabled(true);
    }
  };

  const updateUserPosition = coords => {
    const next = {
      position: [coords.latitude, coords.longitude],
      accuracy: Number.isFinite(coords.accuracy) && coords.accuracy > 0 ? coords.accuracy : 1000,
    };
    const acquisition = gpsAcquisition.current;
    if (acquisition.active) {
      const isFirstFix = !acquisition.best;
      if (!acquisition.best || next.accuracy < acquisition.best.accuracy) {
        acquisition.best = next;
        setUserPosition(next);
        savePosition(next);
        if (!showAllLocationsRef.current) {
          setMapCenter(next.position);
          setMapZoom(16);
        }
      }
      if (isFirstFix) showMapToast(t("map.located", { accuracy: Math.round(acquisition.best.accuracy) }));
      if (!acquisition.timer) acquisition.timer = window.setTimeout(finishGpsAcquisition, 3000);
      return acquisition.best;
    }
    setUserPosition(next);
    savePosition(next);
    return next;
  };

  useEffect(() => () => {
    const acquisition = gpsAcquisition.current;
    if (acquisition.timer) window.clearTimeout(acquisition.timer);
    if (acquisition.watchId != null) navigator.geolocation?.clearWatch(acquisition.watchId);
    if (liveGpsWatchId.current != null) navigator.geolocation?.clearWatch(liveGpsWatchId.current);
    if (mapToastTimer.current) window.clearTimeout(mapToastTimer.current);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/branches", { signal: controller.signal })
      .then(rows => { if (Array.isArray(rows)) setLocations(rows); })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLocations([]);
        setCatalogLoadError(true);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/brands", { signal: controller.signal })
      .then(rows => { if (Array.isArray(rows)) setBrandCatalog(rows); })
      .catch(() => {
        if (controller.signal.aborted) return;
        setBrandCatalog([]);
        setCatalogLoadError(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => () => {
    descriptionTranslationControllers.current.forEach(controller => controller.abort());
  }, []);

  const translateBrandDescription = useCallback(brand => {
    if (!brand?.description?.trim() || !brand.id) return;
    const cacheKey = `${brand.id}:${languageCode}:${brand.description}`;
    const cached = descriptionTranslationCache.current.get(cacheKey);
    if (cached) {
      setDescriptionTranslations(previous => ({ ...previous, [cacheKey]: cached }));
      return;
    }

    const offlineTranslation = getOfflineBrandTranslation(brand, languageCode);
    if (offlineTranslation) {
      const translation = { description: offlineTranslation, status: "ready" };
      descriptionTranslationCache.current.set(cacheKey, translation);
      setDescriptionTranslations(previous => ({ ...previous, [cacheKey]: translation }));
      return;
    }
    if (brandDescriptionLanguage(brand) === languageCode || descriptionTranslationRequests.current.has(cacheKey)) return;

    const controller = new AbortController();
    descriptionTranslationControllers.current.add(controller);
    descriptionTranslationRequests.current.add(cacheKey);
    setDescriptionTranslations(previous => ({
      ...previous,
      [cacheKey]: { description: brand.description, status: "loading" },
    }));

    getUserApi(`/api/localization/brands/${encodeURIComponent(String(brand.id))}/translations/${languageCode}`, {
      method: "POST",
      signal: controller.signal,
    })
      .then(data => {
        if (controller.signal.aborted) return;
        if (typeof data.description !== "string" || !data.description.trim()) {
          throw new Error("Translation response did not include a description.");
        }
        const translation = { description: data.description, status: "ready" };
        descriptionTranslationCache.current.set(cacheKey, translation);
        setDescriptionTranslations(previous => ({ ...previous, [cacheKey]: translation }));
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setDescriptionTranslations(previous => ({
          ...previous,
          [cacheKey]: { description: brand.description, status: "error" },
        }));
        console.error("Could not translate map brand description:", error);
      })
      .finally(() => {
        descriptionTranslationControllers.current.delete(controller);
        descriptionTranslationRequests.current.delete(cacheKey);
      });
  }, [languageCode]);

  useEffect(() => {
    if (activeDescriptionBrand) translateBrandDescription(activeDescriptionBrand);
  }, [activeDescriptionBrand, translateBrandDescription]);

  const proximityText = {
    vi: { enable: "Lấy GPS & tự phát audio", disable: "Tắt audio gần bạn", enabled: "Đã bật. Đang tìm thương hiệu trong bán kính 2 km…", found: names => `Đang đọc mô tả: ${names.join(", ")}`, none: "Chưa có thương hiệu có mô tả trong bán kính 2 km.", gps: "Cho phép GPS để tự phát audio thương hiệu gần bạn.", denied: "Không lấy được GPS. Hãy kiểm tra quyền vị trí của trình duyệt." },
    en: { enable: "Use GPS & auto-play nearby audio", disable: "Disable nearby audio", enabled: "On. Looking for brands within 2 km…", found: names => `Reading: ${names.join(", ")}`, none: "No brands with descriptions found within 2 km.", gps: "Allow GPS to play audio for nearby brands.", denied: "Could not get GPS. Check your browser location permission." },
    ja: { enable: "GPSで近くの音声を自動再生", disable: "近くの音声を無効にする", enabled: "有効です。半径2 km以内のブランドを検索中…", found: names => `再生中: ${names.join(", ")}`, none: "半径2 km以内に説明のあるブランドがありません。", gps: "近くのブランド音声を再生するにはGPSを許可してください。", denied: "GPSを取得できません。ブラウザーの位置情報権限を確認してください。" },
    zh: { enable: "使用 GPS 自动播放附近品牌语音", disable: "关闭附近语音", enabled: "已开启，正在查找 2 公里内的品牌…", found: names => `正在朗读：${names.join("、")}`, none: "2 公里内没有带有介绍的品牌。", gps: "允许 GPS 以自动播放附近品牌介绍。", denied: "无法获取 GPS。请检查浏览器的位置权限。" },
  }[languageCode] || { enable: "Use GPS & auto-play nearby audio", disable: "Disable nearby audio", enabled: "On. Looking for brands within 2 km…", found: names => `Reading: ${names.join(", ")}`, none: "No brands with descriptions found within 2 km.", gps: "Allow GPS to play audio for nearby brands.", denied: "Could not get GPS. Check your browser location permission." };

  const applyRadius = event => {
    event.preventDefault();
    const requestedRadius = Number(radiusInput);
    if (!Number.isFinite(requestedRadius) || requestedRadius <= 0) {
      setRadiusInput(String(DEFAULT_PROXIMITY_RADIUS_KM));
      setProximityRadiusKm(DEFAULT_PROXIMITY_RADIUS_KM);
      setRadiusErrorOpen(true);
      return;
    }
    setProximityRadiusKm(requestedRadius);
    showAllLocationsRef.current = false;
    setShowAllLocations(false);
    notificationsSuppressed.current = false;
    setRadiusInput(String(requestedRadius));
    setRadiusErrorOpen(false);
    if (nearbyAudioEnabled) {
      proximityAudioGeneration.current += 1;
      nearbyAudioQueue.current = [];
      isSpeakingNearby.current = false;
      isPreparingNearby.current = false;
      setNearbyAudioEnabled(false);
      window.speechSynthesis?.cancel();
    }
    const radiusMessage = t("map.appliedRadius", { radius: requestedRadius });
    showMapToast(userPosition ? `${radiusMessage} ${t("map.tapToPlay")}` : radiusMessage);
  };

  useEffect(() => {
    speakNextNearby.current = async () => {
      if (isSpeakingNearby.current || isPreparingNearby.current || !proximityAudioActive.current) return;
      const brand = nearbyAudioQueue.current.shift();
      if (!brand) return;
      if (!brand.description?.trim()) { speakNextNearby.current?.(); return; }
      const generation = proximityAudioGeneration.current;
      const sourceLanguage = brandDescriptionLanguage(brand);
      let speechText = brand.description.trim();
      let voiceLanguage = sourceLanguage;
      isPreparingNearby.current = true;
      if (sourceLanguage !== voiceTargetLanguage) {
        const offlineTranslation = getOfflineBrandTranslation(brand, voiceTargetLanguage);
        if (offlineTranslation) {
          speechText = offlineTranslation;
          voiceLanguage = voiceTargetLanguage;
        } else try {
          const translated = await getUserApi(`/api/localization/brands/${brand.id}/translations/${voiceTargetLanguage}`, { method: "POST" });
          if (translated.description) {
            speechText = translated.description;
            voiceLanguage = voiceTargetLanguage;
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
      let hasFinished = false;
      const finish = () => {
        if (hasFinished) return;
        hasFinished = true;
        isSpeakingNearby.current = false;
        isPreparingNearby.current = false;
        nearbyAudioQueue.current = [];
        setNearbyAudioEnabled(false);
        showMapToast(t("map.tapToPlay"));
      };
      speech.onend = finish;
      speech.onerror = finish;
      isPreparingNearby.current = false;
      isSpeakingNearby.current = true;
      try {
        window.speechSynthesis.speak(speech);
      } catch {
        finish();
      }
    };
  }, [voiceTargetLanguage, fullScreen, showMapToast, t]);

  useEffect(() => {
    if (!nearbyAudioEnabled) return undefined;
    if (!navigator.geolocation || !("speechSynthesis" in window)) {
      showMapToast(proximityText.denied);
      return undefined;
    }
    return () => {
      proximityAudioGeneration.current += 1;
      window.speechSynthesis.cancel();
      nearbyAudioQueue.current = [];
      autoPlayedNearestBranch.current = false;
      playedNearbyBranchIds.current.clear();
      isSpeakingNearby.current = false;
      isPreparingNearby.current = false;
    };
  }, [nearbyAudioEnabled, fullScreen, showMapToast]);

  useEffect(() => {
    proximityAudioGeneration.current += 1;
    window.speechSynthesis?.cancel();
    nearbyAudioQueue.current = [];
    isSpeakingNearby.current = false;
    isPreparingNearby.current = false;
    autoPlayedNearestBranch.current = false;
    playedNearbyBranchIds.current.clear();
  }, [languageCode]);

  useEffect(() => {
    if (!nearbyAudioEnabled || !userPosition || !brandCatalog.length) return;
    if (!fullScreen && autoPlayedNearestBranch.current) return;
    const nearest = locations
      .filter(branch => Number.isFinite(branch.lat) && Number.isFinite(branch.lng))
      .map(branch => ({ branch, distance: distanceMeters(userPosition.position[0], userPosition.position[1], branch.lat, branch.lng) }))
      .filter(item => item.distance <= (fullScreen ? WALKING_AUDIO_RADIUS_METERS : proximityRadiusMeters))
      .sort((a, b) => a.distance - b.distance)[0];
    if (!nearest) {
      showMapToast(proximityText.none.replace("2 km", `${proximityRadiusKm} km`));
      return;
    }
    const branchKey = String(nearest.branch.id);
    if (fullScreen && playedNearbyBranchIds.current.has(branchKey)) return;
    const brandsById = new Map(brandCatalog.map(brand => [String(brand.id), brand]));
    const brand = brandsById.get(String(nearest.branch.brandId));
    if (!brand?.description?.trim()) {
      if (fullScreen) playedNearbyBranchIds.current.add(branchKey);
      showMapToast(proximityText.none.replace("2 km", `${proximityRadiusKm} km`));
      return;
    }
    if (fullScreen) playedNearbyBranchIds.current.add(branchKey);
    else autoPlayedNearestBranch.current = true;
    nearbyAudioQueue.current = [brand];
    const playingMessage = proximityText.found([nearest.branch.name || brand.name]);
    showMapToast(playingMessage);
    speakNextNearby.current?.();
  }, [fullScreen, nearbyAudioEnabled, userPosition, locations, brandCatalog, languageCode, proximityRadiusMeters, proximityRadiusKm, showMapToast]);

  const nearestAudioBranch = fullScreen && userPosition
    ? locations
      .filter(branch => Number.isFinite(branch.lat) && Number.isFinite(branch.lng))
      .map(branch => ({ branch, distance: distanceMeters(userPosition.position[0], userPosition.position[1], branch.lat, branch.lng) }))
      .filter(item => item.distance <= WALKING_AUDIO_RADIUS_METERS)
      .sort((a, b) => a.distance - b.distance)[0]?.branch
    : null;

  const toggleNearbyAudio = () => {
    if (!nearbyAudioEnabled) {
      notificationsSuppressed.current = false;
      if (!navigator.geolocation) { showMapToast(proximityText.denied); return; }
      if (!("speechSynthesis" in window)) { showMapToast(proximityText.denied); return; }
      try {
        const unlockSpeech = new SpeechSynthesisUtterance(" ");
        unlockSpeech.volume = 0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(unlockSpeech);
      } catch { /* Audio can still be enabled on browsers that reject this. */ }
      setNearbyAudioEnabled(true);
      showMapToast(proximityText.gps);
      return;
    }
    setNearbyAudioEnabled(false);
  };
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("vi");
  const nearbyLocationsByDistance = userPosition
    ? locations
      .filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .map(item => ({ ...item, distanceFromUser: distanceMeters(userPosition.position[0], userPosition.position[1], item.lat, item.lng) }))
      .filter(item => item.distanceFromUser <= proximityRadiusMeters)
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
    : [];
  const allLocationsByDistance = userPosition
    ? locations
      .map(item => ({
        ...item,
        distanceFromUser: Number.isFinite(item.lat) && Number.isFinite(item.lng)
          ? distanceMeters(userPosition.position[0], userPosition.position[1], item.lat, item.lng)
          : undefined,
      }))
      .sort((a, b) => (a.distanceFromUser ?? Infinity) - (b.distanceFromUser ?? Infinity))
    : locations;
  const locationsByDistance = (showAllLocations
    ? allLocationsByDistance
    : userPosition ? nearbyLocationsByDistance : locations)
    .filter(item => `${item.name} ${item.brand} ${item.address}`.toLocaleLowerCase("vi").includes(normalizedSearch));
  const nearbyRankById = new Map(nearbyLocationsByDistance.map((item, index) => [item.id, index + 1]));
  const nearestBranchId = nearbyLocationsByDistance[0]?.id;
  const mappedLocations = locationsByDistance.filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));
  const formatDistance = distance => distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`;
  const formatKilometers = distance => `${(distance / 1000).toFixed(distance < 1000 ? 3 : 2)} km`;
  const measureUi = {
    start: t("map.measureStart"),
    next: t("map.measureEnd"),
    pin: t("map.measureDistance"),
    clear: t("map.clear"),
    useGps: t("map.measureUseGps"),
  };
  const navigationStatusText = {
    waiting: t("map.navigationWaiting"),
    active: t("map.navigationActive"),
    weak: t("map.navigationWeakGps"),
    gps: t("map.navigationGpsError"),
  }[navigationStatus] || t("map.navigationWaiting");
  const onMeasureMapPick = point => {
    setNavigationActive(false);
    setFollowing(false);
    if (!draftStart) {
      setDraftStart(point);
    } else {
      setMeasurement({ start: draftStart, end: point });
      setDraftStart(null);
      setMeasureActive(false);
    }
  };
  const beginMeasureFromGps = () => {
    setNavigationActive(false);
    setFollowing(false);
    if (userPosition) {
      setDraftStart(userPosition.position);
      setMeasureActive(true);
      return;
    }
    setPendingGpsStart(true);
    locateMe();
  };
  const measureFromMeTo = destination => {
    mapRef.current?.closePopup();
    clearMapToast();
    setActiveDescriptionBrand(null);
    setShowAllLocations(false);
    showAllLocationsRef.current = false;
    routingPanelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setNavigationActive(false);
    setFollowing(false);
    if (userPosition) {
      setMeasurement({ start: userPosition.position, end: destination });
      setMeasureActive(false);
      setDraftStart(null);
    } else {
      setPendingGpsDestination(destination);
      locateMe();
    }
  };
  const selectLocation = (item) => {
    if (item.lat == null || item.lng == null) return;
    setMapCenter([item.lat, item.lng]);
    setMapZoom(16);
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      showMapToast(t("map.unsupported"));
      return;
    }

    setIsLocating(true);
    showMapToast(t("map.locatingStatus"));
    setUserPosition(null);
    if (gpsAcquisition.current.timer) window.clearTimeout(gpsAcquisition.current.timer);
    if (gpsAcquisition.current.watchId != null) navigator.geolocation.clearWatch(gpsAcquisition.current.watchId);
    gpsAcquisition.current = { active: true, best: null, timer: null, watchId: null };
    autoPlayedNearestBranch.current = false;
    const handleLocationError = error => {
      if (gpsAcquisition.current.best) {
        finishGpsAcquisition();
        return;
      }
      if (!gpsAcquisition.current.active) return;
      gpsAcquisition.current.active = false;
      if (enableAudioAfterGps.current) {
        enableAudioAfterGps.current = false;
        showMapToast(proximityText.denied);
      }
      if (gpsAcquisition.current.watchId != null) navigator.geolocation.clearWatch(gpsAcquisition.current.watchId);
      gpsAcquisition.current.watchId = null;
      const key = error.code === error.PERMISSION_DENIED
        ? "map.denied"
        : error.code === error.POSITION_UNAVAILABLE
          ? "map.unavailable"
          : "map.timeout";
      showMapToast(t(key));
      setIsLocating(false);
      setPendingGpsStart(false);
      setPendingGpsDestination(null);
    };

    gpsAcquisition.current.watchId = navigator.geolocation.watchPosition(
      ({ coords }) => updateUserPosition(coords),
      handleLocationError,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => updateUserPosition(coords),
      handleLocationError,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    if (!enableDistanceMeasure || !routeDestination) return;
    const latitude = Number(routeDestination.latitude);
    const longitude = Number(routeDestination.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return;
    const requestKey = `${routeDestination.name || ""}:${latitude},${longitude}`;
    if (handledRouteDestination.current === requestKey) return;
    handledRouteDestination.current = requestKey;
    setMapCenter([latitude, longitude]);
    setMapZoom(16);
    setShowAllLocations(false);
    showAllLocationsRef.current = false;
    measureFromMeTo([latitude, longitude]);
  }, [enableDistanceMeasure, routeDestination, userPosition]);

  const locateAndEnableNearbyAudio = () => {
    if (!navigator.geolocation || !("speechSynthesis" in window)) {
      clearMapToast();
      showMapToast(proximityText.denied);
      return;
    }
    clearMapToast();
    notificationsSuppressed.current = false;
    showAllLocationsRef.current = false;
    setShowAllLocations(false);
    // iOS Safari only permits speech synthesis after a user gesture. Start a
    // silent utterance here, before GPS/network work moves playback out of the
    // gesture handler; later nearby descriptions can then be queued normally.
    try {
      const unlockSpeech = new SpeechSynthesisUtterance(" ");
      unlockSpeech.volume = 0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(unlockSpeech);
    } catch {
      // Keep GPS usable if a browser rejects the speech unlock attempt.
    }
    enableAudioAfterGps.current = true;
    if (nearbyAudioEnabled) {
      setNearbyAudioEnabled(false);
      window.speechSynthesis.cancel();
    }
    locateMe();
  };

  const resultsPanel = (
        <aside className="store-map__results" aria-label={t("map.results")}>
          <div className="store-map__table-wrap">
            <table className="store-map__table store-map__summary-table">
              <caption>{t("map.totalBranches")}</caption>
              <tbody><tr><th scope="row">{t("map.allLocations")}</th><td>{locations.length}</td></tr></tbody>
            </table>
          </div>
          <div className="store-map__table-wrap">
            <table className="store-map__table store-map__nearby-table">
              <caption>{userPosition && !showAllLocations ? t("map.nearbyBranches", { radius: proximityRadiusKm, count: locationsByDistance.length }) : t("map.allBranches", { count: locationsByDistance.length })}</caption>
              <thead><tr><th scope="col">#</th><th scope="col">{t("map.branch")}</th><th scope="col">{t("map.distance")}</th></tr></thead>
              <tbody>
                {locationsByDistance.length ? locationsByDistance.map((item, index) => (
                  <tr key={item.id} className={userPosition && item.id === nearestBranchId ? "store-map__nearest-row" : undefined}>
                    <td>{userPosition && !fullScreen && !showAllLocations ? nearbyRankById.get(item.id) : index + 1}</td>
                    <td>
                      <button className="store-map__table-select" onClick={() => selectLocation(item)} type="button">{item.name}</button>
                      <LocalizedBranchAddress branchId={item.id} address={item.address} languageCode={languageCode} className="store-map__localized-address" />
                      {userPosition && nearbyAudioEnabled && (fullScreen ? String(item.id) === String(nearestAudioBranch?.id) : item.id === nearestBranchId) && <small className="store-map__audio-note">{t("map.autoPlayAudio")}</small>}
                      {enableDistanceMeasure
                        ? <button className="store-map__table-directions" type="button" onClick={() => measureFromMeTo([item.lat, item.lng])}>{t("map.directions")}</button>
                        : <a className="store-map__table-directions" href={googleDirectionsUrl(item, userPosition)} target="_blank" rel="noopener noreferrer">{t("map.directions")}</a>}
                    </td>
                    <td>{userPosition && Number.isFinite(item.distanceFromUser) ? formatDistance(item.distanceFromUser) : "—"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="store-map__table-empty">{userPosition && !showAllLocations ? t("map.noBranchesWithinRadius", { radius: proximityRadiusKm }) : t("map.empty")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </aside>
  );

  return (
    <section className={`store-map${fullScreen ? " store-map--full-screen" : ""}`} id="store-map" aria-labelledby="store-map-title">
      <div className="store-map__sidebar">
      <div className="store-map__intro">
        <p className="store-map__eyebrow">{t("map.eyebrow")}</p>
        <h1 id="store-map-title">{t("map.title")}</h1>
      </div>
      {catalogLoadError && <p role="alert">{t("map.loadBrandsError")}</p>}

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
      <div className="store-map__action-row">
        {!fullScreen && <button className="store-map__locate" type="button" onClick={locateAndEnableNearbyAudio} disabled={isLocating} aria-label={t("map.locate")}>
          {isLocating ? t("map.locating") : t("map.locate")}
        </button>}
        {(fullScreen || userPosition) && <button className="store-map__nearby-audio" type="button" onClick={toggleNearbyAudio} aria-pressed={nearbyAudioEnabled} aria-label={nearbyAudioEnabled ? proximityText.disable : t("map.listenNearest")} title={nearbyAudioEnabled ? proximityText.disable : t("map.listenNearest")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/></svg>
        </button>}
        <button className="store-map__show-all" type="button" onClick={showAllAndStop} aria-pressed={showAllLocations} aria-label={t("map.showAllBranches")} title={t("map.showAllBranches")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10 5 4h14l2 6M4 10v10h16V10M9 20v-6h6v6"/><path d="M3 10a2.5 2.5 0 0 0 5 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2.5 2.5 0 0 0 5 0"/></svg>
        </button>
        {enableDistanceMeasure && <button className="store-map__measure-pin" type="button" aria-label={measureUi.pin} title={measureUi.pin} aria-pressed={measureActive} onClick={() => {
          if (!measureActive) {
            setMeasureActive(true);
            setDraftStart(null);
          }
          else setMeasureActive(false);
        }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-13a7 7 0 1 0-14 0c0 6.8 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>
        </button>}
        {enableDistanceMeasure && (measureActive || measurement) && <>
          <button type="button" className="store-map__measure-action" aria-label={isLocating ? t("map.locating") : measureUi.useGps} title={isLocating ? t("map.locating") : measureUi.useGps} onClick={beginMeasureFromGps} disabled={isLocating}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg><span>{isLocating ? t("map.locating") : measureUi.useGps}</span>
          </button>
          {(measurement || draftStart) && <button type="button" className="store-map__measure-action" aria-label={measureUi.clear} title={measureUi.clear} onClick={() => { setMeasurement(null); setDraftStart(null); setMeasureActive(false); setPendingGpsStart(false); setPendingGpsDestination(null); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg><span>{measureUi.clear}</span>
          </button>}
        </>}
      </div>
      <form className="store-map__radius-form" onSubmit={applyRadius}>
        <label htmlFor="store-map-radius">{t("map.radiusLabel")}</label>
        <input
          id="store-map-radius"
          type="number"
          step="any"
          value={radiusInput}
          onChange={event => setRadiusInput(event.target.value)}
        />
        <span>km</span>
        <button type="submit">{t("map.applyRadius")}</button>
      </form>
      {mapToast && <div key={mapToast.id} className="store-map__toast" role="status" aria-live="polite">
        <span className="store-map__toast-icon" aria-hidden="true">✓</span>
        <span>{mapToast.message}</span>
        <button type="button" aria-label={t("map.dismiss")} onClick={() => {
          if (mapToastTimer.current) window.clearTimeout(mapToastTimer.current);
          mapToastTimer.current = null;
          setMapToast(null);
        }}>×</button>
      </div>}

      {enableDistanceMeasure && <section ref={routingPanelRef} className="store-map__routing" aria-label={t("map.directionsHeading")}>
        <div className="store-map__travel-modes">
          <button type="button" aria-pressed={travelMode === "motorcycle"} onClick={() => setTravelMode("motorcycle")}>{t("map.motorcycle")}</button>
          <button type="button" aria-pressed={travelMode === "walk"} onClick={() => setTravelMode("walk")}>{t("map.walking")}</button>
        </div>
        {measurement && <div className="store-map__navigation-actions">
          <button type="button" disabled={!navigationActive && routeState.status !== "ready"} aria-pressed={navigationActive} onClick={() => {
            setNavigationActive(active => !active);
            setFollowing(!navigationActive);
            setNavigationStatus("waiting");
            offRouteSince.current = null;
            setShowAllLocations(false);
          }}>{navigationActive ? t("map.stopNavigation") : t("map.startNavigation")}</button>
          {navigationActive && !following && <button type="button" onClick={() => setFollowing(true)}>{t("map.followLocation")}</button>}
          {navigationActive && <small>{navigationStatusText}</small>}
        </div>}
        <div role="status" aria-live="polite">
          {!measurement && (measureActive ? (!draftStart ? t("map.measureChoosePoints") : t("map.measureNextPoint")) : t("map.directionsHint"))}
          {measurement && routeState.status === "loading" && t("map.routeSearching")}
          {measurement && routeState.status === "ready" && <strong>{navigationActive && t("map.calculatedRoute")}{formatDistance(selectedRoute.distanceMeters)} · {Math.max(1, Math.ceil(selectedRoute.durationSeconds / 60))} {t("map.estimatedMinutes")}</strong>}
          {measurement && routeState.status === "error" && <>
            {routeState.error === "routing_not_configured"
              ? t("map.routingNotConfigured")
              : t("map.routeUnavailable")}
            <button type="button" onClick={() => setRouteAttempt(value => value + 1)}>{t("map.retry")}</button>
          </>}
        </div>
        {measurement && routeState.status === "ready" && <div className="store-map__route-options" role="group" aria-label={t("map.chooseRoute")}>
          {routeOptions.map((route, index) => <button key={index} type="button" aria-pressed={route === selectedRoute} onClick={() => selectRoute(index)}>
            <strong>{t("map.routeOption", { number: index + 1 })}{index === 0 && <span className="store-map__shortest">{t("map.shortestRoute")}</span>}</strong>
            <span>{formatDistance(route.distanceMeters)} · {Math.max(1, Math.ceil(route.durationSeconds / 60))} {t("map.estimatedMinutes")}</span>
          </button>)}
          {routeOptions.length === 1 && <small>{t("map.onlyOneRoute")}</small>}
        </div>}
        {measurement && routeState.status === "ready" && <small>Routing © <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> · © OpenStreetMap contributors</small>}
      </section>}
        {fullScreen && resultsPanel}
      </div>
      <div className="store-map__layout">
        {!fullScreen && resultsPanel}


        <MapContainer
          ref={mapRef}
          className={`store-map__canvas${measureActive ? " store-map__canvas--measuring" : ""}`}
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          scrollWheelZoom
        >
          {enableDistanceMeasure && <MapPointPicker enabled={measureActive} onPick={onMeasureMapPick} />}
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <ResizeMap />
          <FitRoute route={!navigationActive && measurement ? selectedRoute : null} />
          <FollowPosition enabled={navigationActive && following && navigationStatus === "active"} position={navigationFix.current?.position} onPause={() => setFollowing(false)} />
          <FitLocations locations={locations} active={showAllLocations} resetCenter={userPosition?.position} />
          <MapControls onLocate={locateAndEnableNearbyAudio} t={t} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedLocations.map((item) => {
            const brandInfo = brandCatalog.find(brand => String(brand.id) === String(item.brandId));
            const descriptionKey = brandInfo ? `${brandInfo.id}:${languageCode}:${brandInfo.description}` : "";
            const descriptionTranslation = descriptionKey ? descriptionTranslations[descriptionKey] : null;
            return <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={coffeeMarkerIcon(item.brandId)}
              riseOnHover
              eventHandlers={{ click: () => setActiveDescriptionBrand(brandInfo) }}
            >
              <Tooltip direction="top" sticky className="coffee-map-tooltip">
                {item.brand || item.name}
              </Tooltip>
              <Popup>
                <strong>{item.brand || item.name}</strong>
                <div className="store-map__popup-details">
                  <strong>{item.name}</strong>
                  <LocalizedBranchAddress branchId={item.id} address={item.address} languageCode={languageCode} className="store-map__localized-address" />
                  {item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}
                  {item.lat != null && item.lng != null && <span>{item.lat.toFixed(6)}, {item.lng.toFixed(6)}</span>}
                  {brandInfo?.description && <>
                    <span>{descriptionTranslation?.description || brandInfo.description}</span>
                    {descriptionTranslation?.status === "loading" && <small role="status">{t("map.translatingDescription")}</small>}
                    {descriptionTranslation?.status === "error" && <small role="status">{t("map.descriptionTranslationUnavailable")}</small>}
                  </>}
                  {brandInfo?.website && <a href={brandInfo.website} target="_blank" rel="noopener noreferrer">{brandInfo.website}</a>}
                </div>
                <a className="store-map__directions" href={googleDirectionsUrl(item, userPosition)} target="_blank" rel="noopener noreferrer">
                  {t("map.directionsGoogle")}
                </a>
                {enableDistanceMeasure && <button type="button" className="store-map__popup-route" onClick={() => measureFromMeTo([item.lat, item.lng])}>{t("map.routeFromMyLocation")}</button>}
              </Popup>
            </Marker>;
          })}
          {enableDistanceMeasure && measurement && <>
            <Marker position={measurement.start} icon={measurementStartIcon}><Popup>{measureUi.start}</Popup></Marker>
            <Marker position={measurement.end} icon={measurementEndIcon}><Popup>{measureUi.next}</Popup></Marker>
            {routeOptions.map((route, index) => route !== selectedRoute && <Polyline key={`alternative-${index}`} positions={route.paths} pathOptions={{ color: "#738396", weight: 6, opacity: 0.7 }} eventHandlers={{ click: () => selectRoute(index) }}>
              <Tooltip sticky>{t("map.routeOption", { number: index + 1 })} · {formatDistance(route.distanceMeters)}</Tooltip>
            </Polyline>)}
            {selectedRoute && <Polyline key={`selected-${selectedRouteIndex}`} positions={selectedRoute.paths} pathOptions={{ color: travelMode === "walk" ? "#315746" : "#d97706", weight: 6, opacity: 1 }} />}
            <Marker
              position={[(measurement.start[0] + measurement.end[0]) / 2, (measurement.start[1] + measurement.end[1]) / 2]}
              icon={distanceLabelAnchorIcon}
              interactive={false}
              keyboard={false}
            >
              <Tooltip permanent direction="center" offset={[0, 0]} className="store-map__measure-tooltip">
                {routeState.status === "ready" ? formatKilometers(selectedRoute.distanceMeters) : t("map.noRoute")}
              </Tooltip>
            </Marker>
          </>}
          {enableDistanceMeasure && measureActive && draftStart && <Marker position={draftStart} icon={measurementStartIcon}><Popup>{measureUi.start}</Popup></Marker>}
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
      {radiusErrorOpen && <div className="store-map__modal-backdrop" role="presentation">
        <section className="store-map__modal" role="alertdialog" aria-modal="true" aria-labelledby="store-map-radius-error-title" aria-describedby="store-map-radius-error-message">
          <h2 id="store-map-radius-error-title">{t("map.radiusErrorTitle")}</h2>
          <p id="store-map-radius-error-message">{t("map.invalidRadius", { radius: DEFAULT_PROXIMITY_RADIUS_KM })}</p>
          <button type="button" autoFocus onClick={() => setRadiusErrorOpen(false)}>{t("map.dismiss")}</button>
        </section>
      </div>}
    </section>
  );
}
