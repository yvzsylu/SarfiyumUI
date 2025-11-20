export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[]; // opsiyonel, ileride roller için
}