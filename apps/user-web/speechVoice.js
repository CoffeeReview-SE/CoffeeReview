const LANGUAGE_TAGS = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
};

export function speechLanguageTag(languageCode) {
  const normalized = (languageCode || "vi").toLowerCase();
  return LANGUAGE_TAGS[normalized] || normalized;
}

function matchingVoice(voices, languageCode) {
  const requested = speechLanguageTag(languageCode).toLowerCase();
  const base = requested.split("-")[0];
  return voices.find(voice => voice.lang.toLowerCase() === requested)
    || voices.find(voice => voice.lang.toLowerCase().startsWith(`${base}-`))
    || voices.find(voice => voice.lang.toLowerCase() === base);
}

// Some browsers populate their voice list asynchronously after page load.
export function getSpeechVoice(languageCode, timeoutMs = 5000) {
  const synthesis = window.speechSynthesis;
  const immediate = matchingVoice(synthesis.getVoices(), languageCode);
  if (immediate) return Promise.resolve(immediate);

  return new Promise(resolve => {
    let finished = false;
    const finish = voice => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      synthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(voice);
    };
    const onVoicesChanged = () => {
      const voice = matchingVoice(synthesis.getVoices(), languageCode);
      if (voice) finish(voice);
    };
    const timer = setTimeout(() => finish(matchingVoice(synthesis.getVoices(), languageCode)), timeoutMs);
    synthesis.addEventListener("voiceschanged", onVoicesChanged);
    onVoicesChanged();
  });
}
