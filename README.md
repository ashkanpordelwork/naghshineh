# نقشینه — پروتوتایپ فلوی کتابخانه

پروتوتایپ تعاملی از طراحی فیگما (فایل School، سکشن 343:18792).
سناریو: «علی کتابخانه‌ی مدرسه رو پیدا می‌کنه و درخواست عضویت می‌ده».

- لینک زنده: https://ashkanpordelwork.github.io/naghshineh/
- استک: Vite + React + TypeScript، Framer Motion، `@use-gesture/react`، Zustand (ذخیره در localStorage)، React Router (HashRouter)
- واکنش‌گرا: زیر 768px منوی پایین؛ بالای 768px تب‌ها در هدر و ستون 560px وسط

## اجرا

```bash
npm ci
npm run dev
```

## تست‌ها

اول بیلد و preview را اجرا کنید:

```bash
npm run build
```

```bash
npx vite preview --port 4173
```

بعد در یک ترمینال دیگر:

```bash
node tests/flow.mjs http://localhost:4173/naghshineh/
```

```bash
node tests/shots.mjs http://localhost:4173/naghshineh/ shots
```

- `tests/flow.mjs`: کل سناریو را در 360×800، 1440×900 و حالت reduced-motion کلیک می‌کند.
- `tests/shots.mjs`: از هر ۵ فریم در هر دو اندازه اسکرین‌شات می‌گیرد.

## ساختار

```
src/
  data.ts                 داده‌ی mock و مختصات مکان‌ها (از فیگما)
  store.ts                Zustand: درخواست عضویت، تب، سال (persist) + toast
  pages/                  MapScreen، MapPages (محله/مدرسه)، LibraryPage، ComingSoon
  components/map/         MapView (pan/pinch/wheel/اینرسی)، Places (ساختمان و برچسب)، MapChrome (مینی‌مپ و کنترل‌ها)، PlaceSheet
  components/library/     Leaderboard، Dialogs
  components/layout/      Nav (منوی پایین، هدر دسکتاپ)، Page
  components/ui/          Avatar، Overlay (شیت/مودال)، Toasts، icons
public/assets/map/        لایه‌های نقشه: زمین (webp @2x) و هر ساختمان (png @2x)
public/assets/avatars/    عکس‌های پروفایل
src/assets/icons/         آیکون‌های SVG فیگما
```

## انتشار

ورک‌فلوی `.github/workflows/deploy.yml` روی هر push به `main` بیلد می‌گیرد و روی GitHub Pages منتشر می‌کند.
مقدار `base` در `vite.config.ts` برابر `/naghshineh/` است.
