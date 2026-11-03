# IZO PLUS — yakuniy tekshiruv hisoboti

Sana: 2026-11-03
Branch: `arena/e0e08ca7-faxridin`

## Avtomatik tekshiruvlar

| Tekshiruv | Natija |
| --- | --- |
| `npm run lint` | 0 xato |
| `npm run typecheck` | 0 xato |
| `npm test` | 61/61 unit test o‘tdi |
| `npm run build` | Production build muvaffaqiyatli |
| `npm run test:e2e` | 26/26 faol E2E test o‘tdi; 4 ta dublikat/mobilga tegishli bo‘lmagan test ataylab skip qilindi |
| `npm audit --omit=dev` | Runtime bog‘liqliklarda 0 ta zaiflik |

E2E proyektleri: desktop Chromium 1440×1000 va mobil Chromium 390×844. Responsive test 320, 375, 390, 768, 1024 va 1440 px kengliklarni qamrab oldi.

## Qamrab olingan ssenariylar

- Bosh sahifa, SEO title/description, Open Graph, favicon, robots va 404.
- Aynan 3 ta mahsulot, 6 ta ishlab chiqarish bosqichi, 6 ta afzallik, 7 ta qo‘llanilish kartasi.
- Qidiruv, filter, dropdown, 3D/WebGL, login/admin elementlari yo‘q.
- Oq va qora penaplast uchun barcha 8 ta zichlik va 11 ta qalinlik tugmasi bosib tekshirildi.
- Narxlar: 7=$32, 10=$40, 12=$50, 14=$62, 15=$67, 16=$71, 18=$79, 20=$87.
- Maydalangan penaplast: 10/50/100 kg presetlari va $0.70/kg hisob-kitobi.
- Noto‘g‘ri miqdor, manfiy qiymat, kasr kg, diapazon va katalog varyantlari rad etildi.
- Buyurtma formasi: majburiy maydonlar, telefon formati, izoh chegarasi.
- Loading, success, error, retry va manual Telegram holatlari.
- Barcha navbar/footer anchorlari, mobil menyu, Escape, modal fokus qulfi va fokusni qaytarish.
- Barcha lokal rasmlar yuklandi; gorizontal overflow aniqlanmadi.
- Server API: noto‘g‘ri payload, origin, content-type, katta body va rate limit.

## Muhim operatsion eslatma

Telegram Bot API adapteri server tomonda yozilgan va mock API bilan tekshirilgan. Jonli Telegram xabari yuborilmadi, chunki muhitda haqiqiy `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` berilmagan.

Previewda buyurtma “yuborildi” deb soxta ko‘rsatilmaydi. Bot sozlanmaganida mijoz tayyor buyurtma matnini nusxalab, `https://t.me/penaplast_uz` ga o‘zi yuboradi. Avtomatik yuborishni ishga tushirish uchun `README.md` dagi server env qadamlarini bajaring va bitta kelishilgan test buyurtmasi bilan jonli tekshiring.

## Vizual izoh

Zavod/mahsulot/qo‘llanilish rasmlari illustrativ AI vizuallari; qadoqlash kartasi original SVG. Ular haqiqiy IZO PLUS sexi yoki mahsulot partiyasi fotosurati deb da’vo qilinmaydi.
