import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';


export interface VisitorProductSettingDto {
  visitorId: string;
  tenantProductId: string;
  specialBuyMultiplier?: number | null;
  specialSellMultiplier?: number | null;
  specialAddonAmount?: number | null;
}

export interface VisitorProductSettingResponse {
  tenantProductId: string;
  specialBuyMultiplier?: number;
  specialSellMultiplier?: number;
  specialAddonAmount?: number;
  isActive: boolean;
}


// 1. LİSTELEME DTO'su
export interface UserListDto {
  id: string;
  fullName: string;
  email: string;
  username: string;
  tenantId: string | null;
  tenantName: string | null;
  isActive: boolean;
  roles: string[];
}

// 2. CREATE DTO'su
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleId: string;
  tenantId?: string | null;
}

// 3. UPDATE DTO'su (YENİ EKLENDİ - Edit işlemi için)
export interface UpdateUserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  password?: string | null; // Opsiyonel (Boşsa değişmez)
  roleId: string;
  tenantId?: string | null;
  isActive: boolean;
}

// 4. USER DETAY DTO'su (YENİ EKLENDİ - Backend'den tekil veri çekerken)
// (UserListDto ile aynı yapıdadır ama ayrım yapmak iyidir)
export interface UserDetailDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  tenantId?: string;
  roles: string[];
}

// Rol Atama DTO
export interface AssignRolesDto {
  roleNames: string[];
}

// Rol Listesi DTO
export interface RoleDto {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(BaseApiService);
  private endpoint = 'admin/account'; // Account Controller Route
  private roleEndpoint = 'admin/role';

  // 1. Tüm Kullanıcıları Getir
  getAllUsers(): Observable<UserListDto[]> {
    return this.api.get<UserListDto[]>(this.endpoint);
  }

  // 2. ID ile Tekil Kullanıcı Getir (YENİ - Edit sayfası için)
  getById(id: string): Observable<UserDetailDto> {
    // Backend: GET api/admin/account/{id}
    return this.api.get<UserDetailDto>(`${this.endpoint}/${id}`);
  }

  // 3. Kullanıcı Oluştur
  createUser(data: CreateUserDto) {
    // Backend: POST api/admin/account/create-user
    return this.api.post<string>(`${this.endpoint}/create-user`, data);
  }

  // 4. Kullanıcı Güncelle (YENİ)
  updateUser(data: UpdateUserDto) {
    // Backend: PUT api/admin/account/update-user
    return this.api.put<string>(`${this.endpoint}/update-user`, data);
  }

  // 5. Statü Değiştirme (Aktif/Pasif)
  updateStatus(id: string, isActive: boolean) {
    // Backend: PATCH api/admin/account/{id}/status
    return this.api.patch<string>(`${this.endpoint}/${id}/status`, { isActive });
  }

  // 6. Kullanıcı Silme
  deleteUser(id: string) {
    // Backend: DELETE api/admin/account/{id} (Eğer endpoint varsa)
    // Not: AccountController'da Delete metodunu henüz eklemediysen hata alabilirsin.
    // Genelde Identity silme işlemi için [HttpDelete("{id}")] endpointi açmalısın.
    return this.api.delete<string>(`${this.endpoint}/${id}`);
  }

  // 7. Tüm Sistem Rollerini Getir (Dropdown için)
  getAllRoles() {
    return this.api.get<RoleDto[]>(this.roleEndpoint);
  }

  // --- Diğer Yardımcı Metotlar (Varsa) ---
  
  // Bir kullanıcının mevcut rollerini getir
  getUserRoles(userId: string): Observable<string[]> {
    return this.api.get<string[]>(`${this.endpoint}/${userId}/roles`);
  }

  // Rol ata/güncelle (Eski yöntem, artık UpdateUser içinde de yapılıyor ama ayrı da kalabilir)
  assignRoles(userId: string, roles: string[]) {
    const data: AssignRolesDto = { roleNames: roles };
    return this.api.post<boolean>(`${this.endpoint}/${userId}/roles`, data);
  }
}