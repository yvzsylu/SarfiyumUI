import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDecimalComma]',
  standalone: true
})
export class DecimalCommaDirective {
  // İzin verilen tuşlar
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
  
  // Virgülden sonra izin verilen basamak sayısı
  private decimalLimit = 10; 

  constructor(private el: ElementRef) { }

  // --- 1. TUŞLAMA KONTROLÜ (Mevcut Logic) ---
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1 || (event.ctrlKey || event.metaKey)) {
      return;
    }

    const current: string = this.el.nativeElement.value;
    const cursorPosition = this.el.nativeElement.selectionStart;

    // Nokta -> Virgül
    if (event.key === '.' || event.code === 'NumpadDecimal') {
      event.preventDefault();
      if (current.indexOf(',') !== -1) return;
      this.insertAtCursor(',');
      return;
    }

    // Virgül
    if (event.key === ',') {
      if (current.indexOf(',') !== -1) event.preventDefault();
      return;
    }

    // Rakam Kontrolü
    if (!String(event.key).match(/[0-9]/)) {
      event.preventDefault();
      return;
    }

    // Ondalık Limit Kontrolü
    const commaIndex = current.indexOf(',');
    if (commaIndex !== -1 && cursorPosition! > commaIndex) {
      const decimalPart = current.substring(commaIndex + 1);
      if (decimalPart.length >= this.decimalLimit && 
          this.el.nativeElement.selectionStart === this.el.nativeElement.selectionEnd) {
        event.preventDefault();
      }
    }
  }

  // --- 2. YAPIŞTIRMA (PASTE) KONTROLÜ (YENİ EKLENEN) ---
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    // 1. Varsayılan yapıştırmayı durdur (Biz yöneteceğiz)
    event.preventDefault();

    // 2. Panodaki veriyi al
    let pastedText = event.clipboardData?.getData('text/plain');
    if (!pastedText) return;

    // 3. Temizlik: Noktayı virgüle çevir, sayı ve virgül dışındakileri sil
    pastedText = pastedText.replace(/\./g, ',').replace(/[^0-9,]/g, '');

    // 4. Geleceği Görme: Yapıştırırsak ne olacak?
    const input = this.el.nativeElement;
    const currentVal = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Mevcut değerin seçili kısmını silip yerine yapıştırılanı koyduğumuzu hayal edelim
    const nextVal = currentVal.substring(0, start) + pastedText + currentVal.substring(end);

    // 5. KURALLARI KONTROL ET
    
    // Kural A: Birden fazla virgül olamaz
    if ((nextVal.match(/,/g) || []).length > 1) return;

    // Kural B: Virgülden sonra limit aşılmamalı
    const commaIndex = nextVal.indexOf(',');
    if (commaIndex !== -1) {
      const decimalPart = nextVal.substring(commaIndex + 1);
      if (decimalPart.length > this.decimalLimit) return; // Limit aşılıyor, yapıştırma!
    }

    // 6. Her şey yolundaysa yapıştır
    this.insertAtCursor(pastedText);
  }

  // Yardımcı Metod
  private insertAtCursor(myValue: string) {
    const input = this.el.nativeElement;
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    
    input.value = input.value.substring(0, startPos) + myValue + input.value.substring(endPos, input.value.length);
    
    const newCursorPos = startPos + myValue.length;
    input.setSelectionRange(newCursorPos, newCursorPos);
    
    input.dispatchEvent(new Event('input'));
  }
}