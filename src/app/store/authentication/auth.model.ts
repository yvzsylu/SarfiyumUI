export class User {
  id?: string | number
  username?: string
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  fullName?: string; 
  tenantId?: string;
  tenantName?: string;
  tenantLogoUrl?: string; // Firma logosu için URL
  roles?: string[]; // JWT'den gelen roller
  token?: string
  isAdmin?: boolean
}
