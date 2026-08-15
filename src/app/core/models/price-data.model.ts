/**
 * Sunucudan gelen fiyat satırı.
 *
 * Backend sözleşmesi 2026-08-15'te değişti (API AGENTS.md Adım 5):
 *  - `id` eklendi. Ürün eşleştirmesi artık BUNUNLA yapılır. Öncesinde
 *    `KATEGORİADI_ÜRÜNADI` string anahtarı kullanılıyordu; kuyumcu ürün adını
 *    değiştirdiğinde ayarlar sessizce sıfırlanıyor, aynı isimli iki ürün
 *    çakışıyordu (bulgu W13).
 *  - `sourceKey` eklendi (Datshop sembolü). Özel gösterim gerektiren ürünleri
 *    ada göre metin araması yapmadan bulmayı sağlar.
 *  - `description` KALDIRILDI — `symbol` ile birebir aynıydı, her satırda ürün adı
 *    iki kez gidiyordu.
 *  - `source` KALDIRILDI — her satırda sabit "Sarfiyum" yazısıydı.
 *  - Satır başına `timestamp` KALDIRILDI — artık mesaj başına tek `ts` var.
 *  - Görünürlük (`ShowOnWeb`) filtresi SUNUCUDA uygulanıyor; bu listede zaten
 *    yalnızca web'de görünmesi gereken ürünler gelir.
 */
export interface PriceData {
  id: string;
  symbol: string;
  sourceKey: string;
  category: string;
  categoryIndex: number;
  bid: number | null; // Alış
  ask: number | null; // Satış
  orderIndex: number;

  // UI için değişim yönü (opsiyonel)
  direction?: 'up' | 'down' | 'stable';
}

/** Tam liste mesajı — `ReceivePriceSnapshot`. */
export interface PriceSnapshot {
  /**
   * Mesajın ait olduğu yayın akışı. `seq` numaraları akış başına ilerlediği için,
   * istemci akış değiştiğinde (örn. viewer'a özel fiyat tanımlanınca) sıra takibini
   * sıfırlamak zorunda — aksi halde eski akışın yolda kalan mesajı yenilerini bloklar.
   */
  feed: string;
  ts: string;
  seq: number;
  items: PriceData[];
}

/** Yalnızca fiyatı oynayan satırlar — `ReceivePriceDelta`. */
export interface PriceChange {
  id: string;
  bid: number | null;
  ask: number | null;
}

export interface PriceDelta {
  /** Bkz. {@link PriceSnapshot.feed}. Farklı bir akışa ait delta uygulanmaz. */
  feed: string;
  ts: string;
  seq: number;
  changed: PriceChange[];
}
