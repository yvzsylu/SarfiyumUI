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
   * Sürüm takibini başlatır.
   *
   * @param intervalMs Kontrol aralığı.
   * @param canReload  Yenilemenin uygun olup olmadığını söyleyen koşul. Kullanıcı bir
   *                   şey düzenliyorsa (örn. renk düzenleyici açıksa) sayfayı ortasında
   *                   yenilemek veri kaybettirir; bu yüzden karar çağırana bırakıldı.
   */
  start(intervalMs: number, canReload: () => boolean = () => true): void {
    if (this.timer) return;

    this.loadedBundle = this.readBundleFromDom();

    // Bundle adı okunamadıysa (beklenmedik bir index.html yapısı) sessizce devre dışı
    // kal — yanlış bir karşılaştırmayla sayfayı durmadan yenilemek çok daha kötü olurdu.
    if (!this.loadedBundle) return;

    this.timer = setInterval(() => this.check(canReload), intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async check(canReload: () => boolean): Promise<void> {
    if (!canReload()) return;

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
