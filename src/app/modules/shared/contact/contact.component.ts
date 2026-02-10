import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandingService } from '../../../core/services/branding-service'; // Servis yolunu kontrol et

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ContactComponent implements OnInit {

  // Servisi Inject Et
  public brandingService = inject(BrandingService);

  // HTML'de kullanacağımız veri objesi
  contactInfo = {
    appName: '',
    email: '',
    phoneDisplay: '',
    phoneLink: ''
  };

  ngOnInit(): void {
    const brand = this.brandingService.brand;

    // 1. İsim ve Mail bilgisini servisten al (Serviste tanımlamıştık)
    this.contactInfo.appName = brand.name;
    this.contactInfo.email = brand.email;

    // 2. Telefon bilgisini markaya göre ayarla
    if (brand.name === 'Çilçil Altın') {
      // --- ÇİLÇİL ALTIN ---
      this.contactInfo.phoneDisplay = '+90 531 360 54 74'; // ⚠️ Burayı müşterinin numarasıyla değiştir
      this.contactInfo.phoneLink = '+905313605474';       // Boşluksuz hali (arama için)
    } else {
      // --- SARFİYUM (Varsayılan) ---
      this.contactInfo.phoneDisplay = '+90 539 921 23 91';
      this.contactInfo.phoneLink = '+905399212391';
    }
  }
}