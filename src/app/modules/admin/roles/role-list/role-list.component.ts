import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { RoleService, RoleDto } from '../services/role.service'; // Servis yolunu kontrol et
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, RouterLink],
  templateUrl: './role-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);

  title = 'Rol Listesi';
  roles: RoleDto[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.isLoading = true;
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        // Hata mesajı BaseService ile gösterildi
      }
    });
  }

  // Silme işlemi (İlerde eklersen diye taslak)
  deleteRole(id: string) {
  Swal.fire({
    title: 'Emin misiniz?',
    text: "Bu rolü silmek istediğinize emin misiniz? Bu işlem geri alınamaz!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Evet, Sil!',
    cancelButtonText: 'İptal'
  }).then((result) => {
    if (result.isConfirmed) {
      
      // 1. Önce Servisi Çağırıyoruz (Backend'e git)
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          // 2. İşlem Başarılıysa Alert Göster
          Swal.fire(
            'Silindi!',
            'Rol başarıyla silindi.',
            'success'
          );
          
          // 3. Listeyi Yenile (Veritabanından güncel hali çek)
          this.loadRoles(); 
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