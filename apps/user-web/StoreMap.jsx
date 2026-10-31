import React, { useCallback, useEffect, useRef, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useLanguage } from "./LanguageContext.jsx";
import { brandDescriptionLanguage, getUserApi } from "./api.js";
import { trackAudio } from "../analytics/tracking.js";
import { getSpeechVoice, speechLanguageTag } from "./speechVoice.js";
import { getOfflineBrandTranslation } from "./offlineBrandTranslations.js";
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

export default function StoreMap({ fullScreen = false }) {
  const { t, languageCode } = useLanguage();
  const voiceTargetLanguage = languageCode;
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState([]);
  const [brandCatalog, setBrandCatalog] = useState([]);
  const [userPosition, setUserPosition] = useState(() => readSavedPosition());
  const [mapCenter, setMapCenter] = useState(() => readSavedPosition()?.position || [10.7769, 106.7009]);
  const [mapZoom, setMapZoom] = useState(() => readSavedPosition() ? 16 : 12);
  const [mapToast, setMapToast] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
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
  proximityAudioActive.current = nearbyAudioEnabled;
  showAllLocationsRef.current = showAllLocations;

  const showMapToast = useCallback(message => {
    if (notificationsSuppressed.current) return;
    setMapToast({ id: Date.now(), message });
    if (mapToastTimer.current) window.clearTimeout(mapToastTimer.current);
    mapToastTimer.current = window.setTimeout(() => {
      setMapToast(null);
      mapToastTimer.current = null;
    }, 6000);
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
      if (isFirstFix) showMapToast(t("map.waitingForBetterFix", { accuracy: Math.round(acquisition.best.accuracy) }));
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

  return (
    <section className={`store-map${fullScreen ? " store-map--full-screen" : ""}`} id="store-map" aria-labelledby="store-map-title">
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

      <div className="store-map__layout">
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
                      <small>{item.address}</small>
                      {userPosition && nearbyAudioEnabled && (fullScreen ? String(item.id) === String(nearestAudioBranch?.id) : item.id === nearestBranchId) && <small className="store-map__audio-note">{t("map.autoPlayAudio")}</small>}
                      <a className="store-map__table-directions" href={googleDirectionsUrl(item, userPosition)} target="_blank" rel="noopener noreferrer">{t("map.directions")}</a>
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

        <MapContainer
          className="store-map__canvas"
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          scrollWheelZoom
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <FitLocations locations={locations} active={showAllLocations} resetCenter={userPosition?.position} />
          <MapControls onLocate={locateAndEnableNearbyAudio} t={t} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedLocations.map((item) => {
            const brandInfo = brandCatalog.find(brand => String(brand.id) === String(item.brandId));
            return <Marker key={item.id} position={[item.lat, item.lng]} icon={coffeeMarkerIcon(item.brandId)} riseOnHover>
              <Tooltip direction="top" sticky className="coffee-map-tooltip">
                {item.brand || item.name}
              </Tooltip>
              <Popup>
                <strong>{item.brand || item.name}</strong>
                <div className="store-map__popup-details">
                  <strong>{item.name}</strong>
                  <span>{item.address}</span>
                  {item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}
                  {item.lat != null && item.lng != null && <span>{item.lat.toFixed(6)}, {item.lng.toFixed(6)}</span>}
                  {brandInfo?.description && <span>{brandInfo.description}</span>}
                  {brandInfo?.website && <a href={brandInfo.website} target="_blank" rel="noopener noreferrer">{brandInfo.website}</a>}
                </div>
                <a className="store-map__directions" href={googleDirectionsUrl(item, userPosition)} target="_blank" rel="noopener noreferrer">
                  {t("map.directionsGoogle")}
                </a>
              </Popup>
            </Marker>;
          })}
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
