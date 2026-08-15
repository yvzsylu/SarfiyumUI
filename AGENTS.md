# AGENTS.md — SarfiyumUI (Angular 19 Web)

> Bu dosya, Sarfiyum ekosisteminde çalışan **tüm AI ajanları** (Claude Code, Gemini/Antigravity, Codex vb.) ve insan geliştiriciler için tek kaynak dokümandır.
> `CLAUDE.md` bu dosyaya işaret eder; içerik **sadece burada** tutulur.

---

## 0. DEĞİŞMEZ KURALLAR (Her ajan bunlara uymak zorunda)

1. **Tek doküman kaynağı `AGENTS.md`'dir.** `CLAUDE.md` sadece bu dosyaya yönlendiren bir pointer'dır, içerik barındırmaz. Aynı kural üç repoda da geçerlidir.
2. **Her tamamlanan işten sonra ilgili repo(lar)ın `AGENTS.md` dosyası güncellenir.** Yeni özellik, kaldırılan özellik, değişen mimari, çözülen/eklenen bulgu → dokümana yansır.
3. **Üç repo tek üründür.** Bir tarafta yapılan değişikliğin diğer iki tarafa etkisi *her zaman* değerlendirilir ve cevapta belirtilir:
   - `SarfiyumAPI` → `c:\Users\yvzsy\source\repos\SarfiyumAPI` (.NET 8)
   - `SarfiyumUI` → `c:\Users\yvzsy\OneDrive\Desktop\SarfiyumUI` (Angular 19)
   - `sarfiyum_mobile` → `c:\Users\yvzsy\OneDrive\Desktop\sarfiyum_mobile` (Flutter)
4. **`master`/`main` push = canlıya deploy.** Bu repoya push atmak `SarfiyumAPI` pipeline'ını tetikler ve doğrudan canlıya çıkar. Kullanıcı onayı olmadan push/deploy **yapılmaz**.
5. **Kullanıcı açıkça istemeden kod değiştirilmez.** İnceleme/analiz istendiğinde sadece analiz yapılır.
6. **API sözleşmesi backend'e aittir.** Endpoint/DTO değişimi gerekiyorsa önce `SarfiyumAPI` tarafı, sonra buradaki servis/model güncellenir; ikisi aynı iş kaleminde ele alınır.
7. **Dashboard (`modules/user/dashboard`) performans açısından hassastır.** TV modunda saatlerce açık kalır. Buradaki her değişiklikte change detection maliyeti düşünülür ve nota işlenir.
8. Kullanıcıya görünen tüm metinler **Türkçe**; kod isimleri **İngilizce**.
9. **Yeni bağımlılık eklenmez** (bundle zaten şişkin, `initial` budget 8 MB'a çekilmiş durumda) — gerekiyorsa önce kullanıcıya sorulur.
10. Bu proje **hazır bir admin şablonu (Bootstrap tabanlı) üzerine kurulmuştur.** Kullanılmayan bolca demo kodu vardır (§8). Yeni kod yazarken şablon artıklarını referans alma, mevcut Sarfiyum modüllerini örnek al.

---

## 1. PROJENİN ROLÜ

Sarfiyum'un **web arayüzü**. Üç ayrı deneyimi tek uygulamada barındırır:

| Alan | Rota | Kim |
|---|---|---|
| Landing / tanıtım | `/`, `/privacy-policy`, `/contact` | Herkes (public) |
| SuperAdmin paneli | `/admin/**` | `Admin` |
| Kuyumcu paneli + fiyat ekranı | `/user/**` | `User`, `Viewer` |
| TV / tam ekran fiyat modu | `/tv/user/**` | `User`, `Viewer` |

Prod'da Angular build çıktısı **.NET API container'ının `wwwroot` dizininden** servis edilir (`MapFallbackToFile("index.html")`), yani aynı origin. `environment.prod.ts` içinde `apiUrl = '/api'`.

---

## 2. TEKNİK YAPI

- **Angular 19**, standalone component'ler, `app.config.ts` üzerinden provider yapılandırması.
- **State:** NgRx Store + Effects (`authentication`, `calendar`, `layout`). `layout` state'i `ngrx-store-localstorage` ile localStorage'a senkronlanır.
- **HTTP:** `provideHttpClient(withFetch(), withInterceptors([jwtInterceptor]))`.
- **UI:** Bootstrap 5 + `@ng-bootstrap/ng-bootstrap`, ApexCharts, SweetAlert2 (toast), ngx-toastr, iconify.
- **Realtime:** `@microsoft/signalr`.
- **Token:** JWT, `ngx-cookie-service` ile `_AuthSessionKey` cookie'sinde.

### Klasör düzeni
```
src/app/
  auth/            → login, reset-password
  core/
    guards/        → auth.guard.ts (rol bazlı)
    interceptors/  → jwt.interceptor.ts
    services/      → auth, base-api, branding, crud, table, title, toast
    models/        → price-data, service-result, tenant-category, user
    directive/     → decimal-comma, flatpickr, sortable, swiper, quantity-control, select-form-input
    pipes/         → remaining-days
  layouts/         → admin-layouts, user-layouts, shared (auth-layout, topbar, sidebar, footer), empty-layout
  modules/
    admin/         → dashboard, customer, subscription, users, roles, settings, profile, symbols*, symbol-categories*
    user/          → dashboard, multiplier-settings, categories, tenant-settings, viewers, profile, contact, faqs, help-center, apps/todo*
    shared/        → landing-page, privacy-policy, contact, error-404
  store/           → authentication, calendar, layout
  common/          → menu-meta, admin-menu-meta, user-menu-meta, constants, apexchart.model
```
`*` = ölü/şablon artığı kod (§8).

### tsconfig path alias'ları
`@/*` `@core/*` `@store/*` `@layouts/*` `@component/*` `@common/*` `@helper/*` `@environment/*` `@views/*` `@lib/*`

---

## 3. KİMLİK & YETKİ AKIŞI

```
LoginComponent → NgRx action → AuthenticationEffects → AuthenticationService.login()
   POST /api/auth/login  { username, password, clientSource: 1 }   [X-Skip-Interceptor: true]
   ← ServiceResult<string> (JWT)
   → jwtDecode → User modeli → cookie '_AuthSessionKey' (rememberMe ? 7 gün : session)
```

- **`jwtInterceptor`**: `/auth/login` ve `/auth/reset-password` hariç her isteğe `Authorization: Bearer <token>` ekler.
- **`AuthGuard`**: önce bellekteki `authService.user`, yoksa cookie'den decode eder. Rota `data.role` / `data.roles` ile karşılaştırır; yetkisizse `/user/dashboard`'a atar.
- **`BaseApiService`**: tüm CRUD çağrılarını sarar, `ServiceResult<T>` açar, SweetAlert2 toast gösterir, `data` döndürür. GET'te sessiz kalır.
- **Rol adları frontend'de her zaman küçük harfe çevrilir** (`admin`, `user`, `viewer`).

---

## 4. MEVCUT ÖZELLİKLER (Web — eksiksiz liste)

### 4.1 Public
- **Landing page** (`/`) — tanıtım sayfası, dashboard animasyon videosu içerir.
- **Gizlilik politikası** (`/privacy-policy`), **İletişim** (`/contact`).
- **404** (`/404`), wildcard yönlendirmesi.

### 4.2 Kimlik (`/auth/**`)
- Giriş (kullanıcı adı, şifre, "beni hatırla" → localStorage'a kullanıcı adı).
- Şifre sıfırlama talebi (e-posta ile yeni şifre gönderilir).

### 4.3 SuperAdmin paneli (`/admin/**`)
- **Dashboard** — firma/kullanıcı/abonelik sayaçları, toplam gelir, bekleyen tahsilat, plan & durum dağılım grafikleri, son 6 ay gelir grafiği, ödemesi gecikenler, süresi yaklaşan abonelikler.
- **Müşteriler (Tenant)** — liste, ekle, düzenle, detay (detay içinde: hesap grafiği, işlem geçmişi, son faturalar, puan kartları), aktif/pasif, sil.
- **Abonelikler** — liste, ekle, düzenle, gün ekle/çıkar, sil.
- **Kullanıcılar** — liste, ekle, düzenle, rol atama modal'ı, aktif/pasif, sil.
- **Roller** — liste, ekle, düzenle, sil.
- **Ayarlar** — SMTP ayarları (diğer sekmeler şablon artığı, §8).
- **Profil** — admin profil sayfası.
- **Yardım Merkezi / SSS** — statik içerik.

### 4.4 Kuyumcu paneli (`/user/**`)
- **Dashboard (`/user/dashboard`) — ürünün kalbi**
  - SignalR `GoldHub` bağlantısı; `ReceivePriceSnapshot` (tam liste) + `ReceivePriceDelta` (yalnızca değişenler) ile canlı fiyat akışı. Parçaları `GoldHubService` birleştirir, component her zaman tam listeyi görür.
  - Kategori bazlı 5 liste: Maden, Döviz, Bilezik, Ata & Reşat, Kredi Kartı (`categoryIndex` 1–5).
  - Kategori başlıkları API'den gelen tenant kategori adlarıyla değiştirilir.
  - Fiyat değişiminde yeşil/kırmızı **flash** efekti (400 ms, tek zamanlayıcı ile temizlenir).
  - Component `OnPush` stratejisinde; ürünler `id` ile indekslenir, kategori listeleri aynı nesnelerin referansını tutar.
  - `ShowOnWeb = false` olan ürünler **sunucuda** filtrelenir; istemciye hiç gelmez.
  - **7 hazır tema:** `flat-light`, `flat-dark`, `flat-financial`, `light`, `dark`, `financial`, `custom`.
  - **20 CSS değişkeni üzerinden özel renk düzenleyici** (canlı önizleme + kaydet).
  - **Öğe bazlı font boyutu ve font kalınlığı ayarı** (`data-key` üzerinden, debounce 1.5 sn ile API'ye kaydedilir).
  - Tüm tema/UI ayarları `TenantSetting` üzerinden **DB'de** saklanır (eskiden localStorage'daydı). Viewer kaydedemez.
  - **TV modu** — `/tv/user/dashboard`, `EmptyLayout` + tarayıcı fullscreen. Fullscreen'den çıkınca otomatik normal moda döner.
  - Canlı saat, tenant logosu, `ForceCheckSession` ile başka cihazdan giriş olduğunda anında çıkış.
  - Viewer için token bitiş süresinde otomatik logout timer'ı.
- **Ürün & Çarpan (`/user/multiplier-settings`)** — ürün listesi; ad, kaynak sembol (`SystemCatalog` dropdown'ı), kategori, alış çarpanı, satış çarpanı, makas (addon), aktif/pasif, web/mobil görünürlük; yeni ürün ekleme, silme, sürükle-bırak sıralama, toplu kaydetme. Ondalık girişte virgül desteği (`decimal-comma.directive`).
- **Kategoriler (`/user/category-settings`)** — kategori adlarını değiştirme (ekleme/silme yok).
- **Genel Ayarlar (`/user/tenant-settings`)** — WhatsApp numarası.
- **Kullanıcılar / Viewer (`/user/viewers/**`)** — liste, ekle, düzenle (şifre dahil), aktif/pasif, sil; **viewer'a özel fiyat modal'ı** (`visitor-pricing-modal`): ürün bazında özel alış/satış çarpanı ve makas tanımlama, varsayılana döndürme.
- **Profil (`/user/profile`)** — profil bilgileri, firma logosu yükleme.
- **İletişim / SSS / Yardım Merkezi** — statik destek sayfaları.

---

## 5. YEREL ÇALIŞTIRMA

```bash
npm install --legacy-peer-deps
npm start                    # ng serve → http://localhost:4200
npm run build:prod           # dist/sarfiyum/browser
npm run format               # prettier
```

- `src/environments/environment.ts` → `apiUrl = 'https://localhost:7140/api'` (lokal API).
- `src/environments/environment.prod.ts` → `apiUrl = '/api'`.
- **Docker build sırasında `environment.prod.ts`, `environment.ts` üzerine kopyalanır.** Yani prod build'de `environment.ts` içeriği yok sayılır.

---

## 6. DEPLOY

Bu repoya `master`/`main` push → `.github/workflows/trigger.yml` → `SarfiyumAPI` reposundaki `deploy.yml` workflow'unu `workflow_dispatch` ile tetikler → API repo, bu repoyu `GH_PAT` ile checkout eder, Docker imajı içinde Angular build alır, Docker Hub'a push eder, SSH ile Ubuntu sunucuya deploy eder. Detay: `SarfiyumAPI/AGENTS.md` §5.

---

## 7. BULGULAR — PERFORMANS

| # | Bulgu | Konum | Etki |
|---|---|---|---|
| ~~**W1**~~ | ✅ **2026-08-15'te çözüldü (Adım 6).** Component `ChangeDetectionStrategy.OnPush`'a alındı; ürün başına `detectChanges()` yerine paket sonunda **tek** `markForCheck()` yapılıyor. OnPush'un gerektirdiği yerlere (kategori yüklemesi, saat) `markForCheck` eklendi. Eski açıklama: **Change detection fırtınası.** `updateList()` **her ürün için ayrı ayrı** `cdr.detectChanges()` çağırıyor. ~30 ürün × yayın = **yayın başına 30 tam CD döngüsü**, 728 satırlık bir template üzerinde. Component `OnPush` değil, default stratejide. TV modunda saatlerce açık kalan ekranlarda tarayıcı ısınır/yavaşlar. **Öneri:** `ChangeDetectionStrategy.OnPush` + paket sonunda **tek** `markForCheck()`. ⚠️ **Backend Adım 4 (P1) sonrası hafifledi:** yayın artık saniyede birkaç kez değil en fazla bir kez geliyor, piyasa sakinken hiç gelmiyor. Tek tur içindeki maliyet aynı kaldığı için bulgu duruyor. | `modules/user/dashboard/dashboard.component.ts` | 🟠 Yüksek (eskiden 🔴) |
| ~~**W2**~~ | ✅ **2026-08-15'te çözüldü (Adım 6).** Tek kaynak `itemsById` map'i; `allData` ve kategori listeleri artık **aynı nesnelerin referansını** tutuyor, kopya veri yok. ⚠️ **Bulgu notu düzeltildi:** `allData` "neredeyse hiç kullanılmıyor" deniyordu ama aslında üstteki kayan bant (ticker) onu kullanıyor — silinemezdi, referans listesine çevrildi. | aynı dosya | ✅ |
| ~~**W3**~~ | ✅ **2026-08-15'te çözüldü (Adım 6).** `list.find(...)` yerine `Map<string, DashboardPriceItem>` indeksi — arama O(1). | aynı dosya | ✅ |
| ~~**W4**~~ | ✅ **2026-08-15'te çözüldü (Adım 6).** Ürün başına timer yerine **tek** `flashClearTimer`; her yeni pakette iptal edilip yeniden kuruluyor, temizleme tek `markForCheck` ile bitiyor. `ngOnDestroy`'da da iptal ediliyor. | aynı dosya | ✅ |
| ~~**W5**~~ | ~~**Gizli ürünlerin verisi yine de indiriliyor.**~~ → ✅ **2026-08-15'te çözüldü (Adım 5).** `ShowOnWeb` filtresi artık sunucuda uygulanıyor; dashboard'daki `productVisibilityMap` / `refreshCurrentLists` / `loadProductConfigurations` mantığı tamamen kaldırıldı. Gizli ürünlerin fiyatları tel üzerinden hiç gelmiyor — gizlilik sızıntısı da kapandı. | dashboard | ✅ |
| **W6** | **Bundle şişkin.** `initial` budget **8 MB**'a, `anyComponentStyle` **4 MB**'a çıkarılmış — bunlar normal değil, şablon artığı bağımlılıkların (fullcalendar, jsvectormap, quill, swiper, nouislider, google-maps, dropzone, moment + dayjs) ağırlığından. İlk açılış özellikle mağaza TV'lerinde yavaş. | `angular.json`, `package.json` | 🟠 Yüksek |
| **W7** | `moment` **ve** `dayjs` birlikte bağımlılıkta; ikisi de aynı işi yapıyor. | `package.json` | 🟡 Orta |
| ~~**W8**~~ | ✅ **2026-08-15'te çözüldü (Adım 6).** OnPush sayesinde saat artık tüm ağacı değil yalnızca bu component'i işaretliyor (`markForCheck`), üstelik fiyat akışıyla çakışmıyor. | dashboard | ✅ |

---

## 8. BULGULAR — MİMARİ / KOD KALİTESİ

| # | Bulgu |
|---|---|
| W9 | **`admin/symbols` ve `admin/symbol-categories` modülleri ölü.** Backend'de `Symbol`/`SymbolCategory` entity'leri DbContext'ten kaldırılmış, servis implementasyonu ve DI kaydı yok. Bu ekranlar **var olmayan endpoint'lere** gidiyor. Menüde görünmüyorlar ama rota tanımları duruyor. → Silinmeli. |
| W10 | **Şablon artığı bolca kod:** `modules/user/apps/todo`, `admin/settings` altındaki `category-setting`, `customer-setting`, `general-setting`, `localization-setting`, `review-setting`, `store-setting`, `tax-setting`, `voucher-setting` (sadece `smtp-setting` gerçek); `dashboard/components/{conversions, performance, recent-order, sessions-country, top-pages, state}` (hem admin hem user altında, çoğu statik demo verisi); `components/vector-maps`, `components/ui-examples-list`, `core/data/turkey-data.ts`, `helper/fake-backend`, `store/calendar`. → Ciddi bir temizlik borcu. |
| W11 | **`dashboard.component.ts` 656 satır + `.html` 728 satır.** Tema tanımları, renk düzenleyici, font ayarları, SignalR işleme, kategori mantığı, TV modu, auto-logout hepsi tek component'te. Bölünmeli (`ThemeManagerService`, `PriceStore`, presentational component'ler). |
| W12 | **Kategori eşlemesi `categoryIndex` 1–5 ile hard-coded `switch`.** Kullanıcı 6. bir kategori eklerse `default` dalına düşüp `madenList`'e gider. Şu an kategori ekleme UI'si olmadığı için patlamıyor ama varsayım kırılgan ve backend seed'ine sıkı bağlı. |
| ~~W13~~ | ~~**Ürün görünürlüğü string anahtarla eşleştiriliyor:** `KATEGORİADI_ÜRÜNADI`~~ → ✅ **2026-08-15'te çözüldü (Adım 5).** Sunucu artık `id` (= `TenantProduct.Id`) gönderiyor; `generateUniqueKey` tamamen silindi, `updateList` ve `trackBy` `id` üzerinden çalışıyor. Ürün adı değiştiğinde satır artık ikinci kez eklenmiyor, aynı isimli iki ürün karışmıyor. |
| W14 | **Token cookie'de ve JavaScript'ten okunabiliyor** (`HttpOnly` olamaz, çünkü `jwt-decode` ile içeriği okunuyor). `Secure` / `SameSite` bayrakları da set edilmiyor → XSS riski. |
| W15 | `AuthGuard` **sadece rota girişinde** çalışır; token süresi rota içindeyken dolarsa (Viewer 5 dk) sadece dashboard'daki manuel timer yakalar. Global bir 401 interceptor'ı **yok** — `BaseApiService` 401'i toast olarak gösterip logout yapmıyor. Mobil tarafta bu var, web'de yok. → Adım 8. |
| ~~W23~~ | ~~**Çıkış sadece istemcide yapılıyordu.**~~ → ✅ **2026-08-15'te çözüldü (Adım 3).** `AuthenticationService.logout()` artık `POST /api/auth/logout` çağırıyor. Öncesinde sadece cookie siliniyordu; sunucudaki `UserActiveSession` satırı kalıyor ve **açık kalan SignalR bağlantısı fiyat almaya devam ediyordu** (TV modunda çıkış yapılmış bir ekran canlı fiyat göstermeye devam edebilirdi). Yanıt beklenmiyor — ağ hatası kullanıcıyı uygulamada kilitlemesin diye; oturum yerel olarak her hâlükârda kapatılıyor. |
| W16 | `AuthenticationService.login` içinde `console.log('Gelen Token:', token)` — **JWT konsola basılıyor.** Prod'da kaldırılmalı. |
| W17 | `ThemeSettingsService` `BaseApiService`'i kullanmıyor, doğrudan `HttpClient` ile ham cevap alıyor → hata yönetimi/toast tutarsız. |
| W18 | `bypassSecurityTrustStyle` kullanımı (`getWrapperStyle`) — girdi DB'den gelen kendi ayarımız olduğu için pratikte düşük risk, ama sanitizer bypass'ı işaretlenmeli. |
| W19 | Dashboard `document.querySelector('.dashboard-wrapper')` ile doğrudan DOM'a erişiyor (Angular dışı). `ViewChild`/`Renderer2` tercih edilmeli. |
| W20 | Prod build'de `environment.ts` üzerine `environment.prod.ts` kopyalandığı için, lokal `environment.ts`'e eklenen bir alan prod'da sessizce kaybolur. Tuzak — iki dosya senkron tutulmalı. |
| W21 | `admin.route.ts` altındaki rotalarda **rol koruması yok**; koruma sadece üst seviyedeki `app.routes.ts` → `data: { role: 'admin' }` ile sağlanıyor. Tek katman savunma. |
| W22 | `.spec.ts` dosyaları var ama test yazılmamış (şablondan gelen boş iskeletler). CI'da test adımı yok. |

---

## 9. PLANLANAN İŞ

> 📋 **Yapılan tüm işin konsolide özeti `SarfiyumAPI/AGENTS.md` §10.4'tedir** — altı adımın
> tamamı, kapatılan 33 bulgu, test listesi, kırıcı değişiklik uyarısı ve commit edilmemiş
> dosyalar orada tek yerde toplandı.

**Ortak yol haritası `SarfiyumAPI/AGENTS.md` §10.5'te tutulur.** Nihai hedef bir müşteri branch'inde
**public (girişsiz) dashboard** açmak; kullanıcının kararı, oraya geçmeden önce mevcut hataları ve
performans sorunlarını temizlemek. Bu repoyu ilgilendiren adımlar:

| Adım | Bu repoda ne olacak | Durum |
|---|---|---|
| **5 — API sözleşmesi** | `PriceData`'ya `productId` + `sourceKey` eklenince **W13'ün string anahtar hack'i (`KATEGORİADI_ÜRÜNADI`) kaldırılacak**, görünürlük filtresi sunucuya taşınınca **W5** düşecek | ⏳ Backend'i bekliyor |
| **6 — İstemci performansı** | Dashboard'ın `OnPush`'a geçişi ve tek `markForCheck()` → **W1–W4, W8** | ⏳ |
| **8 — Güvenlik** | **W14** (cookie `Secure`/`SameSite`), **W15** (global 401 interceptor'ı — mobilde var, web'de yok), **W16** (JWT konsola basılıyor) | ⏳ |
| **9 — Temizlik** | **W9** (ölü `admin/symbols`), **W10** (şablon artıkları), **W11** (dashboard bölünmesi), **W6/W7** (bundle) | ⏳ |

Adım 1 ve 2 **tamamlandı** ve bu repoda kod değişikliği gerektirmedi (§10).

> İleride web tarafında da public bir fiyat ekranı istenirse, backend'de yapılacak `PublicPriceHub` + `{tenantId}_Public` grubu bu repoda da doğrudan kullanılabilir. Şimdilik kapsam dışı.

---

## 9.1 KARAR — Otomatik sayfa yenileme EKLENMEYECEK

**Durum (2026-08-15):** Tel üzerindeki yayın formatını değiştiren bir deploy'dan sonra,
o sırada AÇIK olan dashboard sekmeleri "Veri bekleniyor" yazar. Sebep basit: tarayıcıdaki
JavaScript deploy'dan önce yüklenmiştir ve eski olay adını dinler. SignalR yeniden bağlansa
bile aynı eski kodla bağlanır; yeni kodu almanın tek yolu **sayfanın yeniden yüklenmesidir**.
Bu bir veri hatası değildir — sunucu doğru hesaplayıp doğru gönderir, sekmedeki eski kod anlamaz.

**Önerilen ama REDDEDİLEN çözüm:** dashboard'ın periyodik olarak `index.html`'deki bundle
adını kontrol edip değiştiğinde `location.reload()` çağırması.

**Kullanıcının kararı:** eklenmeyecek. Müşteri sayısı az, durum kritik değil ve gerektiğinde
elle giriş yapıp sayfa yenilenebiliyor. Bakımı olmayan bir otomatizma eklemek, çözdüğü
sorundan daha fazla risk taşıyor.

> ⚠️ Ayrıca otomatik yenilemenin görünmez olması **kiosk modu** gerektirir. TV'ler bugün
> Fullscreen API ile (`requestFullscreen`) tam ekrana geçiyor ve sayfa yenilenince tam ekran
> düşer, adres çubuğu görünür. Kiosk modu (`chrome --kiosk --app=https://sarfiyum.com/tv/user/dashboard`)
> bunu çözer ve elektrik kesintisi sonrası TV'nin kendiliğinden doğru sayfayı açmasını da sağlar —
> ama bu da yapılmadı, ihtiyaç doğarsa değerlendirilecek.

**Not:** Bu durum yalnızca yayın formatını değiştiren deploy'larda yaşanır. Olay adları
sabit kaldığı sürece açık sekmeler çalışmaya devam eder.

---

## 10. DEĞİŞİKLİK GÜNLÜĞÜ

| Tarih | Değişiklik |
|---|---|
| 2026-08-14 | İlk oluşturma. Proje derinlemesine incelendi; mevcut özellikler, mimari, performans ve kod kalitesi bulguları kaydedildi. Kod değişikliği yapılmadı. |
| 2026-08-15 | **Canlıya alındı + fiyat gösteriminde bir düzeltme.** Web `master`'a push edildi ve API ile birlikte deploy oldu. ⚠️ **Dashboard'ı ilgilendiren düzeltme:** kuyumcu bir üründe kasıtlı olarak fiyat vermediğinde (özellikle **Kredi Kartı** kategorisi) çarpan 0 oluyor. Backend'de Adım 1'de kaldırılan "0 ise gizle" kuralı yüzünden bu ürünlerin alış hücresinde **"0,00" yazacaktı** — çünkü web `{{ item.bid | number }}` ile render ediyor ve `0` değeri basılıyor, `null` ise hücreyi boş bırakıyor. Backend artık çarpan 0 olduğunda `null` gönderiyor, yalnızca **negatif** sonuçlar görünür kalıyor (gerçek yapılandırma hatası). Bu repoda kod değişikliği gerekmedi. **Not:** piyasa kapalıyken fiyatların sabit görünmesi beklenen davranıştır — yeni veri yoksa backend yayın yapmaz. |
| 2026-08-15 | **Adım 6 — İstemci performansı.** Dashboard `ChangeDetectionStrategy.OnPush`'a geçirildi ve veri işleme yeniden kuruldu: tek kaynak `itemsById` map'i (O(1) arama), kategori listeleri **referans** tutuyor (kopya veri yok), listeler yalnızca **ürün kümesi/sırası değiştiğinde** yeniden kuruluyor — fiyat güncellemeleri nesneleri yerinde değiştirdiği için liste kurulumunu tetiklemiyor. Flash temizleme ürün başına `setTimeout` yerine **tek** zamanlayıcı. Paket başına **tek** `markForCheck` (öncesinde ürün başına `detectChanges`). Çözülen: **W1, W2, W3, W4, W8**. ⚠️ OnPush'a geçerken template dışından state değiştiren tüm noktalar tarandı; `loadCategories` ve saat döngüsüne `markForCheck` eklendi. `ngOnDestroy` artık flash ve debounce timer'larını da temizliyor. Doğrulama: `tsc --noEmit` temiz, `npm run build:prod` **başarılı** (initial 2.55 MB). |
| 2026-08-15 | **Adım 5 — Yeni yayın sözleşmesi. ⚠️ KIRICI DEĞİŞİKLİK, backend ile birlikte deploy edilmeli.** `ReceivePrices` yerine **`ReceivePriceSnapshot`** (tam liste) + **`ReceivePriceDelta`** (yalnızca `{id, bid, ask}`) geldi. `GoldHubService` parçaları birleştirip tüketiciye her zaman tam listeyi veriyor, dashboard delta mantığını hiç bilmiyor. **W13 çözüldü:** `generateUniqueKey` silindi, eşleştirme `id` üzerinden. **W5 çözüldü:** görünürlük filtresi sunucuda, `productVisibilityMap` ve `refreshCurrentLists` kaldırıldı. `description` alanı sözleşmeden çıktığı için template'teki 5 kullanım `symbol`'e çevrildi (zaten ikisi aynı değerdi). **Yeni bulgu W24 aynı gün düzeltildi:** SignalR dinleyicileri `start()` **çözüldükten sonra** kaydediliyordu; sunucu ilk tam listeyi `OnConnectedAsync` içinde gönderdiği için bu mesaj kaçabiliyordu — kayıt `start()` öncesine alındı. Ayrıca `onreconnecting`/`onclose` durumunda yerel liste sıfırlanıyor (kopuklukta kaçırılan delta'lar sapma yaratmasın). Doğrulama: `npx tsc --noEmit` temiz, `npm run build:prod` **başarılı** (initial 2.55 MB). |
| 2026-08-15 | **Adım 4 — Yayın performansı (backend).** Bu repoda **kod değişikliği yapılmadı**, API sözleşmesi de değişmedi. Ancak **davranışta gözle görülür bir fark var:** backend artık her Datshop paketinde değil, **sabit 1 saniyelik aralıklarla** yayın yapıyor. Dashboard'ın aldığı veri hep en güncel olan, sadece daha seyrek geliyor. Pratik sonucu: **flash efekti (400 ms) saniyede birden fazla tetiklenmiyor** ve `updateList()`'in çağrılma sıklığı düşüyor → W1'in (ürün başına `detectChanges()`) canlı etkisi kendiliğinden azaldı. W1 yine de çözülmeli, çünkü asıl maliyet tek bir yayın turu içinde ürün başına tam CD döngüsü çalıştırmak. Fiyat akışı sakinken backend hiç yayın yapmıyor, yani TV modunda boşta duran ekran artık gereksiz CD tetiklemiyor. |
| 2026-08-15 | **Adım 3 — Oturum & hub hattı.** Bu repoda **kod değişikliği yapıldı:** `core/services/auth.service.ts` → `logout()` artık backend'de yeni açılan `POST /api/auth/logout` endpoint'ini çağırıyor (yeni bulgu **W23**, aynı gün çözüldü). Öncesinde çıkış sadece cookie silmekten ibaretti; sunucudaki oturum satırı kalıyor ve açık SignalR bağlantısı fiyat almaya devam ediyordu. `jwtInterceptor` bu endpoint'e token ekliyor (login/reset-password istisnalarına dahil değil), ayrıca istek `subscribe` anında oluşturulduğu için `Authorization` başlığı cookie silinmeden önce okunuyor. Doğrulama: `npx tsc -p tsconfig.app.json --noEmit` **temiz**. Backend tarafında ayrıca oturum doğrulaması önbelleğe alındı (API P5/P6) — bu web'de davranış değişikliği yaratmaz, yalnızca her API çağrısındaki fazladan DB gidiş-dönüşünü kaldırır. |
| 2026-08-15 | **Sunucu bulgusu — logo yükleme 1 MB sınırı.** nginx'te `client_max_body_size` tanımlı olmadığı için varsayılan **1 MB** geçerli; `/user/profile` ve admin tenant logo yükleme ekranlarından **1 MB'tan büyük bir logo yüklenemiyor** (istek backend'e hiç ulaşmadan nginx `413` döner, uygulamada anlamsız bir hata olarak görünür). Bu bir **web kodu hatası değildir**, sunucu yapılandırmasıdır — detay ve çözüm `SarfiyumAPI/AGENTS.md` §5.2 **D2**. Kullanıcıdan logo yüklenmiyor şikâyeti gelirse önce buraya bak. |
| 2026-08-15 | **Adım 2 — Log gürültüsü & watchdog (backend).** Bu repoda **kod değişikliği yapılmadı** ve **davranış değişmedi**: yapılan iş yalnızca backend'in log seviyeleri ve Datshop soketinin watchdog'uydu; API sözleşmesi, `PriceData` DTO'su ve SignalR event'leri aynı kaldı. Dashboard'ın aldığı veri birebir aynıdır. Ortak yol haritası `SarfiyumAPI/AGENTS.md` §10.5'e kalıcı olarak eklendi; bu repoyu ilgilendiren adımlar §9'da özetlendi. |
| 2026-08-15 | **Adım 1 — Görünür bug'lar.** Bu repoda **kod değişikliği yapılmadı**, ancak backend'de yapılan iki düzeltme web dashboard'ının davranışını etkiliyor: (1) *Viewer grup senkronizasyonu (API M1)* — özel fiyatı olan bir viewer web panelinde artık iki farklı fiyat listesi alıp titremiyor, özel fiyatı silinince de fiyat akışı kesilmiyor. (2) *Sessiz `null` fiyat (API M4)* — çarpan/makas sonucu pozitif çıkmayan bir üründe fiyat artık `null` yerine gerçek değeriyle geliyor; dashboard'da boş yerine (muhtemelen negatif) bir sayı görünür. Bu **kasıtlı**: yanlış konfigürasyonun gizlenmemesi için. Böyle bir ürün varsa backend `[PRICE_CONFIG]` uyarısı logluyor. |
