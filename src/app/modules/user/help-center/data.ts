type HelpType = {
  title: string;
  description: string;
  icon: string;
};

export const HelpList: HelpType[] = [
  {
    title: 'Sarfiyum\'a Başlarken',
    description: 'Hesap kurulumu, mağaza tanımlama ve ilk ayarlar rehberi.',
    icon: 'solar:rocket-2-bold',
  },
  // {
  //   title: 'Stok ve Ürün Yönetimi',
  //   description: 'Altın, pırlanta ve diğer ürünlerin sisteme girişi ve barkodlama işlemleri.',
  //   icon: 'solar:box-minimalistic-bold',
  // },
  // {
  //   title: 'Cari Hesaplar & Müşteriler',
  //   description: 'Müşteri borç/alacak takibi ve veresiye defteri yönetimi.',
  //   icon: 'solar:users-group-rounded-bold',
  // },
  // {
  //   title: 'Finans ve Raporlama',
  //   description: 'Günlük kasa raporları, kar/zarar analizleri ve muhasebe dökümleri.',
  //   icon: 'solar:chart-square-bold',
  // },
  {
    title: 'Hesap Ayarları & Güvenlik',
    description: 'Şifre değişikliği, personel yetkilendirme ve rol atamaları.',
    icon: 'solar:shield-keyhole-bold',
  },
  {
    title: 'Teknik Destek & İletişim',
    description: 'Sistem hataları bildirme veya canlı destek talebi oluşturma.',
    icon: 'solar:headphones-round-bold',
  },
];