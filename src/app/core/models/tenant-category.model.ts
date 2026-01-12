export interface TenantCategory {
  id: string;
  name: string;
  orderIndex: number;
}

export interface UpdateCategoryNameDto {
  name: string;
}