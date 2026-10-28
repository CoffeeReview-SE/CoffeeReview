import { getLanguageDictionaryCoverage } from "../contexts/LanguageProvider.jsx";
import { getBrandDetailsI18nCoverage } from "./brandDetailsI18n.js";
import { getOfflineAddressTranslationCoverage } from "./addressTranslationsOffline.js";
import { getOfflineBrandTranslationCoverage } from "./brandTranslationsOffline.js";

// Gom các kiểm tra nội dung dịch
export function getI18nCoverageReport() {
  return {
    interface: getLanguageDictionaryCoverage(),
    brandDetails: getBrandDetailsI18nCoverage(),
    offlineBrands: getOfflineBrandTranslationCoverage(),
    offlineAddresses: getOfflineAddressTranslationCoverage(),
  };
}
