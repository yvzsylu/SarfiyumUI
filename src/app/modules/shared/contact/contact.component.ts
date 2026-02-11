import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// Dosya yolunu kendi proje yapına göre kontrol etmeyi unutma
import { BrandingService } from '../../../core/services/branding-service'; 

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ContactComponent {
  // HTML'den erişebilmek için 'public' olarak inject ediyoruz
  public brandingService = inject(BrandingService);
}