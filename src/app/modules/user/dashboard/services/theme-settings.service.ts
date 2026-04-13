import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeSettingsService {
  private http = inject(HttpClient);
  // Backend'de yazdığın controller route'unu buraya tanımla
  private apiUrl = `${environment.apiUrl}/customer/settings/theme`;

  getThemeSettings(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateThemeSettings(payload: any): Observable<any> {
    return this.http.put(this.apiUrl, payload);
  }
}