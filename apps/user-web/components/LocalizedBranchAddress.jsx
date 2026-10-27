import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageProvider.jsx';
import { getOfflineAddressTranslation } from '../i18n/addressTranslationsOffline.js';
import { getUserApi } from '../../shared/api/userApi.js';

const translations = new Map();
const pendingTranslations = new Map();

async function translateBranchAddress(branchId, address, languageCode) {
  const key = `${branchId}:${languageCode}:${address}`;
  if (translations.has(key)) return translations.get(key);
  const offline = getOfflineAddressTranslation(address, languageCode);
  if (offline) return offline;

  let request = pendingTranslations.get(key);
  if (!request) {
    request = getUserApi(
      `/api/localization/branches/${encodeURIComponent(String(branchId))}/translations/${encodeURIComponent(languageCode)}`,
      { method: 'POST' },
    )
      .then((result) => {
        if (typeof result.address !== 'string' || !result.address.trim()) {
          throw new Error('The translation response did not contain an address.');
        }
        translations.set(key, result.address);
        return result.address;
      })
      .finally(() => pendingTranslations.delete(key));
    pendingTranslations.set(key, request);
  }
  return request;
}

export default function LocalizedBranchAddress({ branchId, address, languageCode, className }) {
  const ref = useRef(null);
  const { t } = useLanguage();
  const [result, setResult] = useState(null);
  const sourceAddress = address || '';
  const key = `${branchId}:${languageCode}:${sourceAddress}`;

  useEffect(() => {
    let active = true;
    setResult({ key, address: sourceAddress, status: 'idle' });
    if (!branchId || !sourceAddress || languageCode === 'vi')
      return () => {
        active = false;
      };

    const loadTranslation = () => {
      if (active) setResult({ key, address: sourceAddress, status: 'loading' });
      translateBranchAddress(branchId, sourceAddress, languageCode)
        .then((translatedAddress) => {
          if (active) setResult({ key, address: translatedAddress, status: 'done' });
        })
        .catch(() => {
          if (active) setResult({ key, address: sourceAddress, status: 'error' });
        });
    };

    if (typeof IntersectionObserver === 'undefined') {
      loadTranslation();
      return () => {
        active = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadTranslation();
      },
      { threshold: 0.01 },
    );
    if (ref.current) observer.observe(ref.current);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [branchId, key, languageCode, sourceAddress]);

  const currentResult = result?.key === key ? result : null;
  const displayAddress = currentResult?.address ?? sourceAddress;

  return (
    <span ref={ref} className={className}>
      <span>{displayAddress}</span>
      {currentResult?.status === 'loading' && (
        <small role="status">{t('map.translatingAddress')}</small>
      )}
      {currentResult?.status === 'error' && (
        <small role="status">{t('map.addressTranslationUnavailable')}</small>
      )}
    </span>
  );
}
