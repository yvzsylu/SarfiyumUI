import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // 🔥 Modal servisi eklendi

// Servisler ve Modeller
import { ViewerService } from '../services/viewer.service';
import { UserListDto } from '@/app/modules/admin/users/services/user.service';
import { VisitorPricingModalComponent } from '../components/visitor-pricing-modal/visitor-pricing-modal.component'; // 🔥 Component Import (Yolu kontrol et)

@Component({
  selector: 'app-viewer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './viewer-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewerListComponent implements OnInit {
  private viewerService = inject(ViewerService);
  private modalService = inject(NgbModal); // 🔥 Inject edildi
  
  viewers: UserListDto[] = [];
  isLoading = false;

  ngOnInit() { 
    this.loadViewers(); 
  }

  loadViewers() {
    this.isLoading = true;
    this.viewerService.getAllViewers().subscribe({
      next: (data) => { 
        this.viewers = data; 
        this.isLoading = false; 
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // 🔥 YENİ METOD: Özel Fiyat Modalını Aç
  openPricingModal(viewer: UserListDto) {
    const modalRef = this.modalService.open(VisitorPricingModalComponent, { 
      size: 'xl', // Geniş ekran
      centered: true,
      scrollable: true,
      backdrop: 'static' // Dışarı tıklayınca kapanmasın (opsiyonel)
    });

    // Modal içine veri gönderiyoruz
    modalRef.componentInstance.visitorId = viewer.id;
    modalRef.componentInstance.visitorName = viewer.fullName;

    // Modal kapandığında yapılacak işlem (Opsiyonel)
    modalRef.result.then((result) => {
      if (result === 'saved') {
        // Gerekirse bir işlem yapılabilir
        console.log('Fiyatlar güncellendi.');
      }
    }).catch(() => {
      // Modal dismiss edildi (vazgeçildi)
    });
  }

  onStatusChange(item: UserListDto, event: any) {
    const newVal = event.target.checked;
    
    this.viewerService.updateStatus(item.id!, newVal).subscribe({
      next: () => {
        item.isActive = newVal;
      },
      error: () => {
        // Hata durumunda switch'i eski haline getir
        event.target.checked = !newVal;
        Swal.fire('Hata', 'Durum değiştirilemedi.', 'error');
      }
    });
  }

  deleteViewer(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu izleyici hesabı silinecek! Geri alınamaz.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
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
             Swal.fire('Hata', 'Silme işlemi başarısız.', 'error');
          }
        });
      }
    });
  }
}