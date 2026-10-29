import React, { useEffect, useRef, useState } from 'react';
import { trackAudio } from '../analytics/tracking.js';
import { useLanguage } from './LanguageContext.jsx';
import { detailText } from './brandDetailTranslations.js';
import { getSpeechVoice, speechLanguageTag } from './speechVoice.js';

export default function DescriptionSpeech({ brandId, description, languageCode }) {
  const { languageCode: uiLanguage } = useLanguage();
  const dt = (key, values) => detailText(uiLanguage, key, values);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const [error, setError] = useState('');
  const utterance = useRef(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  useEffect(() => () => {
    requestId.current += 1;
    if (utterance.current) { utterance.current.onstart = null; window.speechSynthesis?.cancel(); utterance.current = null; }
  }, [description, brandId, languageCode]);
  useEffect(() => {
    setLoading(false);
    setSpeaking(false);
    setError('');
  }, [description, brandId, languageCode]);
  const read = async () => {
    if (speaking || loading) {
      requestId.current += 1;
      window.speechSynthesis.cancel();
      utterance.current = null;
      setLoading(false);
      setSpeaking(false);
      return;
    }
    const request = ++requestId.current;
    setError('');
    setLoading(true);
    let voice;
    try {
      voice = await getSpeechVoice(languageCode);
    } catch {
      if (request === requestId.current) {
        setLoading(false);
        setError(dt('speechError'));
      }
      return;
    }
    if (request !== requestId.current) return;
    const speech = new SpeechSynthesisUtterance(description);
    speech.lang = speechLanguageTag(languageCode);
    if (voice) speech.voice = voice;
    const eventId = crypto.randomUUID();
    let counted = false;
    speech.onstart = () => {
      if (request !== requestId.current || utterance.current !== speech || counted) return;
      counted = true; setLoading(false); setSpeaking(true);
      trackAudio({ brandId, languageCode, eventId });
    };
    speech.onend = () => { if (request === requestId.current && utterance.current === speech) { setLoading(false); setSpeaking(false); utterance.current = null; } };
    speech.onerror = event => {
      if (request !== requestId.current || utterance.current !== speech) return;
      setLoading(false); setSpeaking(false); utterance.current = null;
      if (!['canceled', 'interrupted'].includes(event.error)) setError(dt('speechError'));
    };
    window.speechSynthesis.cancel();
    utterance.current = speech;
    try {
      window.speechSynthesis.speak(speech);
    } catch {
      utterance.current = null;
      setLoading(false);
      setError(dt('speechError'));
    }
  };
  if (!description || !languageCode) return <p>{dt('noAudio')}</p>;
  return <div className="bd-audio">
    <button className="bd-play" onClick={read} disabled={!supported} aria-pressed={speaking || loading} aria-label={speaking || loading ? dt('stopReading') : dt('readDescription')}>{speaking ? '■' : loading ? '…' : '▶'}</button>
    <span>{supported ? dt('readIn', { language: languageCode.toUpperCase() }) : dt('unsupportedSpeech')}</span>
    {error && <span role="alert">{error}</span>}
  </div>;
}
