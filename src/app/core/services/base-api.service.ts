import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment'; // apiUrl buradan gelecek
import { ServiceResult } from '../models/service-result.model';

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private apiUrl = environment.apiUrl; // örn: https://localhost:7140/api

  // GET İsteği
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<ServiceResult<T>>(`${this.apiUrl}/${endpoint}`).pipe(
      map((response) => this.handleSuccess(response, false)), // Get işlemlerinde genelde success mesajı gösterilmez
      catchError((error) => this.handleError(error))
    );
  }

  // POST İsteği
  post<T>(endpoint: string, data: any, showSuccessMessage: boolean = true): Observable<T> {
    return this.http.post<ServiceResult<T>>(`${this.apiUrl}/${endpoint}`, data).pipe(
      map((response) => this.handleSuccess(response, showSuccessMessage)),
      catchError((error) => this.handleError(error))
    );
  }

  // PUT İsteği
  put<T>(endpoint: string, data: any, showSuccessMessage: boolean = true): Observable<T> {
    return this.http.put<ServiceResult<T>>(`${this.apiUrl}/${endpoint}`, data).pipe(
      map((response) => this.handleSuccess(response, showSuccessMessage)),
      catchError((error) => this.handleError(error))
    );
  }

  // DELETE İsteği
  delete<T>(endpoint: string, showSuccessMessage: boolean = true): Observable<T> {
    return this.http.delete<ServiceResult<T>>(`${this.apiUrl}/${endpoint}`).pipe(
      map((response) => this.handleSuccess(response, showSuccessMessage)),
      catchError((error) => this.handleError(error))
    );
  }

  // --- YENİ EKLENECEK KISIM ---
  // PATCH İsteği (Kısmi Güncelleme)
  patch<T>(endpoint: string, data: any, showSuccessMessage: boolean = true): Observable<T> {
    return this.http.patch<ServiceResult<T>>(`${this.apiUrl}/${endpoint}`, data).pipe(
      map((response) => this.handleSuccess(response, showSuccessMessage)),
      catchError((error) => this.handleError(error))
    );
  }

  // --- YARDIMCI METOTLAR ---

  // Başarılı Cevap Yönetimi
  private handleSuccess<T>(response: ServiceResult<T>, showToast: boolean): T {
    if (response.isSuccess) {
      if (showToast) {
        this.toastr.success('İşlem başarıyla tamamlandı.');
      }
      return response.data;
    } else {
      // Backend 200 dönüp isSuccess: false dediyse (Nadir durum)
      const errorMsg = response.errors?.join('<br>') || 'Bir hata oluştu';
      this.toastr.error(errorMsg, 'Hata');
      throw new Error(errorMsg);
    }
  }

  // Hata Yönetimi (400, 401, 500 vs.)
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Bilinmeyen bir hata oluştu.';

    if (error.error && typeof error.error === 'object') {
      // Bizim ServiceResult formatındaki hata
      const serviceResult = error.error as ServiceResult<any>;
      
      if (serviceResult.errors && serviceResult.errors.length > 0) {
        // Tüm hataları alt alta göster
        errorMessage = serviceResult.errors.join('<br>');
      } else if (serviceResult.isSuccess === false) {
         errorMessage = 'İşlem başarısız oldu.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // HTML içerik (br tag) desteklemesi için enableHtml true olmalı (Toastr config)
    this.toastr.error(errorMessage, 'Hata', { enableHtml: true });
    
    return throwError(() => error);
  }
}