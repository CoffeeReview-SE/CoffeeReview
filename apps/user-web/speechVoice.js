const LANGUAGE_TAGS = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
};

export function speechLanguageTag(languageCode) {
  const normalized = (languageCode || "vi").toLowerCase();
  const deviceLocale = typeof navigator === "undefined" ? "" : (navigator.language || "").toLowerCase().replace(/_/g, "-");
  if (deviceLocale && deviceLocale.split("-")[0] === normalized.split("-")[0]) return deviceLocale;
  return LANGUAGE_TAGS[normalized] || normalized;
}

function matchingVoice(voices, languageCode) {
  const requested = speechLanguageTag(languageCode).toLowerCase();
  const base = requested.split("-")[0];
  const languageVoices = voices.filter(voice => voice.lang.toLowerCase() === requested)
    .concat(voices.filter(voice => voice.lang.toLowerCase().startsWith(`${base}-`) && voice.lang.toLowerCase() !== requested))
    .concat(voices.filter(voice => voice.lang.toLowerCase() === base));
  const femaleVoiceName = /female|woman|zira|aria|jenny|samantha|victoria|karen|moira|tessa|susan|allison|ava|kyoko|nanami|ting.?ting|huihui|yaoyao|xiaoxiao|xiaoyi|hoai.?my|linh|mai|google us english/i;
  return languageVoices.find(voice => femaleVoiceName.test(voice.name)) || languageVoices[0];
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
