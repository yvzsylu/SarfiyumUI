import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // HTML'de değişken kullanmak için gerekli

@Component({
  selector: 'app-privacy-policy',
  standalone: true, // Eğer standalone kullanıyorsan
  imports: [CommonModule], 
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivacyPolicyComponent implements OnInit {
  
  // Varsayılan Değerler (Sarfiyum)
  appName: string = 'Sarfiyum';
  appEmail: string = 'info@sarfiyum.com';
  appDomain: string = 'sarfiyum.com';

  ngOnInit(): void {
    // Tarayıcı ortamında çalışıp çalışmadığımızı kontrol edelim (SSR hatası almamak için)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      // Eğer domain "cilcilaltin" içeriyorsa
      if (hostname.includes('cilcilaltin')) {
        this.appName = 'Çilçil Altın';
        this.appEmail = 'info@cilcilaltin.com'; // Müşteri maili yoksa info@sarfiyum kalabilir
        this.appDomain = 'portal.cilcilaltin.com';
      }
      // Gelecekte başka müşteri eklemek istersen:
      // else if (hostname.includes('baskakuyumcu')) { ... }
    }
  }
}