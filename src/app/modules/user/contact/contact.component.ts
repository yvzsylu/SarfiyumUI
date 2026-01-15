import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from './services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  // İstersen SCSS dosyasını da bağlayabilirsin
  styles: [`
    .hover-scale { transition: transform 0.2s; }
    .hover-scale:hover { transform: translateY(-3px); }
  `]
})
export class ContactComponent implements OnInit {
  
  private contactService = inject(ContactService);

  isLoading = true;
  whatsappNumber: string | null = null;
  formattedNumber: string = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.contactService.getContactInfo().subscribe({
      next: (res) => {
        this.whatsappNumber = res.whatsappNumber;
        if (this.whatsappNumber) {
          // Görsel formatlama (örn: +90 532 123 45 67)
          this.formattedNumber = '+' + this.whatsappNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        }
        this.isLoading = false;
      },
      error: () => {
        // Hata durumunda sadece loading'i kapat, UI'da "Bilgi bulunamadı" gösteririz
        this.isLoading = false;
      }
    });
  }

  openWhatsApp() {
    if (!this.whatsappNumber) return;
    
    // Web Whatsapp veya Mobil Uygulama tetikleme
    const url = `https://wa.me/+90${this.whatsappNumber}?text=Merhaba,%20destek%20almak%20istiyorum.`;
    window.open(url, '_blank');
  }
}