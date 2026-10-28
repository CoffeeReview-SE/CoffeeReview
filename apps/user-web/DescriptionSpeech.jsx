import React, { useEffect, useRef, useState } from 'react';
import { trackAudio } from '../analytics/tracking.js';
import { useLanguage } from './LanguageContext.jsx';
import { detailText } from './brandDetailTranslations.js';

export default function DescriptionSpeech({ brandId, description, languageCode }) {
  const { languageCode: uiLanguage } = useLanguage();
  const dt = (key, values) => detailText(uiLanguage, key, values);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const utterance = useRef(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  useEffect(() => () => {
    if (utterance.current) { utterance.current.onstart = null; window.speechSynthesis?.cancel(); utterance.current = null; }
  }, [description, brandId, languageCode]);
  const read = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    setError('');
    const speech = new SpeechSynthesisUtterance(description);
    speech.lang = languageCode;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(languageCode.toLowerCase()));
    if (voice) speech.voice = voice;
    const eventId = crypto.randomUUID();
    let counted = false;
    speech.onstart = () => {
      if (utterance.current !== speech || counted) return;
      counted = true; setSpeaking(true);
      trackAudio({ brandId, languageCode, eventId });
    };
    speech.onend = () => { if (utterance.current === speech) { setSpeaking(false); utterance.current = null; } };
    speech.onerror = event => {
      if (utterance.current !== speech) return;
      setSpeaking(false); utterance.current = null;
      if (!['canceled', 'interrupted'].includes(event.error)) setError(dt('speechError'));
    };
    window.speechSynthesis.cancel();
    utterance.current = speech;
    window.speechSynthesis.speak(speech);
  };
  if (!description || !languageCode) return <p>{dt('noAudio')}</p>;
  return <div className="bd-audio">
    <button className="bd-play" onClick={read} disabled={!supported} aria-label={speaking ? dt('stopReading') : dt('readDescription')}>{speaking ? '■' : '▶'}</button>
    <span>{supported ? dt('readIn', { language: languageCode.toUpperCase() }) : dt('unsupportedSpeech')}</span>
    {error && <span role="alert">{error}</span>}
  </div>;
}
