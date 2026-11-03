# IZO PLUS — dizayn yangilanishi tekshiruv hisoboti

Sana: 2026-11-03

Branch: `arena/e237eac7-faxridin`

## Avtomatik tekshiruvlar

| Tekshiruv | Natija |
| --- | --- |
| `npm run lint` | 0 xato |
| `npm run typecheck` | 0 xato |
| `npm test` | 64/64 unit test o‘tdi |
| `npm run build` | Production build muvaffaqiyatli |
| `npm run test:e2e` | 39 ta faol test o‘tdi; 5 ta platforma/dublikat testi ataylab skip qilindi |
| `npm audit --omit=dev` | Runtime bog‘liqliklarda 0 ta zaiflik |
| `npm audit` | Mavjud development bog‘liqliklarida 16 ta moderate ogohlantirish |

## Qamrab olingan ssenariylar

- 3 ta mahsulotning “Batafsil” bo‘limi, tanlovni yopib-ochganda saqlash, barcha 8 ta zichlik va 11 ta qalinlik.
- Oq/qora plita uchun m³ narx hisobi va maydalangan mahsulot uchun kg narx hisobi.
- Buyurtma oynasi: majburiy maydonlar, telefon, loading/success/error/retry, fokus va Telegram manual fallback.
- Yangi aloqa formasi: ism, telefon, xabar, server validatsiyasi, loading/success/error/retry va manual fallback.
- Ikkala API uchun origin, kontent turi, katta body va rate limiting tekshiruvlari.
- Navbar/footer anchorlari, mobil menyu, Escape, modal fokus qulfi va fokusni qaytarish.
- 320, 375, 390, 768, 1024 va 1440 px kengliklarda gorizontal overflow, rasmlar va modal o‘lchamlari.
- Reduced-motion holatida katalogga asoslangan hisoblagichlarning mavjudligi.

## Operatsion eslatma

Telegram adapteri server tomonda yozilgan va mock API bilan tekshirilgan. Jonli Telegram xabari yuborilmadi: haqiqiy `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` berilmagan. Sozlanmagan holatda mijoz buyurtma yoki murojaat matnini nusxalab, `https://t.me/penaplast_uz` ga o‘zi yuboradi. Avtomatik yuborish uchun `README.md` dagi sozlash qadamlarini bajaring va kelishilgan jonli test o‘tkazing.

Zavod/mahsulot rasmlari illustrativ. Aniq manzil berilmagani uchun xarita sxematik; haqiqiy hamkor logotiplari, sharhlar va korxonaning tasdiqlangan statistikasi mavjud bo‘lganda ularni alohida kiritish kerak.
