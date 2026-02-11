import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// Dosya yolunu kendi proje yapına göre kontrol etmeyi unutma
import { BrandingService } from '../../../core/services/branding-service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivacyPolicyComponent {
  // HTML'den erişebilmek için 'public' olarak inject ediyoruz
  public brandingService = inject(BrandingService);
}