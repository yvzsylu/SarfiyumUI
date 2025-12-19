export type FAQType = {
  question: string;
  answer: string;
};

export type FAQDataType = {
  title: string;
  faqs: FAQType[];
};

export const FaqData: FAQDataType[] = [
  {
    title: 'Genel & Güvenlik',
    faqs: [
      {
        question: 'Sarfiyum verilerimi nasıl saklıyor, güvenli mi?',
        answer:
          'Evet, verileriniz banka düzeyinde şifreleme (SSL) ile korunmaktadır. Tüm stok ve cari verileriniz bulut sunucularımızda günlük olarak yedeklenir, böylece bilgisayarınız bozulsa bile verileriniz kaybolmaz.',
      },
      {
        question: 'Sistemi kullanmak için kurulum yapmam gerekir mi?',
        answer:
          'Hayır, Sarfiyum tamamen bulut tabanlı bir SaaS (Hizmet olarak Yazılım) projesidir. İnterneti olan herhangi bir bilgisayar, tablet veya telefondan tarayıcı üzerinden giriş yapabilirsiniz.',
      },
      {
        question: 'İnternetim kesilirse ne olur?',
        answer:
          'Sarfiyum bulut tabanlı çalıştığı için internet bağlantısı gerektirir. Ancak mobil uyumluluğu sayesinde, mağaza interneti kesilse bile cep telefonunuzun internetiyle işlemlerinize devam edebilirsiniz.',
      },
    ],
  },
  {
    title: 'Stok & Ürün Yönetimi',
    faqs: [
      {
        question: 'Barkod yazıcısı ile entegre çalışıyor mu?',
        answer:
          'Evet, Sarfiyum piyasadaki yaygın barkod yazıcıları (Zebra, Argox vb.) ile uyumludur. Ürünlerinize otomatik barkod oluşturabilir ve etiket basabilirsiniz.',
      },
      {
        question: 'Altın ve döviz kurları otomatik güncelleniyor mu?',
        answer:
          'Evet, sistemimiz canlı piyasa verileriyle entegredir. Has altın, dolar ve euro kurlarını anlık olarak çeker, böylece vitrin değerinizi güncel fiyatlar üzerinden görebilirsiniz.',
      },
      {
        question: 'Pırlanta ve sertifikalı ürün takibi yapabilir miyim?',
        answer:
          'Kesinlikle. Pırlanta ürünler için karat, renk, berraklık gibi 4C özelliklerini girebilir ve sertifika numarasıyla takip sağlayabilirsiniz.',
      },
    ],
  },
  {
    title: 'Cari & Muhasebe',
    faqs: [
      {
        question: 'Veresiye defterimi buraya aktarabilir miyim?',
        answer:
          'Müşteri carilerinizi sisteme kolayca ekleyebilirsiniz. Müşterinin hem TL, hem Dolar, hem de Has Altın borcunu ayrı ayrı takip edebilirsiniz.',
      },
      {
        question: 'Fatura kesebiliyor muyum?',
        answer:
          'Evet, e-Fatura ve e-Arşiv entegrasyonlarımız sayesinde satış yaptığınız anda faturanızı oluşturup müşterinize iletebilirsiniz.',
      },
    ],
  },
  {
    title: 'Destek & Üyelik',
    faqs: [
      {
        question: 'Programı kullanmayı öğrenmek zor mu?',
        answer:
          'Sarfiyum, kullanıcı dostu arayüzü ile tasarlanmıştır. Ayrıca "Yardım Merkezi" bölümündeki eğitim videolarımız ve 7/24 WhatsApp destek hattımız ile her zaman yanınızdayız.',
      },
      {
        question: 'Fiyatlandırma nasıl çalışıyor?',
        answer:
          'Aylık veya yıllık abonelik modellerimiz mevcuttur. İlk 14 gün ücretsiz deneyebilir, memnun kalırsanız size uygun paketi seçerek devam edebilirsiniz.',
      },
    ],
  },
];