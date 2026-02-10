import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core'; // inject eklendi
import { CommonModule } from '@angular/common';
import { BrandingService } from '../../../core/services/branding-service'; // Servis yolunu kontrol et

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivacyPolicyComponent implements OnInit {
  
  // Servisi Inject Et
  public brandingService = inject(BrandingService);

  // HTML'de kullanılacak değişkenler
  appName: string = '';
  appEmail: string = '';
  appDomain: string = '';

  ngOnInit(): void {
    // 1. Marka ismini servisten al (Çilçil Altın veya Sarfiyum)
    const brand = this.brandingService.brand;
    this.appName = brand.name;

    // 2. İsime göre diğer bilgileri doldur
    if (brand.name === 'Çilçil Altın') {
      this.appEmail = 'info@cilcilaltin.com';
      this.appDomain = 'portal.cilcilaltin.com';
    } else {
      // Varsayılan (Sarfiyum)
      this.appEmail = 'info@sarfiyum.com';
      this.appDomain = 'sarfiyum.com';
    }
  }
}