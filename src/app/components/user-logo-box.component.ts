import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core'; // inject eklendi
import { RouterLink } from '@angular/router';
import { BrandingService } from '../core/services/branding-service'; // Servis importu

@Component({
  selector: 'app-user-logo-box',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div [class]="className">
      
      <a routerLink="/user/dashboard" class="logo-dark">
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

      <a routerLink="/user/dashboard" class="logo-light">
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
export class UserLogoBoxComponent {
  @Input() className: string = '';
  @Input() size: boolean = false;

  // Servisi inject et
  public brandingService = inject(BrandingService);
}