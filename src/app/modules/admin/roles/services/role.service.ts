import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';

// Backend'deki RoleDto ile eşleşmeli
export interface RoleDto {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private api = inject(BaseApiService);
  private endpoint = 'admin/role'; // Controller route'u

  // 1. Rolleri Listele
  getAllRoles() {
    return this.api.get<RoleDto[]>(this.endpoint);
  }

  // 2. Rol Oluştur
  // Backend [FromBody] string roleName bekliyor.
  // Angular'da string'i JSON olarak göndermek için tırnak içinde tırnak gerekebilir
  // veya en temiz yolu backend'i DTO'ya çevirmektir ama şimdilik string gönderiyoruz.
  createRole(roleName: string) {
    // Artık string değil, obje gönderiyoruz: { name: "Manager" }
    const data = { name: roleName }; 
    
    return this.api.post<string>(this.endpoint, data); 
  }

  // 3. Rol Güncelle
  updateRole(role: RoleDto) {
    return this.api.put<string>(this.endpoint, role);
  }

  deleteRole(id: string) {
  // Backend endpoint: DELETE api/admin/role/{id}
  return this.api.delete<string>(`${this.endpoint}/${id}`);
}
}