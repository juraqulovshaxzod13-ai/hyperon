# HyperOn Marketplace

## 1. Kompyuteringizda sinab ko'rish

1. [Node.js](https://nodejs.org) o'rnatilgan bo'lishi kerak (18-versiya yoki undan yuqori).
2. Shu papkani terminalda oching va quyidagilarni ishga tushiring:

```bash
npm install
npm run dev
```

3. Terminalda ko'rsatilgan manzilni (odatda `http://localhost:5173`) brauzerda oching.

## 2. Netlify'ga joylashtirish (bepul)

### A usul — GitHub orqali (tavsiya etiladi)

1. Shu papkadagi barcha fayllarni yangi GitHub repositoriyaga yuklang.
2. [netlify.com](https://netlify.com) saytida ro'yxatdan o'ting, "Add new site" → "Import an existing project" tugmasini bosing.
3. GitHub akkauntingizni ulang va shu repositoriyani tanlang.
4. Netlify build sozlamalarini avtomatik aniqlaydi (`netlify.toml` fayli mavjud: build buyrug'i `npm run build`, natija papkasi `dist`).
5. "Deploy site" tugmasini bosing — bir necha daqiqada sayt tayyor bo'ladi.

### B usul — Drag & Drop (eng tez, GitHub shart emas)

1. Terminalda shu buyruqlarni ishga tushiring:

```bash
npm install
npm run build
```

2. Shu jarayondan keyin paydo bo'lgan `dist` papkasini [netlify.com/drop](https://app.netlify.com/drop) sahifasiga sudrab tashlang.
3. Sayt bir necha soniyada tayyor bo'ladi va sizga havola beriladi.

## Ma'lumotlar qanday saqlanadi?

Mahsulotlar ro'yxati **Supabase** (umumiy, markazlashtirilgan ma'lumotlar bazasi) da saqlanadi. Bu shuni bildiradiki:
- Admin panelda qo'shgan/o'zgartirgan/o'chirgan mahsulot — saytni ochgan **HAR BIR** foydalanuvchida bir xil ko'rinadi.
- Ma'lumotlar brauzer tozalansa ham yo'qolmaydi, chunki bulutda (Supabase serverida) saqlanadi.

### Muhim: `.env` faylini sozlash

Loyiha papkasida `.env` fayli bo'lishi kerak (u `.env.example`dan nusxa ko'chirib, o'z qiymatlaringiz bilan to'ldiriladi):

```
VITE_SUPABASE_URL=https://sizning-loyihangiz.supabase.co
VITE_SUPABASE_ANON_KEY=sizning-publishable-kalitingiz
```

Bu qiymatlarni Supabase loyihangizda **Settings → API Keys** bo'limidan olasiz (Project URL va Publishable key).

**Diqqat:** `.env` fayli `.gitignore`da ko'rsatilgan, ya'ni u GitHub'ga yuklanmaydi (xavfsizlik uchun standart amaliyot). Shuning uchun Netlify'da saytni build qilishdan oldin, muhit o'zgaruvchilarini **Netlify sozlamalarida qo'lda kiritish** kerak:

1. Netlify saytida loyihangizga kiring
2. **Site configuration → Environment variables** bo'limiga o'ting
3. **"Add a variable"** tugmasini bosing va ikkitasini alohida qo'shing:
   - Key: `VITE_SUPABASE_URL`, Value: (sizning Supabase URL'ingiz)
   - Key: `VITE_SUPABASE_ANON_KEY`, Value: (sizning Publishable kalitingiz)
4. **"Save"**, so'ngra **"Deploy site"** bo'limidan saytni qayta deploy qiling (**"Trigger deploy" → "Deploy site"**)

## Admin panelga kirish

Logotipni ("HyperOn" yozuvini) 5 marta ketma-ket bosing — admin login oynasi chiqadi.
Standart parol: `hyperon2026` (buni `src/HyperOnMarketplace.jsx` faylidagi `ADMIN_PASSWORD` o'zgaruvchisidan o'zgartirishingiz mumkin).

## AI Stilist funksiyasi

Bu funksiya (mahsulotlardan AI yordamida "look" yig'ish) Claude API'ga so'rov yuboradi. Xavfsizlik sababli, API kalitni brauzer kodida saqlab bo'lmaydi — shuning uchun bu funksiya ishlashi uchun alohida backend (server) kerak bo'ladi:

1. Oddiy serverless funksiya yozing (masalan, Netlify Functions yoki Vercel Functions), u sizning Anthropic API kalitingizni xavfsiz saqlab, so'rovlarni Claude API'ga yo'naltiradi.
2. `.env` faylida `VITE_AI_PROXY_URL` o'zgaruvchisiga o'sha funksiya manzilini yozing.

Agar bu qadamda yordam kerak bo'lsa (masalan, Netlify Functions kodini yozib berish), so'rang — men tayyorlab beraman.
