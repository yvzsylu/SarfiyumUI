import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ServiceResult } from '../models/service-result.model';
import Swal from 'sweetalert2'; 

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  // --- MERKEZİ TOAST BİLDİRİM FONKSİYONU ---
  private showToast(title: string, icon: 'success' | 'error' | 'warning' = 'success') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: icon,
      title: title,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  // GET İsteği
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<ServiceResult<T>>(`${this.apiUrl}/${endpoint}`).pipe(
      map((response) => this.handleSuccess(response, false)), // Get işlemlerinde sessiz kal
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

  // PATCH İsteği
  patch<T>(endpoint: string, data: any, showSuccessMessage: boolean = true): Observable<T> {
    return this.http.patch<ServiceResult<T>>(`${this.apiUrl}/${endpoint}`, data).pipe(
      map((response) => this.handleSuccess(response, showSuccessMessage)),
      catchError((error) => this.handleError(error))
    );
  }

  // --- YARDIMCI METOTLAR ---

  // Başarılı Cevap Yönetimi
  private handleSuccess<T>(response: ServiceResult<T>, showSuccessMessage: boolean): T {
    if (response.isSuccess) {
      if (showSuccessMessage) {
        // Modelde 'message' alanı olmadığı için standart bir mesaj gösteriyoruz.
        this.showToast('İşlem başarıyla tamamlandı.', 'success');
      }
      return response.data;
    } else {
      // Backend 200 OK döndü ama isSuccess: false dedi (Business logic hatası)
      // message alanı olmadığı için errors dizisine bakıyoruz
      const errorMsg = response.errors?.join('\n') || 'Bir hata oluştu';
      this.showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }
  }

  // Hata Yönetimi (400, 401, 500 vs.)
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Bilinmeyen bir hata oluştu.';

    if (error.error && typeof error.error === 'object') {
      // Bizim ServiceResult formatındaki hata
      // Hata nesnesini güvenli bir şekilde cast ediyoruz
      const serviceResult = error.error as ServiceResult<any>;
      
      if (serviceResult.errors && serviceResult.errors.length > 0) {
        // Errors dizisindeki mesajları birleştir
        errorMessage = serviceResult.errors.join('\n');
      } else if (serviceResult.isSuccess === false) {
         // Hata mesajı yoksa genel bir mesaj
         errorMessage = 'İşlem başarısız oldu.';
      }
    } else if (error.message) {
      // HTTP seviyesindeki standart mesaj (örn: Http failure response for...)
      errorMessage = error.message;
    }

    // Swal Toast Tetikleniyor
    this.showToast(errorMessage, 'error');
    
    return throwError(() => error);
  }
}