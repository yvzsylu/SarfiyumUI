import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'remainingDays',
  standalone: true // Standalone component yapısı kullandığın için
})
export class RemainingDaysPipe implements PipeTransform {

  transform(value: string | Date | undefined | null): string {
    if (!value) return 'Abonelik Yok';

    const endDate = new Date(value);
    const now = new Date();

    // Saat farklarını yoksaymak için ikisini de gece yarısına çekelim
    endDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // Milisaniye farkını güne çevir
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Süre Doldu';
    } else if (diffDays === 0) {
      return 'Bugün Bitiyor';
    } else {
      return `${diffDays} Gün Kaldı`;
    }
  }

}