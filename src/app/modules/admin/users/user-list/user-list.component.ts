
import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { UserService, RoleDto, UserListDto } from '../services/user.service'; // Servis yolunu kontrol et
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, NgbPaginationModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class UserListComponent {
  private userService = inject(UserService);

  title = 'Kullanıcı Listesi';
  users: UserListDto[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        console.log(data);

        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        // Hata mesajı BaseService ile gösterildi
      }
    });
  }

  // STATUS DEĞİŞTİRME
  onStatusChange(user: UserListDto, event: any) {
    const newStatus = event.target.checked; // true veya false

    // Servise gönder
    this.userService.updateStatus(user.id!, newStatus).subscribe({
      next: () => {
        // Başarılıysa modeldeki veriyi de güncelle (UI tutarlılığı için)
        user.isActive = newStatus;
        // BaseService zaten success toastr gösteriyor, ekstra bir şey yapmana gerek yok.
      },
      error: () => {
        // Hata olursa switch'i eski haline geri getir (Rollback UI)
        event.target.checked = !newStatus;
      }
    });
  }
  // Silme işlemi (İlerde eklersen diye taslak)
  deleteUser(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {

        // 1. Önce Servisi Çağırıyoruz (Backend'e git)
        this.userService.deleteUser(id).subscribe({
          next: () => {
            // 2. İşlem Başarılıysa Alert Göster
            Swal.fire(
              'Silindi!',
              'Kullanıcı başarıyla silindi.',
              'success'
            );

            // 3. Listeyi Yenile (Veritabanından güncel hali çek)
            this.loadUsers();
          },
          error: (err) => {
            // Hata olursa (Örn: Admin silinemez) BaseService toastr gösterir ama
            // Buradan da SweetAlert ile hata gösterebilirsin istersen.
            // Swal.fire('Hata', 'Silme işlemi başarısız', 'error');
          }
        });

      }
    });
  }
}


