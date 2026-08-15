import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Yeni bir sürüm yayınlandığını fark edip sayfayı yeniler.
 *
 * **Neden gerekli:** Angular tek sayfa uygulaması olduğu için, bir kez yüklendikten sonra
 * tarayıcıdaki JavaScript kendini güncellemez. Yayın formatını değiştiren bir deploy'dan
 * sonra AÇIK duran sekmeler eski kodu çalıştırmaya devam eder ve fiyat listesi
 * "Veri bekleniyor" yazıp öyle kalır. Mağaza TV'leri günlerce yenilenmeden açık durduğu
 * için bu, başında kimse olmayan ekranların saatlerce boş kalması demektir.
 *
 * ⚠️ **Neden uygulama genelinde çalışıyor:** Kontrol yalnızca dashboard'da başlatıldığında
 * bir açık kapı kalıyordu. Giriş ekranında bekleyen eski bir sekmede kullanıcı giriş
 * yaptığında Angular sayfayı yeniden yüklemez, yalnızca rota değiştirir; `index.html` hiç
 * tekrar istenmediği için ESKİ kod dashboard'a taşınır ve ekran boş kalır. Bu yüzden servis
 * kök bileşende, hangi sayfada olunduğundan bağımsız olarak başlatılır.
 *
 * **Nasıl çalışıyor:** Angular her derlemede `main-XXXXXXXX.js` gibi içeriğe göre
 * hash'lenmiş dosya adları üretir ve bu ad `index.html` içinde geçer. Servis belirli
 * aralıklarla `index.html`'i tazeleyerek indirir, içindeki bundle adını sayfanın
 * yüklendiği andakiyle karşılaştırır; farklıysa yeni bir sürüm yayınlanmış demektir.
 *
 * ⚠️ **Sunucu tarafı ön koşul:** `index.html` `Cache-Control: no-cache` ile servis
 * edilmelidir (nginx D9). Aksi halde tarayıcı hep önbellekteki eski kopyayı verir,
 * bundle adı hiç değişmez ve bu kontrol asla tetiklenmez.
 *
 * Yenileme oturumu düşürmez: token cookie'de tutuluyor ve sayfa yenilemesi cookie'yi
 * silmez.
 */
@Injectable({ providedIn: 'root' })
export class AppVersionService {
  private document = inject(DOCUMENT);

  /** Sayfanın yüklendiği andaki bundle adı. */
  private loadedBundle: string | null = null;
  private timer: any = null;

  /**
   * "Şu an yenileme" diyen koşullar. Yeni sürüm bulunsa bile bunlardan biri `true`
   * dönüyorsa yenileme bir sonraki kontrole ertelenir.
   */
  private blockers = new Set<() => boolean>();

  /**
   * Sürüm takibini başlatır. Kök bileşenden bir kez çağrılır; tekrar çağrılması etkisizdir.
   *
   * @param intervalMs Kontrol aralığı.
   */
  start(intervalMs: number): void {
    if (this.timer) return;

    this.loadedBundle = this.readBundleFromDom();

    // Bundle adı okunamadıysa (beklenmedik bir index.html yapısı) sessizce devre dışı
    // kal — yanlış bir karşılaştırmayla sayfayı durmadan yenilemek çok daha kötü olurdu.
    if (!this.loadedBundle) return;

    this.timer = setInterval(() => this.check(), intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Yenilemenin ertelenmesi gereken bir durumu bildirir. Kullanıcı bir şey düzenliyorsa
   * (örn. renk düzenleyici açıksa) sayfayı altından çekmek yaptığı değişikliği kaybettirir.
   *
   * @returns Koşulu geri çeken fonksiyon; bileşen yok edilirken çağrılmalıdır.
   */
  blockWhile(condition: () => boolean): () => void {
    this.blockers.add(condition);
    return () => this.blockers.delete(condition);
  }

  private canReload(): boolean {
    for (const blocked of this.blockers) {
      if (blocked()) return false;
    }

    // Kullanıcı bir alana yazıyorsa (tipik olarak giriş formu) sayfayı yenilemek
    // yazdığını siler. TV'lerde odaklanmış bir giriş alanı bulunmadığı için asıl
    // hedeflenen senaryo bundan etkilenmez.
    const active = this.document.activeElement;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
      if (active.value) return false;
    }

    return true;
  }

  private async check(): Promise<void> {
    if (!this.canReload()) return;

    try {
      // `cache: 'no-store'` + sorgu parametresi: aradaki hiçbir katmanın bize eski
      // kopyayı vermediğinden emin oluyoruz.
      const res = await fetch(`/index.html?v=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;

      const html = await res.text();
      const latest = this.extractBundle(html);

      if (latest && latest !== this.loadedBundle) {
        // Yeni sürüm yayınlanmış. `location.reload()` index.html'i ve yeni bundle'ı getirir.
        this.stop();
        this.document.defaultView?.location.reload();
      }
    } catch {
      // Ağ hatası olağandır (kopukluk, deploy anı). Bir sonraki kontrolde tekrar denenir.
    }
  }

  private readBundleFromDom(): string | null {
    const scripts = Array.from(
      this.document.querySelectorAll<HTMLScriptElement>('script[src]')
    );

    for (const s of scripts) {
      const name = this.extractBundle(s.getAttribute('src') ?? '');
      if (name) return name;
    }

    return null;
  }

  /** `main-Z7FXC63L.js` biçimindeki ilk hash'li dosya adını döner. */
  private extractBundle(text: string): string | null {
    const match = text.match(/main-[A-Za-z0-9]+\.js/);
    return match ? match[0] : null;
  }
}
