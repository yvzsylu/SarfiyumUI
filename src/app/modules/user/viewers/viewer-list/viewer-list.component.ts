import { Component,CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

// Servisler ve Modeller
import { ViewerService } from '../services/viewer.service';
import { UserListDto } from '@/app/modules/admin/users/services/user.service'; // UserListDto yolunu kontrol et

@Component({
  selector: 'app-viewer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './viewer-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class ViewerListComponent implements OnInit {
  private viewerService = inject(ViewerService);
  
  viewers: UserListDto[] = [];
  isLoading = false;

  ngOnInit() { 
    this.loadViewers(); 
  }


  loadViewers() {
    this.isLoading = true;
    this.viewerService.getAllViewers().subscribe({
      next: (data) => { 
        console.log(data);
        this.viewers = data; 
        this.isLoading = false; 
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onStatusChange(item: UserListDto, event: any) {
    const newVal = event.target.checked;
    
    this.viewerService.updateStatus(item.id!, newVal).subscribe({
      next: () => {
        item.isActive = newVal;
        // Opsiyonel: Toastr success mesajı
      },
      error: () => {
        // Hata durumunda switch'i eski haline getir
        event.target.checked = !newVal;
      }
    });
  }

  deleteViewer(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu izleyici hesabı silinecek! Geri alınamaz.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal'
    }).then(res => {
      if (res.isConfirmed) {
        this.viewerService.deleteViewer(id).subscribe({
          next: () => {
            Swal.fire('Silindi', 'Hesap başarıyla silindi.', 'success');
            this.loadViewers();
          },
          error: (err) => {
            // Hata mesajı servisten veya interceptor'dan yönetilebilir
          }
        });
      }
    });
  }
}