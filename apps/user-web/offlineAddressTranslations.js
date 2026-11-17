// Translate address structure while retaining official street and place names.
const words = {
  en: { city: 'Ho Chi Minh City', ward: 'Ward', district: 'District', town: 'Township', county: 'District', street: 'Street', number: 'No.', old: 'former', country: 'Vietnam', residential: 'Residential area', urban: 'Urban area' },
  ja: { city: 'ホーチミン市', ward: '坊', district: '区', town: '町', county: '県', street: '通り', number: '番地', old: '旧', country: 'ベトナム', residential: '住宅地区', urban: '都市地区' },
  zh: { city: '胡志明市', ward: '坊', district: '郡', town: '镇', county: '县', street: '街', number: '门牌号', old: '原', country: '越南', residential: '住宅区', urban: '城区' },
};

export function getOfflineAddressTranslation(address, languageCode) {
  const w = words[languageCode];
  if (!w || !address?.trim()) return null;
  let result = address;
  const replace = (pattern, value) => { result = result.replace(pattern, value); };
  replace(/Thành phố Hồ Chí Minh|TP\.?\s*Hồ Chí Minh|TP\.?\s*HCM|Ho Chi Minh City|Hồ Chí Minh/giu, w.city);
  replace(/Thủ Đức City/giu, languageCode === 'en' ? 'Thu Duc City' : `Thủ Đức${languageCode === 'ja' ? '市' : '市'}`);
  for (const [pattern, key] of [
    [/Phường\s*|\bP\.\s*(?=\d)/giu, 'ward'],
    [/Quận\s*|\bQ\.\s*(?=\d)|\bDistrict\s+/giu, 'district'],
    [/Huyện\s*/giu, 'county'], [/Thị trấn\s*/giu, 'town'],
    [/Đường\s+|Đ\.\s+/gu, 'street'], [/Số\s+(?=\d)/giu, 'number'],
    [/Khu dân cư/giu, 'residential'], [/Khu đô thị/giu, 'urban'],
    [/Việt Nam|\bVietnam\b/giu, 'country'], [/\bcũ(?=\s*\))/giu, 'old'],
    [/\bWard\b/giu, 'ward'],
  ]) replace(pattern, `${w[key]} `);
  return result.replace(/\s+([,)])/g, '$1').trim();
}
