import React, { useEffect, useRef, useState } from "react";
import { trackAudio } from "../analytics/tracking.js";
import { useLanguage } from "./LanguageContext.jsx";
import { getUserApi } from "./api.js";
import { getSpeechVoice, speechLanguageTag } from "./speechVoice.js";

let latestSpeechRequest = 0;

export default function BrandDescriptionAudio({ brand, className, playLabel, stopLabel, renderIcon }) {
  const { languageCode: voiceTargetLanguage } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const utterance = useRef(null);
  const requestId = useRef(0);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const description = brand.description?.trim() || "";
  const sourceLanguage = (brand.descriptionLanguageCode || "vi").toLowerCase();

  useEffect(() => () => {
    requestId.current += 1;
    if (utterance.current) {
      utterance.current.onstart = null;
      window.speechSynthesis?.cancel();
      utterance.current = null;
    }
  }, [brand.id, description, voiceTargetLanguage]);

  useEffect(() => {
    setLoading(false);
    setSpeaking(false);
    setError("");
  }, [brand.id, description, voiceTargetLanguage]);

  const toggleSpeech = async event => {
    event.stopPropagation();
    if (!description || !supported) return;

    if (loading || speaking) {
      latestSpeechRequest += 1;
      requestId.current += 1;
      window.speechSynthesis.cancel();
      utterance.current = null;
      setLoading(false);
      setSpeaking(false);
      return;
    }

    const request = ++requestId.current;
    const speechRequest = ++latestSpeechRequest;
    let text = description;
    let voiceLanguage = sourceLanguage;
    setError("");
    setLoading(true);

    if (sourceLanguage !== voiceTargetLanguage) {
      try {
        const translated = await getUserApi(`/api/localization/brands/${brand.id}/translations/${voiceTargetLanguage}`, { method: "POST" });
        if (request !== requestId.current || speechRequest !== latestSpeechRequest) {
          if (request === requestId.current) setLoading(false);
          return;
        }
        text = translated.description || description;
        if (translated.description) voiceLanguage = voiceTargetLanguage;
      } catch {
        // Use the stored description in its original language if translation is unavailable.
      }
    }

    if (request !== requestId.current || speechRequest !== latestSpeechRequest) {
      if (request === requestId.current) setLoading(false);
      return;
    }
    const voice = await getSpeechVoice(voiceLanguage);
    if (request !== requestId.current || speechRequest !== latestSpeechRequest) {
      if (request === requestId.current) setLoading(false);
      return;
    }
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = speechLanguageTag(voiceLanguage);
    if (voice) speech.voice = voice;
    speech.onstart = () => {
      if (request !== requestId.current) return;
      setLoading(false);
      setSpeaking(true);
      trackAudio({ brandId: Number(brand.id), languageCode: voiceLanguage, eventId: crypto.randomUUID() });
    };
    speech.onend = () => {
      if (request !== requestId.current) return;
      utterance.current = null;
      setLoading(false);
      setSpeaking(false);
    };
    speech.onerror = event => {
      if (request !== requestId.current) return;
      utterance.current = null;
      setLoading(false);
      setSpeaking(false);
      if (!['canceled', 'interrupted'].includes(event.error)) setError("Không phát được giọng đọc trên thiết bị này.");
    };
    window.speechSynthesis.cancel();
    utterance.current = speech;
    try {
      window.speechSynthesis.speak(speech);
    } catch {
      utterance.current = null;
      setLoading(false);
      setSpeaking(false);
      setError("Không phát được giọng đọc trên thiết bị này.");
    }
  };

  const label = loading ? "Đang chuẩn bị giọng đọc" : speaking ? stopLabel : playLabel;
  return (
    <button
      className={className}
      type="button"
      onClick={toggleSpeech}
      disabled={!description || !supported}
      aria-pressed={speaking || loading}
      aria-label={label}
      title={error || (!description ? "Thương hiệu chưa có mô tả" : undefined)}
    >
      {renderIcon ? renderIcon(speaking || loading) : <span aria-hidden="true">{speaking || loading ? "■" : "▶"}</span>}
    </button>
  );
}
