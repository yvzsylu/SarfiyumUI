import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { User } from '@/app/store/authentication/auth.model';
import { Observable } from 'rxjs';

// Backend'den gelecek User listesi DTO'su (AppUser'daki IsActive alanı ekli)
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

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleId : string;
  tenantId?: string;
}


// Backend'e gidecek rol atama DTO'su
export interface AssignRolesDto {
  roleNames: string[];
}

// Rol yönetimi için mevcut rollerin listesi
export interface RoleDto {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(BaseApiService);
  private endpoint = 'admin/account';
  private roleEndpoint = 'admin/role';

  // 1. Tüm Kullanıcıları Getir
  getAllUsers(): Observable<UserListDto[]> {
    return this.api.get<UserListDto[]>(this.endpoint);
  }

  // 2. Bir kullanıcının mevcut rollerini getir
  getUserRoles(userId: string): Observable<string[]> {
    return this.api.get<string[]>(`${this.endpoint}/${userId}/roles`);
  }

  // 3. Rol ata/güncelle
  assignRoles(userId: string, roles: string[]) {
    const data: AssignRolesDto = { roleNames: roles };
    return this.api.post<boolean>(`${this.endpoint}/${userId}/roles`, data);
  }

  // 4. Tüm sistem rollerini getir (Role Atama Modalı için gerekli)
  getAllRoles() {
    return this.api.get<RoleDto[]>(this.roleEndpoint);
  }

  // 5. Kullanıcı statüsünü değişirme
  updateUserStatus(userId: string, isActive: boolean) {
    return this.api.patch<boolean>(`${this.endpoint}/${userId}/status`, { isActive });
  }

  deleteUser(id: string) {
  // Backend endpoint: DELETE api/admin/user/{id}
  return this.api.delete<string>(`${this.endpoint}/${id}`);
}
// STATUS GÜNCELLEME (PATCH)
  updateStatus(id: string, isActive: boolean) {
    return this.api.patch<string>(`${this.endpoint}/${id}/status`, { isActive });
  }

  createUser(data: CreateUserDto) {
      return this.api.post<string>(`${this.endpoint}/create-user`, data);
  }
}
