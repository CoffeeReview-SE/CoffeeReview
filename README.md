# ======
# Xay dung he thong thuong mai dien tu thong minh 
# ======

## Chay ung dung va backend

1. Cau hinh `GEMINI_API_KEY` trong `backend/.env`.
2. Mo terminal thu nhat va chay `npm run server`.
3. Mo terminal thu hai va chay `npm run start` de khoi dong Expo.

Backend lang nghe tren cong `3333`. Khi chay Expo o che do LAN, app tu lay host
cua Expo dev server de tao dia chi backend, nen dien thoai va may tinh can cung
mang Wi-Fi. Neu backend duoc host o dia chi khac, tao `.env` tu `.env.example`
va dat `EXPO_PUBLIC_CHAT_API_URL` thanh URL chat day du, gom ca
`/api/chat`; sau do khoi dong lai Expo.
