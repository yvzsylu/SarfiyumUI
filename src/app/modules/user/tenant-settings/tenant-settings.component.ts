import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantSettingsService, UpdateTenantSettingsDto } from './services/tenant-settings.service';
// 🔥 1. IMPORTLAR EKLENDİ
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  // 🔥 2. IMPORTS'A NgxMaskDirective EKLENDİ
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  // 🔥 3. PROVIDERS EKLENDİ (Standalone olduğu için buraya ekliyoruz)
  providers: [provideNgxMask()],
  templateUrl: './tenant-settings.component.html',
  styleUrls: ['./tenant-settings.component.scss']
})
export class TenantSettingsComponent implements OnInit {
  
  private settingsService = inject(TenantSettingsService);

  isLoading = false;
  isSaving = false;

  // Model
  whatsAppNumber: string = '';

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        // Backend'den gelen veri örn: "905551234567"
        this.whatsAppNumber = res.whatsAppNumber || ''; 
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  saveSettings() {
    if (this.isSaving) return;

    this.isSaving = true;
    // Maske kullanıldığı için veri zaten temizlenmiş (ör: 90555...) olarak gelir
    const cleanNumber = this.whatsAppNumber; 

    const dto: UpdateTenantSettingsDto = {
      whatsAppNumber: cleanNumber
    };

    this.settingsService.updateSettings(dto).subscribe({
      next: () => {
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }
}