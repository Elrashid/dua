# دعاء الميت ومناسك العمرة — Duʿāʾ & ʿUmrah PWA

تطبيق ويب لدعاء الميت كاملاً ومناسك العمرة (الطواف، السعي، الأذكار، والتسبيح). يعمل دون إنترنت،
ويمكن **تثبيته** على الجوال أو سطح المكتب كتطبيق مستقل.

A fast, offline-first, installable PWA for the Islamic prayer for the deceased and the
ʿUmrah rituals. Arabic, right-to-left, works without an internet connection after the first load.

## ما الجديد في هذا الإصدار / What changed

كان التطبيق سابقاً ملف HTML واحد ضخم (‏~۳۰۰ كيلوبايت). الآن قُسِّم إلى **وحدات JavaScript (ES modules)**
وملفات منفصلة لتحميلٍ أسرع وتخزينٍ أفضل في الذاكرة المؤقتة، مع إضافة **خيار التثبيت** و**النشر على GitHub Pages**.

The original single ~300 KB HTML file was split into cacheable ES modules and separate assets,
turned into an installable PWA, and wired up for GitHub Pages deployment.

## البنية / Project structure

```
index.html                     # هيكل الصفحة (HTML shell)
manifest.webmanifest           # بيان تطبيق الويب (PWA manifest)
sw.js                          # عامل الخدمة — العمل دون إنترنت + التحديثات
version.json                   # هاش البناء (للتحقّق من التحديثات)
build.mjs                      # حقن هاش git وبناء ./dist
css/
  fonts.css                    # @font-face لخطّ Amiri المُستضاف محلياً
  styles.css                   # كل التنسيقات
fonts/                         # ملفات خطّ Amiri (woff2) — للعمل دون إنترنت
js/
  app.js                       # منطق التطبيق (Vue app) — ES module
  data.js                      # نصوص الأدعية (export const DATA)
  cats.js                      # تصنيفات الأدعية (export const CATS)
  vendor/
    vue.global.prod.js         # مكتبة Vue 3.5.35 (global build, مخزّنة محلياً)
icons/                         # أيقونات التطبيق (192 / 512 / maskable)
```

`index.html` loads Vue as a classic global script, then loads `js/app.js` as a `type="module"`
which imports `DATA` and `CATS`. Splitting the large data and library into separate files lets the
browser (and the service worker) cache each piece independently, so repeat visits load instantly.

## لماذا أصبح أسرع / Why it loads faster

- **Service worker (`sw.js`)** يخزّن غلاف التطبيق ويخدمه من الذاكرة المؤقتة أولاً — فتحٌ فوري وعملٌ دون إنترنت.
- **وحدات منفصلة** قابلة للتخزين المؤقت لكلٍّ منها على حدة (Vue الكبيرة ونصوص الأدعية لا تُعاد تنزيلها).
- الأنماط (CSS) في ملف منفصل قابل للتخزين المؤقت.

## يعمل دون إنترنت 100% / Fully offline

- خطّ **Amiri** مُستضاف محلياً في `fonts/` (لا اتصال بـ Google Fonts) — لا توجد أي طلبات خارجية إطلاقاً.
- عامل الخدمة يخزّن كل ملفات التطبيق مسبقاً، فيعمل التطبيق كاملاً بلا شبكة بعد أوّل فتح.

The Amiri font is self-hosted under `fonts/`, so the app makes **zero external network
requests** — verified offline (load the page, disconnect, reload: it still renders fully).

## التحديثات وكسر التخزين المؤقت / Updates & cache-busting

- يُحقَن **هاش git** للبناء كـ `?v=<hash>` على كل عناوين JS/CSS، ويُدمج في اسم مخزن عامل الخدمة.
  أيّ نشرٍ جديد يحمل هاشاً مختلفاً، فلا يَخدم المتصفّح أبداً نسخةً قديمة.
- زرّ **«↻ تحقّق من التحديثات»** في الإعدادات يسأل الخادم عن إصدارٍ أحدث؛ وعند توفّره يظهر
  زرّ **«🔄 تحديثٌ متوفّر»** الذي يُفعّل عامل الخدمة الجديد ويُعيد التحميل.

A 12-char git hash is injected as `?v=<hash>` on every JS/CSS URL and baked into the
service-worker cache name, so a new commit never serves stale client code. The in-app
**"check for updates"** button calls `registration.update()` and compares `version.json`;
when a newer build exists, an **"update now"** button activates the waiting worker
(`SKIP_WAITING`) and reloads.

## البناء / Build

`node build.mjs` ينسخ الموقع إلى `./dist` ويستبدل الرمز `__BUILD_HASH__` بهاش git الحالي،
ويكتب `version.json`. شغّل البناء ثم قدّم مجلّد `dist`. (يُشغّل سير عمل GitHub Pages هذا تلقائياً.)

`node build.mjs` copies the site into `./dist`, replaces the `__BUILD_HASH__` token with the
current git hash, and writes `version.json`. The Pages workflow runs this automatically and
publishes `./dist`. During local dev (without building) the token stays literal and the app
still works — it just skips real cache-busting.

## التثبيت / Install

- على **أندرويد / كروم / إيدج**: يظهر زر «📲 تثبيت التطبيق على الجهاز» داخل الإعدادات (⚙)، أو من قائمة المتصفّح «تثبيت التطبيق».
- على **iOS / Safari**: شارك ← «أضِف إلى الشاشة الرئيسية».

The in-app install button appears (in Settings ⚙) once the browser fires `beforeinstallprompt`.

## التشغيل محلياً / Run locally

يجب تقديم الملفات عبر خادم (وحدات ES وعامل الخدمة لا تعمل عبر `file://`):

ES modules and the service worker require an HTTP origin (they do **not** work from `file://`):

```bash
python3 -m http.server 8099
# ثم افتح / then open  http://127.0.0.1:8099/
```

## النشر على GitHub Pages / Deployment

يوجد سير عمل جاهز في `.github/workflows/deploy-pages.yml` ينشر الموقع تلقائياً عند الدفع.

A workflow at `.github/workflows/deploy-pages.yml` deploys the site automatically on push.

1. في مستودع GitHub: **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
2. ادفع التغييرات (أو شغّل سير العمل يدوياً من تبويب **Actions**).
3. سيُنشر الموقع على `https://<user>.github.io/<repo>/`.

The workflow runs `configure-pages` (with `enablement: true`), uploads the repository root as the
Pages artifact, and deploys it. If the `github-pages` environment is restricted to the default
branch, merge this branch first or adjust the environment's deployment-branch rule.

## الحقوق / License

وقفٌ لكل مسلم — صدقةٌ جارية، يجوز نشره ومشاركته مجاناً دون مقابل.
الدعاء: صهيب الرشيد — البرمجة: محمد الرشيد.
