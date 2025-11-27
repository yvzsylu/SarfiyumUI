import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileService, UserProfileDto } from './services/profile.service';
import { environment } from '../../../../environments/enviroment'; // Yolunu kontrol et (environment.ts)
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    PersonalInfoComponent, 
    NgbDropdownModule
  ],
  templateUrl: './profile.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private toastr = inject(ToastrService);

  profileData: UserProfileDto | null = null;
  isLoading = false;
  isUploading = false;

  // API Kök Dizini (Resimler için)
  // Örn: https://localhost:7140/api -> https://localhost:7140
  public apiRoot = environment.apiUrl.replace('/api', '');

  get initials(): string {
    if (!this.profileData?.fullName) return '';
    const names = this.profileData.fullName.split(' ');
    return names.length > 1 
      ? (names[0][0] + names[1][0]).toUpperCase() 
      : names[0].substring(0, 2).toUpperCase();
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.profileService.getProfileInfo().subscribe({
      next: (res) => {
        this.profileData = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      // Validasyon (Örn: 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.toastr.warning("Dosya boyutu 2MB'dan büyük olamaz!");
        return;
      }
      
      // Sadece resim kontrolü
      if (!file.type.startsWith('image/')) {
         this.toastr.warning("Lütfen geçerli bir resim dosyası seçiniz.");
         return;
      }

      this.uploadLogo(file);
    }
  }

  uploadLogo(file: File) {
    this.isUploading = true;
    this.profileService.uploadLogo(file).subscribe({
      next: (newLogoUrl) => {
        this.isUploading = false;
        this.toastr.success("Logo başarıyla güncellendi.");
        
        // Sayfayı yenilemeden logoyu anlık güncelle
        if (this.profileData) {
            // Cache sorununu aşmak için sonuna timestamp ekleyebiliriz
            this.profileData.tenantLogoUrl = newLogoUrl + '?t=' + new Date().getTime();
        }
      },
      error: () => {
        this.isUploading = false;
        this.toastr.error("Logo yüklenirken bir hata oluştu.");
      }
    });
  }
}