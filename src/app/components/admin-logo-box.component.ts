import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core'; // inject eklendi
import { RouterLink } from '@angular/router';
import { BrandingService } from '../core/services/branding-service'; // Dosya yolunu kontrol et

@Component({
  selector: 'app-admin-logo-box',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div [class]="className">
      
      <a routerLink="/admin/dashboard" class="logo-dark">
        @if (size) {
          <img [src]="brandingService.brand.logoSmPath" class="logo-sm" alt="logo sm" />
          
          <img
            [src]="brandingService.brand.logoDarkPath"
            class="logo-lg"
            alt="logo dark"
          />
        } @else {
          <img [src]="brandingService.brand.logoDarkPath" height="24" alt="logo dark" />
        }
      </a>

      <a routerLink="/admin/dashboard" class="logo-light">
        @if (size) {
          <img [src]="brandingService.brand.logoSmPath" class="logo-sm" alt="logo sm" />
          
          <img
            [src]="brandingService.brand.logoLightPath"
            class="logo-lg"
            alt="logo light"
          />
        } @else {
          <img
            [src]="brandingService.brand.logoLightPath"
            height="24"
            alt="logo light"
          />
        }
      </a>
    </div>
  `,
})
export class AdminLogoBoxComponent {
  @Input() className: string = '';
  @Input() size: boolean = false;

  // Servisi içeri alıyoruz
  public brandingService = inject(BrandingService);
}