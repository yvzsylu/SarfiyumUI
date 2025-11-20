export class User {
  id?: string | number
  username?: string
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  roles?: string[]; // JWT'den gelen roller
  token?: string
  isAdmin?: boolean
}
