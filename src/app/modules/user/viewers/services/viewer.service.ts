import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';
// DTO'ları Admin servisinden reuse ediyoruz (Aynı yapıdalar)
import { UserListDto, CreateUserDto, UpdateUserDto, UserDetailDto } from '@/app/modules/admin/users/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private api = inject(BaseApiService);
  
  // Backend'deki ViewerController rotası: [Route("api/user/[controller]")]
  private endpoint = 'user/viewer'; 

  // 1. Tüm İzleyicileri Getir
  getAllViewers(): Observable<UserListDto[]> {
    // Backend: GET api/user/viewer/list
    return this.api.get<UserListDto[]>(`${this.endpoint}/list`);
  }

  // 2. ID ile Tekil Getir (Edit sayfası için)
  getViewerById(id: string): Observable<UserDetailDto> {
    // Backend: GET api/user/viewer/{id}
    return this.api.get<UserDetailDto>(`${this.endpoint}/${id}`);
  }

  // 3. İzleyici Oluştur
  createViewer(data: CreateUserDto) {
    // Backend: POST api/user/viewer/create
    return this.api.post<string>(`${this.endpoint}/create`, data);
  }

  // 4. İzleyici Güncelle
  updateViewer(data: UpdateUserDto) {
    // Backend: PUT api/user/viewer/update
    return this.api.put<string>(`${this.endpoint}/update`, data);
  }

  // 5. Statü Değiştir
  updateStatus(id: string, isActive: boolean) {
    // Backend: PATCH api/user/viewer/status/{id}
    // Controller [FromBody] bool isActive bekliyorsa direkt değeri gönderiyoruz
    return this.api.patch<string>(`${this.endpoint}/status/${id}`, isActive);
  }

  // 6. İzleyici Sil
  deleteViewer(id: string) {
    // Backend: DELETE api/user/viewer/{id}
    return this.api.delete<string>(`${this.endpoint}/${id}`);
  }
}